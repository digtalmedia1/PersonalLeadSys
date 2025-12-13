import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const {
  PORT = 4000,
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = 3306,
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
  MYSQL_DATABASE = 'personal_leads',
  JWT_SECRET = 'change-me',
  JWT_EXPIRY = '1d',
  CORS_ORIGIN = 'http://localhost:3000'
} = process.env;

const app = express();

const allowedOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

const TOKEN_COOKIE_NAME = 'auth_token';

const createUserResponse = (record) => ({
  id: record.id,
  username: record.username,
  email: record.email,
  role: record.role || 'user'
});

const signSessionToken = (user) => jwt.sign({
  sub: String(user.id),
  username: user.username,
  role: user.role || 'user'
}, JWT_SECRET, { expiresIn: JWT_EXPIRY });

const parseTokenFromRequest = (req) => {
  if (req.cookies?.[TOKEN_COOKIE_NAME]) {
    return req.cookies[TOKEN_COOKIE_NAME];
  }

  const authHeader = req.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim();
  }

  return null;
};

const authenticate = async (req, res, next) => {
  const token = parseTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1',
      [payload.sub]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = createUserResponse(rows[0]);
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
};

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, password_hash, password as legacy_password FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const record = rows[0];
    const storedHash = record.password_hash || record.legacy_password;

    if (!storedHash) {
      return res.status(500).json({ error: 'User password not configured' });
    }

    const bcrypt = await import('bcryptjs').catch(() => null);
    let isValid = false;

    if (bcrypt?.compareSync) {
      isValid = bcrypt.compareSync(password, storedHash);
    } else {
      isValid = storedHash === password;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = createUserResponse(record);
    const token = signSessionToken(user);

    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/'
    });

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ error: 'Unable to process login' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Authentication server running on port ${PORT}`);
});
