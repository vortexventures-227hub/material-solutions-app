const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Import database connection
const db = require('./db');

// Initialize Express app
const app = express();

// ─── Request ID Middleware ────────────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ─── Security Headers (Helmet) ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable if embedding fonts/fonts from CDNs
}));

// ─── CORS Configuration ─────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Also allow undefined origin in production for services like React Native
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`[RateLimit] IP ${req.ip} hit limit at ${req.path}`);
    res.status(429).json({ 
      error: 'Too many requests, please try again later.',
      requestId: req.id,
    });
  },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`[RateLimit] Strict limit hit at ${req.path} by ${req.ip}`);
    res.status(429).json({ 
      error: 'Rate limit exceeded. Please wait before trying again.',
      requestId: req.id,
    });
  },
});

app.use(globalLimiter);

// ─── Body Parsers ───────────────────────────────────────────────────────────
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Import Routes ───────────────────────────────────────────────────────────
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
const marketplaceRoutes = require('./routes/marketplace');

// ─── Auth Middleware ─────────────────────────────────────────────────────────
const { verifyToken } = require('./middleware/auth');

// ─── Public Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Conditional Auth: Public Lead Form (POST) / Protected (all others) ────
const conditionalLeadAuth = (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    return next(); // Public: website lead form
  }
  return verifyToken(req, res, next);
};
app.use('/api/leads', conditionalLeadAuth, leadsRoutes);

// ─── Protected Routes ───────────────────────────────────────────────────────
app.use('/api/inventory', verifyToken, inventoryRoutes);
app.use('/api/chat', verifyToken, chatRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/vision', verifyToken, strictLimiter, visionRoutes);
app.use('/api/lens', verifyToken, strictLimiter, lensRoutes);
app.use('/api/drip', verifyToken, strictLimiter, dripRoutes);
app.use('/api/sms', verifyToken, strictLimiter, smsRoutes);
app.use('/api/market', verifyToken, marketRoutes);
app.use('/api/inventory', verifyToken, marketplaceRoutes); // Marketplace publish routes (nested under /api/inventory/:id/publish)
app.use('/api/signals', signalRoutes); // Signal webhooks are intentionally public

// ─── CRM Webhook Routes (Signature-Verified, Not JWT) ───────────────────────
const crmWebhookAuth = (req, res, next) => {
  if (req.path.startsWith('/webhooks/')) {
    return next(); // Verified by webhook signature (implemented in crm service)
  }
  return verifyToken(req, res, next);
};
app.use('/api/crm', crmWebhookAuth, crmRoutes);

// ─── One-Time Migration Endpoint (Remove after first use) ──────────────────
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

app.post('/api/migrate', async (req, res) => {
  const migrationKey = req.headers['x-migration-key'];
  if (migrationKey !== process.env.JWT_SECRET?.slice(0, 32)) {
    return res.status(403).json({ error: 'Invalid migration key' });
  }

  try {
    // Run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.query(schema);

    // Create test admin user
    const testEmail = 'admin@test.com';
    const testPassword = 'password123';
    const passwordHash = await bcrypt.hash(testPassword, 12);

    await db.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, [testEmail, passwordHash, 'Admin', 'admin']);

    res.json({ 
      status: 'ok', 
      message: 'Migration completed successfully',
      testUser: { email: testEmail, password: testPassword }
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Health Check ───────────────────────────────────────────────────────────
// Basic ping for Railway healthcheck (no DB required)
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Full health check (includes DB)
app.get('/health', async (req, res) => {
  const start = Date.now();
  try {
    await db.query('SELECT 1');
    const responseTime = Date.now() - start;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      responseTime: `${responseTime}ms`,
      version: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error(`[Health] Database check failed: ${error.message}`);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
      requestId: req.id,
    });
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    requestId: req.id,
    path: req.path,
  });
});

// ─── Error Handling Middleware ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log full error (never expose stack in production for 500s)
  console.error(`[Error] [${status}] [${req.method}] ${req.path} [${req.id}]`, {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(status).json({
    error: isProduction && status >= 500
      ? 'Internal server error'
      : err.message || 'Something went wrong!',
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && status < 500 && { stack: err.stack }),
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Rate limit: 100 req/min (global), 10 req/min (strict)`);
  console.log(`🔒 CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'localhost only'}`);
});

module.exports = app;
