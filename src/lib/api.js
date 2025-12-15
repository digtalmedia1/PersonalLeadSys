const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const demoNow = new Date().toISOString();

const demoData = {
  projects: [
    {
      id: 'p_demo_1',
      name: 'empireleads.com',
      description: 'Demo web presence for Empire Leads.',
      category: 'web',
      status: 'active',
      created_at: demoNow,
      updated_at: demoNow,
      budget: 25000,
      priority: 'medium'
    },
    {
      id: 'p_demo_2',
      name: 'partners.empireleads.com',
      description: 'Partner referral landing page.',
      category: 'marketing',
      status: 'planning',
      created_at: demoNow,
      updated_at: demoNow,
      budget: 15000,
      priority: 'high'
    }
  ],
  leads: [
    {
      id: 'l_demo_1',
      contact_id: 'ct_demo_1',
      contact_name: 'Demo Prospect',
      title: 'Lead from partners page',
      status: 'new',
      value: 1200,
      project_id: 'p_demo_2',
      source: 'partners form',
      created_at: demoNow,
      updated_at: demoNow
    }
  ],
  channels: [
    {
      id: 'c_demo_1',
      project_id: 'p_demo_1',
      name: 'Main site form',
      channel_type: 'site_form',
      api_key: 'demo_api_key',
      webhook_url: 'https://api.empireleads.com/webhook/demo',
      status: 'active',
      created_at: demoNow,
      config: {}
    }
  ],
  faqTemplates: [
    {
      id: 'faq_demo_1',
      title: 'שאלות נפוצות - תמחור',
      category: 'pricing',
      content: 'תמחור דמו: 500 ש"ח לשעה, ניתן להתאים לפי היקף הפרויקט.',
      created_at: demoNow,
      updated_at: demoNow
    }
  ],
  tasks: [
    {
      id: 'tsk_demo_1',
      lead_id: 'l_demo_1',
      title: 'חזור ללקוח הדמו',
      description: 'קבע שיחת היכרות לבירור צרכים.',
      due_date: demoNow.split('T')[0],
      status: 'open',
      created_at: demoNow
    }
  ],
  messages: [
    {
      id: 'msg_demo_1',
      lead_id: 'l_demo_1',
      contact_id: 'ct_demo_1',
      direction: 'inbound',
      content: 'שלום, אשמח להבין איך השירות עובד.',
      status: 'unread',
      created_at: demoNow
    }
  ]
};

const cacheKeys = {
  projects: 'empire_projects',
  leads: 'empire_leads',
  channels: 'empire_channels',
  faqTemplates: 'empire_faq_templates',
  tasks: 'empire_tasks',
  messages: 'empire_messages'
};

async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include',
    ...options
  });

  if (!res.ok) {
    const message = await safeJson(res);
    throw new Error(message?.error || `API request failed with status ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (err) {
    return null;
  }
}

function getFromCache(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.warn(`Failed reading cache for ${key}`, err);
  }
  return fallback;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed writing cache for ${key}`, err);
  }
}

async function fetchWithFallback(endpoint, cacheKey, fallbackData) {
  try {
    const data = await fetchJson(endpoint);
    if (data) setCache(cacheKey, data);
    return data || fallbackData;
  } catch (err) {
    console.warn(`API fetch for ${endpoint} failed, using fallback`, err);
    return getFromCache(cacheKey, fallbackData);
  }
}

export async function getProjects() {
  return fetchWithFallback('/projects', cacheKeys.projects, demoData.projects);
}

export async function getLeads() {
  return fetchWithFallback('/leads', cacheKeys.leads, demoData.leads);
}

export async function getLeadById(id) {
  const leads = await getLeads();
  return leads.find((l) => l.id === id) || null;
}

export async function getChannels() {
  return fetchWithFallback('/channels', cacheKeys.channels, demoData.channels);
}

export async function getFaqTemplates() {
  return fetchWithFallback('/faq-templates', cacheKeys.faqTemplates, demoData.faqTemplates);
}

export async function getTasks() {
  return fetchWithFallback('/tasks', cacheKeys.tasks, demoData.tasks);
}

export async function getMessages() {
  return fetchWithFallback('/messages', cacheKeys.messages, demoData.messages);
}

export async function prefetchAppData() {
  return Promise.all([
    getProjects(),
    getChannels(),
    getLeads(),
    getFaqTemplates(),
    getTasks(),
    getMessages()
  ]);
}

export function updateCachedProjects(projects) {
  setCache(cacheKeys.projects, projects);
}

export function updateCachedChannels(channels) {
  setCache(cacheKeys.channels, channels);
}

export function updateCachedLeads(leads) {
  setCache(cacheKeys.leads, leads);
}

export function updateCachedFaqTemplates(templates) {
  setCache(cacheKeys.faqTemplates, templates);
}

export function updateCachedTasks(tasks) {
  setCache(cacheKeys.tasks, tasks);
}

export function updateCachedMessages(messages) {
  setCache(cacheKeys.messages, messages);
}
