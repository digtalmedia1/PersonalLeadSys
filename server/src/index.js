import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool, { ping, query } from './db.js';

dotenv.config();

const app = express();
const port = Number(process.env.APP_PORT || 4000);
const allowedOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await ping();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [user] = await query('SELECT id, email, full_name, password_hash, role FROM users WHERE email = :email LIMIT 1', { email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.full_name,
    role: user.role,
  });
});

app.get('/projects', async (_req, res) => {
  const rows = await query('SELECT id, name, stage, created_at FROM projects ORDER BY id DESC');
  res.json(rows);
});

app.get('/channels', async (_req, res) => {
  const rows = await query('SELECT id, name, created_at FROM channels ORDER BY id DESC');
  res.json(rows);
});

app.get('/leads', async (_req, res) => {
  const rows = await query(`
    SELECT l.id, l.full_name, l.email, l.phone, l.status, l.tags, l.notes, l.created_at, l.updated_at,
           p.id AS project_id, p.name AS project_name,
           c.id AS channel_id, c.name AS channel_name
    FROM leads l
    LEFT JOIN projects p ON l.project_id = p.id
    LEFT JOIN channels c ON l.channel_id = c.id
    ORDER BY l.created_at DESC
  `);
  res.json(rows);
});

app.post('/leads', async (req, res) => {
  const { full_name, email, phone, status = 'new', project_id, channel_id, tags = null, notes = null } = req.body;
  if (!full_name) {
    return res.status(400).json({ error: 'full_name is required' });
  }

  const result = await query(
    `INSERT INTO leads (full_name, email, phone, status, project_id, channel_id, tags, notes)
     VALUES (:full_name, :email, :phone, :status, :project_id, :channel_id, :tags, :notes)`,
    { full_name, email, phone, status, project_id, channel_id, tags: tags ? JSON.stringify(tags) : null, notes }
  );

  res.status(201).json({ id: result.insertId, full_name, email, phone, status, project_id, channel_id, tags, notes });
});

app.put('/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  if (!status && !notes) {
    return res.status(400).json({ error: 'status or notes must be provided' });
  }

  const fields = [];
  const params = { id };
  if (status) {
    fields.push('status = :status');
    params.status = status;
  }
  if (notes) {
    fields.push('notes = :notes');
    params.notes = notes;
  }

  const sql = `UPDATE leads SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = :id`;
  await query(sql, params);
  const [updated] = await query('SELECT * FROM leads WHERE id = :id', { id });
  res.json(updated);
});

app.get('/tasks', async (_req, res) => {
  const rows = await query(`
    SELECT t.*, l.full_name AS lead_name
    FROM tasks t
    LEFT JOIN leads l ON t.lead_id = l.id
    ORDER BY t.due_date ASC
  `);
  res.json(rows);
});

app.post('/tasks', async (req, res) => {
  const { lead_id, title, description, due_date, status = 'open' } = req.body;
  if (!lead_id || !title) {
    return res.status(400).json({ error: 'lead_id and title are required' });
  }

  const result = await query(
    `INSERT INTO tasks (lead_id, title, description, due_date, status)
     VALUES (:lead_id, :title, :description, :due_date, :status)`,
    { lead_id, title, description, due_date, status }
  );

  res.status(201).json({ id: result.insertId, lead_id, title, description, due_date, status });
});

app.get('/faq', async (_req, res) => {
  const rows = await query('SELECT id, question, answer FROM faq_templates ORDER BY id DESC');
  res.json(rows);
});

app.get('/messages/templates', async (_req, res) => {
  const rows = await query('SELECT id, title, body, channel FROM message_templates ORDER BY id DESC');
  res.json(rows);
});

app.use((err, _req, res, _next) => {
  // Global error handler to avoid leaking stack traces
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, async () => {
  try {
    await ping();
    console.log(`Server ready on port ${port}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});
