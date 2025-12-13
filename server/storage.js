import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'server', 'db.json');

const DEFAULT_DB = {
  projects: [],
  channels: [],
  contacts: [],
  leads: [],
  messages: [],
  tasks: [],
  faq_templates: []
};

export const loadDb = () => {
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return { ...DEFAULT_DB };
  }

  const raw = readFileSync(DB_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DB, ...parsed };
  } catch (err) {
    writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return { ...DEFAULT_DB };
  }
};

export const saveDb = (db) => {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

export const getCollection = (db, name) => {
  if (!db[name]) db[name] = [];
  return db[name];
};
