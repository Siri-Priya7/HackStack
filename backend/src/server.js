import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/voice', ttsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'voice-inventory-backend',
    multiTenancy: true,
    roles: ['platform_admin', 'shop_owner', 'staff'],
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static assets in production if built
const frontendDistCandidates = [
  path.resolve(__dirname, '../../../frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist')
];
const frontendDistPath = frontendDistCandidates.find(p => fs.existsSync(p));

if (frontendDistPath) {
  console.log(`📂 Serving frontend static assets from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback for non-API client routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.resolve(frontendDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('res.sendFile error for:', indexPath, err.message);
        next(err);
      }
    });
  });
}

// 404 handler for unhandled API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start HTTP listener (Render, Docker, Local, or non-Vercel environments)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Voice Inventory Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Health check available at http://0.0.0.0:${PORT}/api/health`);
  });
}

export default app;
