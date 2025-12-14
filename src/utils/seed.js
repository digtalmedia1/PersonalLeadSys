export const seedData = () => {
  const hasSeeded = localStorage.getItem('empire_projects');
  if (hasSeeded) return;

  const now = new Date().toISOString();

  const projects = [
    {
      id: 'p_demo_1',
      name: 'empireleads.com',
      description: 'Demo web presence for Empire Leads.',
      category: 'web',
      status: 'active',
      created_at: now,
      updated_at: now
    }
  ];

  const channels = [
    {
      id: 'c_demo_1',
      project_id: 'p_demo_1',
      name: 'Main site form',
      channel_type: 'site_form',
      api_key: 'demo_api_key',
      webhook_url: 'https://api.empireleads.com/webhook/demo',
      status: 'active',
      created_at: now,
      config: {}
    }
  ];

  const faqTemplates = [
    {
      id: 'faq_demo_1',
      title: 'שאלות נפוצות - תמחור',
      category: 'pricing',
      content: 'תמחור דמו: 500 ש"ח לשעה, ניתן להתאים לפי היקף הפרויקט.',
      created_at: now,
      updated_at: now
    }
  ];

  const contacts = [
    { id: 'ct_demo_1', name: 'Demo Prospect', phone: '050-0000000', email: 'demo@empireleads.com', created_at: now }
  ];

  const leads = [
    {
      id: 'l_demo_1',
      contact_id: 'ct_demo_1',
      contact_name: 'Demo Prospect',
      title: 'Lead from main site',
      status: 'new',
      value: 1200,
      project_id: 'p_demo_1',
      source: 'site form',
      created_at: now,
      updated_at: now
    }
  ];

  const messages = [
    {
      id: 'msg_demo_1',
      contact_id: 'ct_demo_1',
      lead_id: 'l_demo_1',
      direction: 'inbound',
      content: 'שלום, אשמח להבין איך השירות עובד.',
      status: 'unread',
      external_thread_id: 'th_seed_1',
      created_at: now
    }
  ];

  const tasks = [
    {
      id: 'tsk_demo_1',
      lead_id: 'l_demo_1',
      title: 'חזור ללקוח הדמו',
      description: 'קבע שיחת היכרות לבירור צרכים.',
      due_date: now.split('T')[0],
      status: 'open',
      created_at: now
    }
  ];

  localStorage.setItem('empire_projects', JSON.stringify(projects));
  localStorage.setItem('empire_channels', JSON.stringify(channels));
  localStorage.setItem('empire_faq_templates', JSON.stringify(faqTemplates));
  localStorage.setItem('empire_contacts', JSON.stringify(contacts));
  localStorage.setItem('empire_leads', JSON.stringify(leads));
  localStorage.setItem('empire_messages', JSON.stringify(messages));
  localStorage.setItem('empire_tasks', JSON.stringify(tasks));

  console.log('Minimal seed data initialized for demo use.');
};
