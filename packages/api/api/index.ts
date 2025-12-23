import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple health check for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'Food Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    note: 'For full API functionality, deploy to Railway/Render/Fly.io',
    endpoints: {
      health: '/api',
      docs: 'Coming soon',
    },
  });
}

