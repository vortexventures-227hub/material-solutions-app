const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// 5 attempts per 10 min per IP — brute-force guard on password changes
const changePasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    console.warn(`[RateLimit] change-password limit hit from IP ${req.ip}`);
    res.status(429).json({
      error: 'Too many password change attempts. Try again in 10 minutes.',
    });
  },
});

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function requireAdminRegistrationAuth(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required to create users' });
    return false;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required to create users' });
      return false;
    }

    req.user = decoded;
    return true;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
      return false;
    }

    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
}

/**
 * POST /api/auth/register - Create new user
 * Production default: authenticated admin only.
 * Optional bootstrap: set ALLOW_UNAUTHENTICATED_BOOTSTRAP_REGISTER=true and
 * ADMIN_BOOTSTRAP_TOKEN to allow the very first user to be created without JWT.
 */
router.post('/register', async (req, res, next) => {
  const { email, password, name, role } = req.body;

  try {
    const userCountResult = await db.query('SELECT COUNT(*)::int AS count FROM users');
    const userCount = userCountResult.rows[0]?.count || 0;
    const bootstrapAllowed = process.env.ALLOW_UNAUTHENTICATED_BOOTSTRAP_REGISTER === 'true';
    const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
    const presentedBootstrapToken = req.headers['x-bootstrap-token'];
    const isBootstrapRequest =
      bootstrapAllowed &&
      userCount === 0 &&
      bootstrapToken &&
      presentedBootstrapToken === bootstrapToken;

    if (!isBootstrapRequest && !requireAdminRegistrationAuth(req, res)) {
      return;
    }

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }

    const normalizedRole = isBootstrapRequest ? 'admin' : (role || 'staff');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase(), passwordHash, name, normalizedRole]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Error creating user:', error);
    next(error);
  }
});

/**
 * POST /api/auth/login - Authenticate and get tokens
 */
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Get user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate access token (short-lived, in memory)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Generate refresh token (long-lived, HTTP-only cookie)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    
    // Store refresh token
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshTokenHash, expiresAt]
    );
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    });
    
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    next(error);
  }
});

/**
 * POST /api/auth/refresh - Get new access token using refresh token
 */
router.post('/refresh', async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }
  
  try {
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    
    // Verify refresh token exists and is not expired
    const result = await db.query(
      `SELECT rt.*, u.id, u.email, u.name, u.role
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [refreshTokenHash]
    );
    
    if (result.rows.length === 0) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    const user = result.rows[0];
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    next(error);
  }
});

/**
 * POST /api/auth/logout - Invalidate refresh token
 */
router.post('/logout', async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(200).json({ message: 'Already logged out' });
  }
  
  try {
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    
    // Delete refresh token from database
    await db.query(
      'DELETE FROM refresh_tokens WHERE token_hash = $1',
      [refreshTokenHash]
    );
    
    // Clear cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    next(error);
  }
});

/**
 * GET /api/auth/me - Get current user info
 */
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    next(error);
  }
});

/**
 * POST /api/auth/change-password - Change authenticated user's password
 * Rate-limited: 5 attempts per 10 min per IP
 */
router.post('/change-password', changePasswordLimiter, verifyToken, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'New password must be at least 12 characters' });
    }

    const result = await db.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, user.id]
    );

    // Invalidate all refresh tokens so user must re-login
    await db.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [user.id]
    );

    res.clearCookie('refreshToken');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    next(error);
  }
});

module.exports = router;
