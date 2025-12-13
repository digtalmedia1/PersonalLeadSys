import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, Calendar, DollarSign, User, Phone, ArrowRight, 
  Plus, Search, Filter, Briefcase, GripVertical, Trash2, Edit,
  AlertTriangle, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// --- Constants ---
const STAGES = {
  new: { id: 'new', title: 'מתעניין (Interested)', color: '#00D9FF' },
  negotiation: { id: 'negotiation', title: 'משא ומתן (Negotiation)', color: '#FFA500' },
  proposal: { id: 'proposal', title: 'הצעת מחיר (Proposal)', color: '#9D4EDD' },
  closed: { id: 'closed', title: 'סגור (Closed)', color: '#FF006E' }
};

const PRIORITIES = {
  high: { label: 'גבוהה', color: 'text-[#FF006E] bg-[#FF006E]/10' },
  medium: { label: 'בינונית', color: 'text-[#FFA500] bg-[#FFA500]/10' },
  low: { label: 'נמוכה', color: 'text-[#00D9FF] bg-[#00D9FF]/10' }
};

const TEAM_MEMBERS = ['Admin', 'Sales Manager', 'Support Lead', 'Daniel Cohen'];

const LeadsPipeline = () => {
  const { toast } = useToast();
  
  // --- State ---
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    project: 'all',
    priority: 'all',
    assignee: 'all'
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    contact_name: '',
    email: '',
    phone: '',
    value: '',
    status: 'new',
    priority: 'medium',
    projectId: '',
    customProjectName: '',
    assignee: '',
    dueDate: '',
    projectMode: 'select' // 'select' or 'custom'
  });

  // --- Data Loading ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load Projects
      const storedProjects = JSON.parse(localStorage.getItem('empire_projects') || '[]');
      setProjects(storedProjects);

      // Load Leads
      const storedLeads = JSON.parse(localStorage.getItem('empire_leads') || '[]');
      
      // Seed data if empty for demonstration
      if (storedLeads.length === 0) {
        const seedLeads = [
          {
            id: 'l_1',
            title: 'פיתוח מערכת CRM',
            contact_name: 'ישראל ישראלי',
            value: 15000,
            status: 'new',
            priority: 'high',
            projectId: '',
            customProjectName: 'סטארטאפ X',
            assignee: 'Sales Manager',
            dueDate: '2024-03-01',
            createdAt: new Date().toISOString()
          },
          {
            id: 'l_2',
            title: 'דף נחיתה לקמפיין',
            contact_name: 'רונית כהן',
            value: 2500,
            status: 'negotiation',
            priority: 'medium',
            projectId: storedProjects[0]?.id || '',
            customProjectName: '',
            assignee: 'Admin',
            dueDate: '2024-02-20',
            createdAt: new Date().toISOString()
          }
        ];
        setLeads(seedLeads);
        localStorage.setItem('empire_leads', JSON.stringify(seedLeads));
      } else {
        setLeads(storedLeads);
      }
    } catch (error) {
      console.error("Failed to load pipeline data", error);
      toast({ title: "שגיאה", description: "תקלה בטעינת הנתונים", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    localStorage.setItem('empire_leads', JSON.stringify(newLeads));
  };

  // --- Handlers: DnD ---
  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    // Make transparent drag image or custom
    const ghost = document.createElement('div');
    ghost.style.opacity = '0';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault(); // Essential to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== stageId) {
      const updatedLeads = leads.map(l => 
        l.id === draggedLead.id ? { ...l, status: stageId } : l
      );
      saveLeads(updatedLeads);
      toast({ title: "סטטוס עודכן", description: `הליד הועבר ל-${STAGES[stageId].title}` });
    }
    setDraggedLead(null);
  };

  // --- Handlers: CRUD ---
  const handleOpenModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      const hasLinkedProject = lead.projectId && projects.find(p => p.id === lead.projectId);
      setFormData({
        title: lead.title || '',
        contact_name: lead.contact_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        value: lead.value || '',
        status: lead.status || 'new',
        priority: lead.priority || 'medium',
        projectId: lead.projectId || '',
        customProjectName: lead.customProjectName || (!hasLinkedProject ? lead.projectName : '') || '',
        assignee: lead.assignee || '',
        dueDate: lead.dueDate || '',
        projectMode: hasLinkedProject ? 'select' : 'custom'
      });
    } else {
      setEditingLead(null);
      setFormData({
        title: '', contact_name: '', email: '', phone: '', value: '',
        status: 'new', priority: 'medium', projectId: '', customProjectName: '',
        assignee: '', dueDate: '', projectMode: 'select'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.contact_name) {
      toast({ title: "שגיאה", description: "נא למלא שדות חובה (כותרת ושם איש קשר)", variant: "destructive" });
      return;
    }

    const processedLead = {
      title: formData.title,
      contact_name: formData.contact_name,
      email: formData.email,
      phone: formData.phone,
      value: Number(formData.value) || 0,
      status: formData.status,
      priority: formData.priority,
      assignee: formData.assignee,
      dueDate: formData.dueDate,
      // Project Logic
      projectId: formData.projectMode === 'select' ? formData.projectId : '',
      customProjectName: formData.projectMode === 'custom' ? formData.customProjectName : '',
      // Fallback display name
      projectName: formData.projectMode === 'select' 
        ? (projects.find(p => p.id === formData.projectId)?.name || '') 
        : formData.customProjectName
    };

    if (editingLead) {
      const updatedLeads = leads.map(l => 
        l.id === editingLead.id ? { ...l, ...processedLead } : l
      );
      saveLeads(updatedLeads);
      toast({ title: "ליד עודכן", description: "הפרטים נשמרו בהצלחה" });
    } else {
      const newLead = {
        id: `l_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...processedLead
      };
      saveLeads([newLead, ...leads]);
      toast({ title: "ליד נוצר", description: "הליד נוסף לצנרת בהצלחה" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!leadToDelete) return;
    const updatedLeads = leads.filter(l => l.id !== leadToDelete.id);
    saveLeads(updatedLeads);
    setIsDeleteAlertOpen(false);
    setLeadToDelete(null);
    toast({ title: "ליד נמחק", variant: "destructive" });
  };

  // --- Filtering & Stats ---
  const filteredLeads = leads.filter(l => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      l.title?.toLowerCase().includes(searchLower) ||
      l.contact_name?.toLowerCase().includes(searchLower) ||
      l.projectName?.toLowerCase().includes(searchLower) ||
      l.customProjectName?.toLowerCase().includes(searchLower);
      
    const matchesProject = filters.project === 'all' || 
      (l.projectId === filters.project) || 
      (filters.project === 'custom' && !l.projectId);
      
    const matchesPriority = filters.priority === 'all' || l.priority === filters.priority;
    const matchesAssignee = filters.assignee === 'all' || l.assignee === filters.assignee;
    
    return matchesSearch && matchesProject && matchesPriority && matchesAssignee;
  });

  const getStageLeads = (stageId) => filteredLeads.filter(l => l.status === stageId);

  const stats = {
    total: leads.length,
    value: leads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
    conversion: leads.length > 0 
      ? Math.round((leads.filter(l => l.status === 'closed').length / leads.length) * 100) 
      : 0
  };

  // --- Helper to get display project name ---
  const getProjectDisplay = (lead) => {
    if (lead.projectId) {
      const proj = projects.find(p => p.id === lead.projectId);
      return proj ? proj.name : 'פרויקט לא נמצא';
    }
    return lead.customProjectName || lead.projectName || null;
  };

  return (
    <>
      <Helmet>
        <title>צנרת לידים - Empire CRM</title>
      </Helmet>
      
      <div className="relative min-h-full font-rubik text-right pb-10 flex flex-col h-[calc(100vh-100px)]" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-6 shrink-0">
          <div className="space-y-2">
             <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#00D9FF] to-[#FF006E] drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
               צנרת לידים (Pipeline)
             </h1>
             <p className="text-gray-400 text-sm flex items-center gap-2">
               <Briefcase className="w-4 h-4 text-[#00D9FF]" />
               ניהול ויזואלי של תהליך המכירה וההזדמנויות
             </p>
          </div>

          <div className="flex gap-4">
             {/* Stats Chips */}
             <div className="hidden md:flex gap-3">
                <div className="bg-[#0A0E27] border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
                   <span className="text-[10px] text-gray-500 uppercase font-bold">שווי כולל</span>
                   <span className="text-lg font-bold text-[#00D9FF]">₪{stats.value.toLocaleString()}</span>
                </div>
                <div className="bg-[#0A0E27] border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
                   <span className="text-[10px] text-gray-500 uppercase font-bold">החודש</span>
                   <span className="text-lg font-bold text-white">{leads.filter(l => l.createdAt?.startsWith(new Date().toISOString().slice(0, 7))).length}</span>
                </div>
                <div className="bg-[#0A0E27] border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
                   <span className="text-[10px] text-gray-500 uppercase font-bold">יחס המרה</span>
                   <span className="text-lg font-bold text-[#FF006E]">{stats.conversion}%</span>
                </div>
             </div>

             <Button 
               onClick={() => handleOpenModal()} 
               className="bg-gradient-to-r from-[#00D9FF] to-[#00B4D8] text-[#050A18] font-bold shadow-[0_0_15px_rgba(0,217,255,0.4)] h-full"
             >
               <Plus className="w-5 h-5 ml-2" />
               ליד חדש
             </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0A0E27]/60 border border-[#00D9FF]/10 backdrop-blur-xl p-3 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center mb-6 shrink-0 z-10">
           <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש ליד, לקוח או פרויקט..." 
                className="w-full bg-[#050A18] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00D9FF]"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
              <select 
                 value={filters.project}
                 onChange={(e) => setFilters({...filters, project: e.target.value})}
                 className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#00D9FF] outline-none max-w-[150px]"
              >
                 <option value="all">כל הפרויקטים</option>
                 <option value="custom">פרויקט מותאם אישית</option>
                 {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select 
                 value={filters.priority}
                 onChange={(e) => setFilters({...filters, priority: e.target.value})}
                 className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#00D9FF] outline-none"
              >
                 <option value="all">כל העדיפויות</option>
                 <option value="high">גבוהה</option>
                 <option value="medium">בינונית</option>
                 <option value="low">נמוכה</option>
              </select>
              <select 
                 value={filters.assignee}
                 onChange={(e) => setFilters({...filters, assignee: e.target.value})}
                 className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#00D9FF] outline-none"
              >
                 <option value="all">כל הצוות</option>
                 {TEAM_MEMBERS.map(tm => <option key={tm} value={tm}>{tm}</option>)}
              </select>
           </div>
        </div>

        {/* Pipeline Board */}
        <div className="flex gap-6 overflow-x-auto pb-6 flex-1 min-h-0">
           {Object.values(STAGES).map((stage) => {
             const stageLeads = getStageLeads(stage.id);
             return (
               <div 
                 key={stage.id} 
                 className="min-w-[320px] w-[320px] flex flex-col h-full bg-[#050A18]/40 backdrop-blur-sm border border-white/5 rounded-xl transition-colors"
                 onDragOver={(e) => handleDragOver(e, stage.id)}
                 onDrop={(e) => handleDrop(e, stage.id)}
               >
                  {/* Column Header */}
                  <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A0E27]/90 backdrop-blur rounded-t-xl z-10 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.color}` }}></div>
                        <h3 className="font-bold text-white tracking-wide text-sm">{stage.title}</h3>
                        <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-gray-300 font-mono">{stageLeads.length}</span>
                     </div>
                  </div>

                  {/* Drop Zone / List */}
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                     <AnimatePresence>
                       {stageLeads.map((lead) => (
                         <motion.div
                           key={lead.id}
                           layoutId={lead.id}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           draggable
                           onDragStart={(e) => handleDragStart(e, lead)}
                           className={cn(
                             "group bg-[#0A0E27] p-4 rounded-xl border border-white/5 hover:border-[#00D9FF]/50 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(0,217,255,0.1)] relative cursor-grab active:cursor-grabbing",
                             draggedLead?.id === lead.id && "opacity-50"
                           )}
                         >
                            {/* Grip Handle & Priority Color Bar */}
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                               <GripVertical className="w-4 h-4" />
                            </div>
                            <div className={cn("absolute right-0 top-4 bottom-4 w-1 rounded-l-full", PRIORITIES[lead.priority]?.bg || 'bg-gray-500')} 
                                 style={{ backgroundColor: lead.priority === 'high' ? '#FF006E' : lead.priority === 'medium' ? '#FFA500' : '#00D9FF' }}
                            />

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-2 pr-3">
                               <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-mono text-gray-500">ID: {lead.id.split('_')[1]}</span>
                                  {getProjectDisplay(lead) && (
                                     <div className="flex items-center gap-1 text-[10px] text-[#00D9FF] bg-[#00D9FF]/10 px-1.5 py-0.5 rounded border border-[#00D9FF]/20 max-w-[150px] truncate">
                                        <Briefcase className="w-3 h-3" />
                                        <span className="truncate">{getProjectDisplay(lead)}</span>
                                     </div>
                                  )}
                               </div>
                               
                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-2 bg-[#0A0E27] rounded-lg border border-white/10 shadow-xl p-1 z-20">
                                  <button onClick={() => handleOpenModal(lead)} className="p-1 hover:text-[#FFA500] hover:bg-white/5 rounded">
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => { setLeadToDelete(lead); setIsDeleteAlertOpen(true); }} className="p-1 hover:text-red-500 hover:bg-white/5 rounded">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                               </div>
                            </div>
                            
                            {/* Main Content */}
                            <h4 className="font-bold text-white mb-3 text-sm pr-3 leading-tight group-hover:text-[#00D9FF] transition-colors">
                              {lead.title}
                            </h4>
                            
                            {/* Meta Grid */}
                            <div className="space-y-2 text-xs text-gray-400 pr-3">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <User className="w-3 h-3 text-gray-500" />
                                     <span>{lead.contact_name}</span>
                                  </div>
                                  <span className="text-white font-mono font-bold bg-white/5 px-1.5 rounded">
                                    ₪{Number(lead.value).toLocaleString()}
                                  </span>
                               </div>
                               
                               <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                  {lead.dueDate ? (
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                       <Calendar className="w-3 h-3" />
                                       <span>{new Date(lead.dueDate).toLocaleDateString('he-IL', {day:'numeric', month:'numeric'})}</span>
                                    </div>
                                  ) : <span></span>}
                                  
                                  {lead.assignee && (
                                     <div className="flex items-center gap-1.5" title={`אחראי: ${lead.assignee}`}>
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#9D4EDD] to-[#00D9FF] flex items-center justify-center text-[8px] text-white font-bold">
                                           {lead.assignee.charAt(0)}
                                        </div>
                                     </div>
                                  )}
                               </div>
                            </div>
                         </motion.div>
                       ))}
                     </AnimatePresence>
                     
                     {stageLeads.length === 0 && (
                       <div className="h-32 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-xs text-gray-600 gap-2">
                         <span>אין לידים בשלב זה</span>
                         <Button 
                           size="sm" 
                           variant="link" 
                           onClick={() => { setFormData({...formData, status: stage.id}); handleOpenModal(); }} 
                           className="text-[#00D9FF] h-auto p-0"
                         >
                           + הוסף כאן
                         </Button>
                       </div>
                     )}
                  </div>
               </div>
             );
           })}
        </div>

        {/* --- Modal: Add/Edit Lead --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogContent className="bg-[#050A18] border border-[#00D9FF]/30 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                 <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                    {editingLead ? <Edit className="w-5 h-5 text-[#00D9FF]" /> : <Plus className="w-5 h-5 text-[#00D9FF]" />}
                    {editingLead ? 'עריכת ליד' : 'הוספת ליד חדש'}
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    הזן את פרטי הליד, הלקוח והשיוך לפרויקט
                 </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                 {/* Basic Info */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[#00D9FF] uppercase tracking-wider">פרטי הליד</h3>
                    <div className="space-y-3">
                       <div className="space-y-1">
                          <Label>כותרת הליד *</Label>
                          <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" placeholder="לדוגמה: פיתוח חנות אינטרנטית" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <Label>שם איש קשר *</Label>
                             <input required value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                          </div>
                          <div className="space-y-1">
                             <Label>טלפון</Label>
                             <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Project Link */}
                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-bold text-[#9D4EDD] uppercase tracking-wider flex items-center gap-2">
                       שיוך לפרויקט
                       {formData.projectMode === 'select' ? <Briefcase className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                    </h3>
                    
                    <div className="flex gap-4 mb-2">
                       <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="radio" 
                            name="projectMode" 
                            checked={formData.projectMode === 'select'} 
                            onChange={() => setFormData({...formData, projectMode: 'select'})}
                            className="accent-[#00D9FF]"
                          />
                          <span className={formData.projectMode === 'select' ? 'text-white' : 'text-gray-500'}>בחירה מרשימה</span>
                       </label>
                       <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="radio" 
                            name="projectMode" 
                            checked={formData.projectMode === 'custom'} 
                            onChange={() => setFormData({...formData, projectMode: 'custom'})}
                            className="accent-[#00D9FF]"
                          />
                          <span className={formData.projectMode === 'custom' ? 'text-white' : 'text-gray-500'}>הזנה ידנית</span>
                       </label>
                    </div>

                    {formData.projectMode === 'select' ? (
                       <div className="space-y-1">
                          <Label>בחר פרויקט קיים</Label>
                          <select 
                             value={formData.projectId} 
                             onChange={e => setFormData({...formData, projectId: e.target.value})} 
                             className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none"
                          >
                             <option value="">-- ללא שיוך / בחר פרויקט --</option>
                             {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.client})</option>)}
                          </select>
                       </div>
                    ) : (
                       <div className="space-y-1">
                          <Label>שם הפרויקט (טקסט חופשי)</Label>
                          <input 
                             value={formData.customProjectName} 
                             onChange={e => setFormData({...formData, customProjectName: e.target.value})} 
                             className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none" 
                             placeholder="הזן שם פרויקט זמני או ייעודי..."
                          />
                       </div>
                    )}
                 </div>

                 {/* Pipeline Details */}
                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-bold text-[#FF006E] uppercase tracking-wider">פרטי מכירה</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <Label>תקציב משוער (₪)</Label>
                          <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF006E] outline-none" />
                       </div>
                       <div className="space-y-1">
                          <Label>תאריך יעד</Label>
                          <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF006E] outline-none" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <Label>סטטוס (שלב)</Label>
                          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF006E] outline-none">
                             {Object.values(STAGES).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <Label>עדיפות</Label>
                          <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF006E] outline-none">
                             <option value="low">נמוכה</option>
                             <option value="medium">בינונית</option>
                             <option value="high">גבוהה</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <Label>אחראי טיפול</Label>
                       <select value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF006E] outline-none">
                          <option value="">בחר איש צוות</option>
                          {TEAM_MEMBERS.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                       </select>
                    </div>
                 </div>

                 <DialogFooter className="sticky bottom-0 bg-[#050A18] pt-4 border-t border-white/5 mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400">ביטול</Button>
                    <Button type="submit" className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
                       {editingLead ? 'שמור שינויים' : 'צור ליד'}
                    </Button>
                 </DialogFooter>
              </form>
           </DialogContent>
        </Dialog>

        {/* --- Delete Alert --- */}
        <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
           <DialogContent className="bg-[#050A18] border border-red-500/30 text-white sm:max-w-[400px]">
              <DialogHeader>
                 <DialogTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    מחיקת ליד
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    האם אתה בטוח שברצונך למחוק את הליד <strong>{leadToDelete?.title}</strong>? פעולה זו אינה הפיכה.
                 </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2">
                 <Button variant="ghost" onClick={() => setIsDeleteAlertOpen(false)} className="text-gray-400">ביטול</Button>
                 <Button variant="destructive" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">מחק לצמיתות</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default LeadsPipeline;