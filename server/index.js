import http from 'http';
import { parse } from 'url';
import { StringDecoder } from 'string_decoder';
import { randomUUID } from 'crypto';
import { loadDb, saveDb, getCollection } from './storage.js';

const PORT = process.env.PORT || 4000;
const resources = new Set(['projects', 'channels', 'contacts', 'leads', 'messages', 'tasks', 'faq_templates']);

const send = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  if (status === 204) {
    res.end();
    return;
  }
  res.end(JSON.stringify(payload));
};

const readBody = (req) => new Promise((resolve, reject) => {
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();
    if (!buffer) return resolve({});
    try {
      resolve(JSON.parse(buffer));
    } catch (err) {
      reject(err);
    }
  });
});

const server = http.createServer(async (req, res) => {
  const parsed = parse(req.url, true);
  const segments = parsed.pathname.split('/').filter(Boolean);

  if (req.method === 'OPTIONS') {
    send(res, 204);
    return;
  }

  if (segments[0] === 'api' && segments[1] === 'health') {
    send(res, 200, { status: 'ok' });
    return;
  }

  if (segments[0] !== 'api' || segments.length < 2) {
    send(res, 404, { error: 'Not found' });
    return;
  }

  const resource = segments[1];
  if (!resources.has(resource)) {
    send(res, 404, { error: 'Resource not supported' });
    return;
  }

  const id = segments[2];
  const db = loadDb();
  const collection = getCollection(db, resource);

  try {
    if (req.method === 'GET' && !id) {
      send(res, 200, collection);
      return;
    }

    if (req.method === 'GET' && id) {
      const record = collection.find((item) => item.id === id);
      if (!record) {
        send(res, 404, { error: 'Record not found' });
        return;
      }
      send(res, 200, record);
      return;
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const record = { ...body, id: body.id || randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      collection.unshift(record);
      saveDb(db);
      send(res, 201, record);
      return;
    }

    if (req.method === 'PUT' && id) {
      const idx = collection.findIndex((item) => item.id === id);
      if (idx === -1) {
        send(res, 404, { error: 'Record not found' });
        return;
      }
      const body = await readBody(req);
      const updated = { ...collection[idx], ...body, id, updated_at: new Date().toISOString() };
      collection[idx] = updated;
      saveDb(db);
      send(res, 200, updated);
      return;
    }

    if (req.method === 'DELETE' && id) {
      const idx = collection.findIndex((item) => item.id === id);
      if (idx === -1) {
        send(res, 404, { error: 'Record not found' });
        return;
      }
      collection.splice(idx, 1);
      saveDb(db);
      send(res, 204);
      return;
    }

    send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Server error', details: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
