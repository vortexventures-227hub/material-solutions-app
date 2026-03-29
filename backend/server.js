const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const db = require('./db');

// Initialize Express app
const app = express();

// Security headers
app.use(helmet());

// CORS configuration - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000']; // Default to React dev server

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Global rate limiter - 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for expensive operations (SMS, Vision, emails)
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Rate limit exceeded. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply global rate limiter
app.use(globalLimiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const leadsRoutes = require('./routes/leads');
const chatRoutes = require('./routes/chat');
const dashboardRoutes = require('./routes/dashboard');
const visionRoutes = require('./routes/vision');
const lensRoutes = require('./routes/lens');
const dripRoutes = require('./routes/drip');
const smsRoutes = require('./routes/sms');
const marketRoutes = require('./routes/market');
const crmRoutes = require('./routes/crm');
const signalRoutes = require('./routes/signals');

// Import auth middleware
const { verifyToken } = require('./middleware/auth');

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Mount leads with conditional auth (POST is public, rest protected)
const conditionalLeadAuth = (req, res, next) => {
  // Allow public POST to /api/leads (website lead form)
  if (req.method === 'POST' && req.path === '/') {
    return next();
  }
  // All other operations require auth
  return verifyToken(req, res, next);
};
app.use('/api/leads', conditionalLeadAuth, leadsRoutes);

// Protected routes - require authentication
app.use('/api/inventory', verifyToken, inventoryRoutes);
app.use('/api/chat', verifyToken, chatRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/vision', verifyToken, strictLimiter, visionRoutes);
app.use('/api/lens', verifyToken, strictLimiter, lensRoutes);
app.use('/api/drip', verifyToken, strictLimiter, dripRoutes);
app.use('/api/sms', verifyToken, strictLimiter, smsRoutes);
app.use('/api/market', verifyToken, marketRoutes);
app.use('/api/signals', signalRoutes);

// CRM routes: webhooks must be public (called by external services), other CRM routes require auth
const crmWebhookAuth = (req, res, next) => {
  if (req.path.startsWith('/webhooks/')) {
    return next(); // Webhooks are verified by signature, not JWT
  }
  return verifyToken(req, res, next);
};
app.use('/api/crm', crmWebhookAuth, crmRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(status).json({
    error: isProduction && status >= 500
      ? 'Internal server error'
      : err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});

module.exports = app;
