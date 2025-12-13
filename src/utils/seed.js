export const seedData = () => {
  // Check if we already have the full dataset seeded (approx > 10 projects)
  const existingProjects = JSON.parse(localStorage.getItem('empire_projects') || '[]');
  if (existingProjects.length > 10) return;

  const now = new Date().toISOString();
  
  // Calculate tomorrow for task due date
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  // List of all domains to seed
  const domainList = [
    // Original 7 (preserved)
    'escort-israel.xyz',
    'cuckold-israel.com', 
    'danielrozen.com', 
    'just-believe.xyz', 
    'עיסויאירוטי.com', 
    'nlp-coaching.com', 
    'recruitment-israel.com',
    // New 50+
    'gameplay.co.il', 'media-digital.co.il', 'bdsmplay.xyz', 'dog-dating.com', 
    'vr-tacticals.com', 'cosplaysfantasy.com', 'sex-dolls.xyz', 'sexdollsilicone.com', 
    'israel-capital.com', 'gigolo-israel.com', 'gameplaydating.com', 'bdsm-israel.com', 
    'bdsm-chat.xyz', 'penthouse-israel.com', 'naked-cleaning.xyz', 'gigolo-travel.com', 
    'marina-beaulieu.com', 'suzuki-vitara.com', 'transgender-israel.com', 'erotic-israel.com', 
    'swinger-israel.com', 'swingers-israel.com', 'escort-lady.com', 'escort-mom.com', 
    'escort-daddy.com', 'escort-telegram.com', 'tiktok-escort.com', 'instagram-escort.com', 
    'art-ariela.com', 'pro-worktools.com', 'nlpisrael.xyz', 'just-believe.me', 
    'crossfit-israel.com', 'crossfit-workout.com', 'crossfit-fitness.com', 'gavrielalhazov.com', 
    'gavriel-alhazov.com', 'נערליווי.com', 'october-7.xyz', '7october.xyz', 
    'palestine-dating.com', 'palestine-love.com', 'dungeon-date.com', 'nlp-israel.com', 
    'escort-gigolo.com', '2me.live', 'scamer-report.com', 'cars-trade.com', 
    'strip-boys.com', 'obeydaniel.com', 'tactical-gear.xyz', 'avi-cohen.biz', 
    'avicohen-law.com'
  ];

  // Helper to determine category and description
  const getProjectDetails = (domain) => {
    const d = domain.toLowerCase();
    
    // Erotic / Adult Services
    if (d.includes('escort') || d.includes('gigolo') || d.includes('sex') || d.includes('erotic') || 
        d.includes('strip') || d.includes('naked') || d.includes('penthouse') || d.includes('עיסוי') || 
        d.includes('נערליווי') || d.includes('transgender')) {
      return { cat: 'erotic_services', desc: 'Adult services and entertainment portal', status: 'active' };
    }
    
    // Kink / BDSM
    if (d.includes('bdsm') || d.includes('cuckold') || d.includes('dungeon') || d.includes('obey')) {
      return { cat: 'kink_community', desc: 'Niche lifestyle and kink community', status: 'active' };
    }

    // Dating
    if (d.includes('dating') || d.includes('love') || d.includes('swinger') || d.includes('2me')) {
      return { cat: 'dating_site', desc: 'Online dating and matchmaking platform', status: 'active' };
    }

    // NLP / Coaching / Personal
    if (d.includes('nlp') || d.includes('coaching') || d.includes('believe') || d.includes('gavriel') || 
        d.includes('daniel') || d.includes('ariela')) {
      return { cat: 'nlp_coaching', desc: 'Personal development, branding and coaching', status: 'active' };
    }

    // Fitness / Lifestyle
    if (d.includes('crossfit') || d.includes('workout') || d.includes('fitness') || 
        d.includes('suzuki') || d.includes('cars') || d.includes('tactical') || d.includes('vr') || 
        d.includes('cosplay') || d.includes('gameplay')) {
      return { cat: 'lifestyle_fitness', desc: 'Fitness, hobbies, and lifestyle resources', status: 'active' };
    }

    // Business / Political / General
    if (d.includes('media') || d.includes('digital') || d.includes('capital') || d.includes('recruitment') || 
        d.includes('law') || d.includes('cohen') || d.includes('worktools') || d.includes('scamer') || 
        d.includes('october') || d.includes('7october')) {
      return { cat: 'business_services', desc: 'Professional services or informational site', status: 'active' };
    }

    return { cat: 'general', desc: 'Specialized web portal', status: 'active' };
  };

  // Remove duplicates
  const uniqueDomains = [...new Set(domainList)];

  const projects = uniqueDomains.map((domain, index) => {
    const details = getProjectDetails(domain);
    // Preserve specific status for original sample if needed, otherwise default to active per request
    let status = details.status;
    if (domain === 'just-believe.xyz') status = 'paused';
    if (domain === 'recruitment-israel.com') status = 'completed';

    return {
      id: `p${index + 1}`,
      name: domain,
      description: details.desc,
      category: details.cat,
      status: status,
      created_at: now,
      updated_at: now
    };
  });

  const channels = projects.map((p, index) => ({
    id: `c${index + 1}`,
    project_id: p.id,
    name: `${p.name} Source`,
    // Alternate channel types for variety
    channel_type: index % 3 === 0 ? 'site_form' : (index % 3 === 1 ? 'whatsapp' : 'manual_test'),
    api_key: `ek_${Math.random().toString(36).substring(2, 10)}_${p.id}`,
    webhook_url: `https://api.empireleads.com/webhook/${p.id}`,
    status: 'active',
    config: {},
    created_at: now
  }));

  const faqTemplates = [
    { 
      id: 't1', 
      title: 'Pricing (מחיר)', 
      category: 'pricing', 
      content: 'המחיר לשירות הוא 500 ש״ח לשעה + מע״מ. אנו מקבלים תשלום במזומן, ביט, או העברה בנקאית מראש.', 
      created_at: now, 
      updated_at: now 
    },
    { 
      id: 't2', 
      title: 'Process (תהליך)', 
      category: 'process', 
      content: 'תהליך העבודה שלנו:\n1. שיחת אפיון קצרה (ללא עלות)\n2. הצעת מחיר מותאמת אישית\n3. תחילת עבודה לאחר מקדמה\n4. סיום ומסירה', 
      created_at: now, 
      updated_at: now 
    },
    { 
      id: 't3', 
      title: 'Boundaries (גבולות)', 
      category: 'boundaries', 
      content: 'חשוב לנו לשמור על שיח מכבד. שעות המענה הן בימים א-ה בין 09:00 ל-18:00. פניות מחוץ לשעות אלו יענו ביום העסקים הבא.', 
      created_at: now, 
      updated_at: now 
    }
  ];

  const contacts = [
    { id: 'ct1', name: 'Yossi Cohen', phone: '054-1234567', email: 'yossi.cohen@example.com', created_at: now }
  ];

  // Link lead to one of the projects (e.g., nlp-coaching.com if it exists, or the first one)
  const targetProject = projects.find(p => p.name.includes('nlp')) || projects[0];

  const leads = [
    { 
      id: 'l1', 
      contact_id: 'ct1', 
      contact_name: 'Yossi Cohen', 
      title: 'NLP Coaching Inquiry', 
      status: 'new', 
      value: 1200, 
      project_id: targetProject.id, 
      created_at: now,
      updated_at: now 
    }
  ];

  const messages = [
    { 
      id: 'm1', 
      contact_id: 'ct1', 
      lead_id: 'l1', 
      direction: 'inbound', 
      content: 'היי, ראיתי את האתר ואני מעוניין לשמוע פרטים נוספים. האם יש חבילת היכרות?', 
      status: 'unread', 
      external_thread_id: 'th_seed_1', 
      created_at: now 
    }
  ];

  const tasks = [
    { 
      id: 'tsk1', 
      lead_id: 'l1', 
      title: 'Call Yossi back', 
      description: 'Potential client asking about intro package. Check availability for next week.', 
      due_date: tomorrowStr, 
      status: 'open', 
      created_at: now 
    }
  ];

  // Save everything to localStorage
  localStorage.setItem('empire_projects', JSON.stringify(projects));
  localStorage.setItem('empire_channels', JSON.stringify(channels));
  
  // Only set these if they don't exist to avoid overwriting user progress on other items if any
  if (!localStorage.getItem('empire_faq_templates')) localStorage.setItem('empire_faq_templates', JSON.stringify(faqTemplates));
  if (!localStorage.getItem('empire_contacts')) localStorage.setItem('empire_contacts', JSON.stringify(contacts));
  if (!localStorage.getItem('empire_leads')) localStorage.setItem('empire_leads', JSON.stringify(leads));
  if (!localStorage.getItem('empire_messages')) localStorage.setItem('empire_messages', JSON.stringify(messages));
  if (!localStorage.getItem('empire_tasks')) localStorage.setItem('empire_tasks', JSON.stringify(tasks));

  console.log(`Seed data initialized successfully with ${projects.length} projects.`);
};