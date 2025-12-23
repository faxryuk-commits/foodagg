import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { errorHandler, notFoundHandler } from './middleware/error';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { merchantsRouter } from './routes/merchants';
import { ordersRouter } from './routes/orders';
import { merchantOrdersRouter } from './routes/merchant-orders';
import { menuRouter } from './routes/menu';
import { reviewsRouter } from './routes/reviews';
import { adminRouter } from './routes/admin';
import { scrapingRouter } from './routes/scraping';
import { setupSocketHandlers } from './socket';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: [
      process.env.USER_APP_URL || 'http://localhost:3000',
      process.env.MERCHANT_APP_URL || 'http://localhost:3001',
      process.env.ADMIN_PANEL_URL || 'http://localhost:3002',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available in routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.USER_APP_URL || 'http://localhost:3000',
      process.env.MERCHANT_APP_URL || 'http://localhost:3001',
      process.env.ADMIN_PANEL_URL || 'http://localhost:3002',
    ],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/merchants', merchantsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/merchant/orders', merchantOrdersRouter);
app.use('/api/merchant/menu', menuRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/scraping', scrapingRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.io handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.API_PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

export { app, io };

