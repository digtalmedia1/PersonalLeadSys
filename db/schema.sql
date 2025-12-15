-- Schema for PersonalLeadSys backend
CREATE DATABASE IF NOT EXISTS personal_lead_sys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personal_lead_sys;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'agent') NOT NULL DEFAULT 'agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Projects map campaigns/teams
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stage ENUM('idea','launch','growth','maintenance') DEFAULT 'idea',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Channels for lead source
CREATE TABLE IF NOT EXISTS channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  channel_id INT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status ENUM('new','contacted','qualified','proposal','won','lost') DEFAULT 'new',
  tags JSON NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Lead tasks / reminders
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status ENUM('open','in_progress','done') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- FAQ templates
CREATE TABLE IF NOT EXISTS faq_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Message templates
CREATE TABLE IF NOT EXISTS message_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  channel ENUM('email','sms','whatsapp') DEFAULT 'email',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Activity log per lead
CREATE TABLE IF NOT EXISTS lead_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  actor_id INT,
  activity_type VARCHAR(100) NOT NULL,
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seed minimal data
INSERT INTO users (email, full_name, password_hash, role)
VALUES ('admin@example.com', 'Admin', '$2b$10$0v7xf8xrCLiSeX8o4FL3auzH5N0zCU1S.ZdLXxDNd9zEUZvw7bw5G', 'admin')
ON DUPLICATE KEY UPDATE email=email;
-- password is "empire2025"

INSERT INTO projects (name, stage)
VALUES ('Galaxy CRM', 'launch'), ('Horizon AI', 'growth')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO channels (name)
VALUES ('Facebook'), ('Google Ads'), ('Organic')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO leads (project_id, channel_id, full_name, email, phone, status, tags, notes)
VALUES
  (1, 1, 'Dana Levi', 'dana@example.com', '+972-500-111111', 'contacted', JSON_ARRAY('priority','demo'), 'מתעניינת בחבילת פרימיום'),
  (2, 3, 'Avi Cohen', 'avi@example.com', '+972-500-222222', 'new', JSON_ARRAY('newsletter'), 'ביקש חזרה ביום חמישי');

INSERT INTO tasks (lead_id, title, description, due_date, status)
VALUES
  (1, 'תיאום פגישה', 'לקבוע זום לשבוע הבא', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'open'),
  (2, 'שיחת המשך', 'לבדוק סטטוס חיבור', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'open');

INSERT INTO faq_templates (question, answer)
VALUES
  ('איך להתחבר למערכת?', 'משתמש ברירת מחדל: admin@example.com / empire2025'),
  ('איך מוסיפים ליד חדש?', 'לחצו על כפתור Add Lead ומלאו את הפרטים.');

INSERT INTO message_templates (title, body, channel)
VALUES
  ('Welcome Email', 'Hi {{name}}, thanks for joining Galaxy CRM!', 'email'),
  ('WhatsApp Follow-up', 'היי {{name}}, נשמח לקבוע שיחה קצרה היום.', 'whatsapp');
