import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '@food-platform/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  merchantId?: string;
}

export function setupSocketHandlers(io: SocketServer) {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        // Allow anonymous connections for public order tracking
        return next();
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        sessionId: string;
      };
      
      const session = await prisma.session.findUnique({
        where: { id: decoded.sessionId },
        include: { user: true },
      });
      
      if (session && session.expiresAt >= new Date()) {
        socket.userId = session.userId;
        
        // Check if user is merchant staff
        const merchantStaff = await prisma.merchantStaff.findFirst({
          where: { userId: session.userId },
          select: { merchantId: true },
        });
        
        if (merchantStaff) {
          socket.merchantId = merchantStaff.merchantId;
        }
      }
      
      next();
    } catch (error) {
      // Allow connection even if auth fails (for public order tracking)
      next();
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id}, user: ${socket.userId || 'anonymous'}`);
    
    // Join merchant room if merchant
    if (socket.merchantId) {
      socket.join(`merchant:${socket.merchantId}`);
      console.log(`Socket ${socket.id} joined merchant room: ${socket.merchantId}`);
    }
    
    // Join admin room if admin
    if (socket.userId) {
      const user = await prisma.user.findUnique({
        where: { id: socket.userId },
        select: { role: true },
      });
      
      if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        socket.join('admin');
        console.log(`Socket ${socket.id} joined admin room`);
      }
    }
    
    // Subscribe to order updates
    socket.on('subscribe:order', async (orderId: string) => {
      // Verify access
      if (socket.userId) {
        const order = await prisma.order.findFirst({
          where: {
            id: orderId,
            OR: [
              { userId: socket.userId },
              { merchantId: socket.merchantId || '' },
            ],
          },
          select: { id: true },
        });
        
        if (order) {
          socket.join(`order:${orderId}`);
          console.log(`Socket ${socket.id} subscribed to order: ${orderId}`);
        }
      } else {
        // Allow anonymous subscription for public tracking (with order number)
        socket.join(`order:${orderId}`);
      }
    });
    
    // Unsubscribe from order updates
    socket.on('unsubscribe:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`Socket ${socket.id} unsubscribed from order: ${orderId}`);
    });
    
    // Handle order message
    socket.on('order:message', async (data: { orderId: string; message: string }) => {
      if (!socket.userId) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }
      
      try {
        // Verify access
        const order = await prisma.order.findFirst({
          where: {
            id: data.orderId,
            OR: [
              { userId: socket.userId },
              { merchantId: socket.merchantId || '' },
            ],
          },
          select: { id: true, userId: true, merchantId: true },
        });
        
        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }
        
        const senderType = order.userId === socket.userId ? 'user' : 'merchant';
        
        // Create message
        const message = await prisma.orderMessage.create({
          data: {
            orderId: data.orderId,
            senderId: socket.userId,
            senderType,
            message: data.message,
          },
        });
        
        // Broadcast to order room
        io.to(`order:${data.orderId}`).emit('message:new', {
          orderId: data.orderId,
          message,
        });
        
        // Also emit to merchant room if sender is user
        if (senderType === 'user') {
          io.to(`merchant:${order.merchantId}`).emit('message:new', {
            orderId: data.orderId,
            message,
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Typing indicator
    socket.on('order:typing', (data: { orderId: string; isTyping: boolean }) => {
      socket.to(`order:${data.orderId}`).emit('order:typing', {
        orderId: data.orderId,
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });
    
    // Mark messages as read
    socket.on('order:messages:read', async (data: { orderId: string }) => {
      if (!socket.userId) return;
      
      try {
        await prisma.orderMessage.updateMany({
          where: {
            orderId: data.orderId,
            senderId: { not: socket.userId },
            readAt: null,
          },
          data: { readAt: new Date() },
        });
        
        io.to(`order:${data.orderId}`).emit('order:messages:read', {
          orderId: data.orderId,
          readBy: socket.userId,
          readAt: new Date(),
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
    
    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
  
  console.log('Socket.io handlers initialized');
}

// Helper function to emit order updates
export function emitOrderUpdate(io: SocketServer, orderId: string, update: {
  status: string;
  timestamp?: Date;
  [key: string]: unknown;
}) {
  io.to(`order:${orderId}`).emit('order:updated', {
    orderId,
    ...update,
    timestamp: update.timestamp || new Date(),
  });
}

// Helper function to emit SLA warning
export function emitSLAWarning(io: SocketServer, merchantId: string, warning: {
  orderId: string;
  orderNumber: string;
  deadlineType: 'accept' | 'ready';
  remainingSeconds: number;
}) {
  io.to(`merchant:${merchantId}`).emit('order:sla:warning', warning);
}

// Helper function to emit new order to merchant
export function emitNewOrder(io: SocketServer, merchantId: string, order: unknown) {
  io.to(`merchant:${merchantId}`).emit('order:new', { order });
}

