-- MySQL schema and demo seed for PersonalLeadSys frontend expectations
-- This script creates tables that match the API payloads expected by the React app
-- and inserts the same minimal demo data used in the frontend fallbacks.

CREATE DATABASE IF NOT EXISTS personal_lead_sys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personal_lead_sys;

-- Contacts are referenced by leads and messages
CREATE TABLE IF NOT EXISTS contacts (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(64) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  budget DECIMAL(12,2) NULL,
  priority VARCHAR(32) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) PRIMARY KEY,
  contact_id VARCHAR(64) NULL,
  contact_name VARCHAR(255) NULL,
  title VARCHAR(255) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  value DECIMAL(12,2) NULL,
  project_id VARCHAR(64) NULL,
  source VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_leads_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  CONSTRAINT fk_leads_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS channels (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  channel_type VARCHAR(64) NOT NULL,
  api_key VARCHAR(255) NULL,
  webhook_url VARCHAR(512) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  config JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_channels_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS faq_templates (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(64) PRIMARY KEY,
  lead_id VARCHAR(64) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  due_date DATE NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  lead_id VARCHAR(64) NULL,
  contact_id VARCHAR(64) NULL,
  direction ENUM('inbound','outbound') NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'unread',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_messages_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

-- Demo data mirrors the frontend fallback dataset
INSERT INTO contacts (id, name, email, phone)
VALUES ('ct_demo_1', 'Demo Prospect', 'demo@example.com', '+1-555-0100')
ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), phone = VALUES(phone);

INSERT INTO projects (id, name, description, category, status, budget, priority, created_at, updated_at)
VALUES
  ('p_demo_1', 'empireleads.com', 'Demo web presence for Empire Leads.', 'web', 'active', 25000.00, 'medium', NOW(), NOW()),
  ('p_demo_2', 'partners.empireleads.com', 'Partner referral landing page.', 'marketing', 'planning', 15000.00, 'high', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name), description = VALUES(description), category = VALUES(category), status = VALUES(status),
  budget = VALUES(budget), priority = VALUES(priority), updated_at = NOW();

INSERT INTO leads (id, contact_id, contact_name, title, status, value, project_id, source, created_at, updated_at)
VALUES
  ('l_demo_1', 'ct_demo_1', 'Demo Prospect', 'Lead from partners page', 'new', 1200.00, 'p_demo_2', 'partners form', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  contact_id = VALUES(contact_id), contact_name = VALUES(contact_name), title = VALUES(title), status = VALUES(status),
  value = VALUES(value), project_id = VALUES(project_id), source = VALUES(source), updated_at = NOW();

INSERT INTO channels (id, project_id, name, channel_type, api_key, webhook_url, status, config, created_at)
VALUES
  ('c_demo_1', 'p_demo_1', 'Main site form', 'site_form', 'demo_api_key', 'https://api.empireleads.com/webhook/demo', 'active', '{}', NOW())
ON DUPLICATE KEY UPDATE
  project_id = VALUES(project_id), name = VALUES(name), channel_type = VALUES(channel_type), api_key = VALUES(api_key),
  webhook_url = VALUES(webhook_url), status = VALUES(status), config = VALUES(config);

INSERT INTO faq_templates (id, title, category, content, created_at, updated_at)
VALUES
  ('faq_demo_1', 'שאלות נפוצות - תמחור', 'pricing', 'תמחור דמו: 500 ש"ח לשעה, ניתן להתאים לפי היקף הפרויקט.', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  title = VALUES(title), category = VALUES(category), content = VALUES(content), updated_at = NOW();

INSERT INTO tasks (id, lead_id, title, description, due_date, status, created_at)
VALUES
  ('tsk_demo_1', 'l_demo_1', 'חזור ללקוח הדמו', 'קבע שיחת היכרות לבירור צרכים.', CURDATE(), 'open', NOW())
ON DUPLICATE KEY UPDATE
  lead_id = VALUES(lead_id), title = VALUES(title), description = VALUES(description), due_date = VALUES(due_date), status = VALUES(status);

INSERT INTO messages (id, lead_id, contact_id, direction, content, status, created_at)
VALUES
  ('msg_demo_1', 'l_demo_1', 'ct_demo_1', 'inbound', 'שלום, אשמח להבין איך השירות עובד.', 'unread', NOW())
ON DUPLICATE KEY UPDATE
  lead_id = VALUES(lead_id), contact_id = VALUES(contact_id), direction = VALUES(direction), content = VALUES(content), status = VALUES(status);
