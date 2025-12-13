
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Loader2, CheckCircle2, ClipboardList, Plus, 
  MoreVertical, Calendar, User, Flag, Trash2, Edit, 
  ArrowLeft, Search, Save, X, AlertTriangle, Briefcase, BarChart2,
  Filter, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const Brainstorm = () => {
  const { toast } = useToast();
  
  // --- State ---
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters State
  const [filters, setFilters] = useState({
    project: 'all',
    category: 'all',
    priority: 'all',
    status: 'all'
  });
  
  // Drag & Drop State
  const [draggedItem, setDraggedItem] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = creating new
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    progress: 0,
    dueDate: '',
    projectId: '',
    category: 'general',
    stage: 'ideas',
    team: ''
  });

  // --- Columns Configuration ---
  const columns = [
    { id: 'ideas', label: 'רעיונות (Ideas)', icon: Lightbulb, color: '#00D9FF' },
    { id: 'inprogress', label: 'בתהליך (In Progress)', icon: Loader2, color: '#FFA500' },
    { id: 'review', label: 'בבדיקה (Review)', icon: ClipboardList, color: '#9D4EDD' },
    { id: 'completed', label: 'הושלם (Completed)', icon: CheckCircle2, color: '#10B981' }
  ];

  const categories = [
    { id: 'general', label: 'כללי', color: 'bg-gray-500' },
    { id: 'feature', label: 'פיצ׳ר חדש', color: 'bg-blue-500' },
    { id: 'marketing', label: 'שיווק', color: 'bg-purple-500' },
    { id: 'design', label: 'עיצוב', color: 'bg-pink-500' },
    { id: 'bug', label: 'באג/תיקון', color: 'bg-red-500' }
  ];

  // --- Load Data ---
  useEffect(() => {
    // Load Projects for linkage
    const storedProjects = JSON.parse(localStorage.getItem('empire_projects') || '[]');
    setProjects(storedProjects);

    // Load Brainstorm Items
    const storedItems = JSON.parse(localStorage.getItem('empire_brainstorm') || '[]');
    if (storedItems.length === 0) {
       // Seed initial data if empty
       const seed = [
         { id: 'bs_1', title: 'שדרוג דף נחיתה', description: 'הוספת אלמנטים תלת מימדיים', priority: 'high', progress: 0, stage: 'ideas', projectId: '', category: 'design', dueDate: '2024-12-20', team: 'דניאל' },
         { id: 'bs_2', title: 'אוטומציה ללידים', description: 'חיבור Zapier למערכת', priority: 'medium', progress: 45, stage: 'inprogress', projectId: '', category: 'feature', dueDate: '2024-12-25', team: 'שרה' }
       ];
       setItems(seed);
       localStorage.setItem('empire_brainstorm', JSON.stringify(seed));
    } else {
       setItems(storedItems);
    }
  }, []);

  // --- Persistence ---
  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('empire_brainstorm', JSON.stringify(newItems));
  };

  // --- Handlers ---
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.stage !== stageId) {
      const updatedItems = items.map(item => 
        item.id === draggedItem.id ? { ...item, stage: stageId } : item
      );
      saveItems(updatedItems);
      toast({ title: "סטטוס עודכן", description: `הפריט הועבר ל-${columns.find(c => c.id === stageId).label.split(' ')[0]}` });
    }
    setDraggedItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update
      const updatedItems = items.map(item => 
        item.id === editingItem.id ? { ...item, ...formData } : item
      );
      saveItems(updatedItems);
      toast({ title: "עודכן בהצלחה", description: formData.title });
    } else {
      // Create
      const newItem = {
        id: `bs_${Date.now()}`,
        ...formData
      };
      saveItems([...items, newItem]);
      toast({ title: "נוצר בהצלחה", description: formData.title });
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    const filtered = items.filter(i => i.id !== itemToDelete.id);
    saveItems(filtered);
    setIsDeleteAlertOpen(false);
    setItemToDelete(null);
    toast({ title: "נמחק", variant: "destructive" });
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        progress: 0,
        dueDate: new Date().toISOString().split('T')[0],
        projectId: '',
        category: 'general',
        stage: 'ideas',
        team: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // --- Helpers ---
  const getPriorityColor = (p) => {
    switch(p) {
      case 'high': return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'medium': return { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      case 'low': return { text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      default: return { text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
    }
  };

  const getPriorityLabel = (p) => {
    switch(p) {
      case 'high': return 'גבוהה';
      case 'medium': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return p;
    }
  };

  const getCategoryLabel = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.label : catId;
  };

  // --- Filtering ---
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filters.project === 'all' || item.projectId === filters.project;
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesPriority = filters.priority === 'all' || item.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || item.stage === filters.status;
    return matchesSearch && matchesProject && matchesCategory && matchesPriority && matchesStatus;
  });

  // Stats Calculation
  const stats = {
    total: filteredItems.length,
    inprogress: filteredItems.filter(i => i.stage === 'inprogress').length,
    completed: filteredItems.filter(i => i.stage === 'completed').length,
    ideas: filteredItems.filter(i => i.stage === 'ideas').length
  };

  return (
    <>
      <Helmet>
        <title>Brainstorm & Planning - Empire CRM</title>
      </Helmet>

      <div className="h-full flex flex-col space-y-6 pb-6 font-rubik" dir="rtl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
               לוח סיעור מוחות
             </h1>
             <p className="text-gray-400 text-sm mt-1">תכנון אסטרטגי, רעיונות ומעקב ביצועים</p>
           </div>
           
           <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-end md:items-center">
              <Button 
                onClick={() => openModal()}
                className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8] shadow-[0_0_15px_rgba(0,217,255,0.3)]"
              >
                 <Plus className="w-5 h-5 ml-2" />
                 רעיון חדש
              </Button>
           </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0A0E27]/60 border border-[#00D9FF]/10 backdrop-blur-xl p-4 rounded-2xl flex flex-col xl:flex-row gap-4 justify-between items-center shadow-lg">
           <div className="relative group w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D9FF] transition-colors" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש רעיונות..." 
                className="w-full bg-[#050A18] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-all"
              />
           </div>

           <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
              <div className="flex items-center bg-[#050A18] border border-white/10 rounded-xl px-2">
                 <Filter className="w-4 h-4 text-gray-500 ml-2" />
                 <select 
                    value={filters.project}
                    onChange={(e) => setFilters({...filters, project: e.target.value})}
                    className="bg-transparent border-none outline-none text-sm text-gray-300 py-2"
                 >
                    <option value="all">כל הפרויקטים</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.title}</option>)}
                 </select>
              </div>

              <div className="flex items-center bg-[#050A18] border border-white/10 rounded-xl px-2">
                 <Tag className="w-4 h-4 text-gray-500 ml-2" />
                 <select 
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="bg-transparent border-none outline-none text-sm text-gray-300 py-2"
                 >
                    <option value="all">כל הקטגוריות</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                 </select>
              </div>

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
           </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-[#050A18]/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                 <p className="text-gray-400 text-xs font-bold uppercase">סה"כ רעיונות</p>
                 <p className="text-2xl font-black text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-white"><Lightbulb className="w-5 h-5" /></div>
           </div>
           <div className="bg-[#050A18]/60 border border-[#FFA500]/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                 <p className="text-gray-400 text-xs font-bold uppercase text-[#FFA500]">בתהליך עבודה</p>
                 <p className="text-2xl font-black text-[#FFA500]">{stats.inprogress}</p>
              </div>
              <div className="p-3 bg-[#FFA500]/10 rounded-xl text-[#FFA500]"><Loader2 className="w-5 h-5 animate-spin-slow" /></div>
           </div>
           <div className="bg-[#050A18]/60 border border-[#10B981]/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                 <p className="text-gray-400 text-xs font-bold uppercase text-[#10B981]">הושלמו בהצלחה</p>
                 <p className="text-2xl font-black text-[#10B981]">{stats.completed}</p>
              </div>
              <div className="p-3 bg-[#10B981]/10 rounded-xl text-[#10B981]"><CheckCircle2 className="w-5 h-5" /></div>
           </div>
           <div className="bg-[#050A18]/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                 <p className="text-gray-400 text-xs font-bold uppercase">בבנק הרעיונות</p>
                 <p className="text-2xl font-black text-[#00D9FF]">{stats.ideas}</p>
              </div>
              <div className="p-3 bg-[#00D9FF]/10 rounded-xl text-[#00D9FF]"><BarChart2 className="w-5 h-5" /></div>
           </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto min-h-[500px]">
           <div className="flex gap-6 min-w-[1000px] h-full pb-4">
              {columns.map(col => (
                <div 
                   key={col.id} 
                   className="flex-1 min-w-[280px] flex flex-col bg-[#0A0E27]/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden transition-colors"
                   onDragOver={handleDragOver}
                   onDrop={(e) => handleDrop(e, col.id)}
                >
                   {/* Column Header */}
                   <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#050A18]/50" style={{ borderTop: `3px solid ${col.color}` }}>
                      <div className="flex items-center gap-2 font-bold text-gray-200">
                         <col.icon className="w-4 h-4" style={{ color: col.color }} />
                         {col.label}
                      </div>
                      <span className="bg-white/5 px-2 py-0.5 rounded text-xs text-gray-400 font-mono">
                         {filteredItems.filter(i => i.stage === col.id).length}
                      </span>
                   </div>

                   {/* Items Area */}
                   <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-[#050A18]/20">
                      <AnimatePresence>
                         {filteredItems
                           .filter(item => item.stage === col.id)
                           .map((item, index) => {
                             const pColor = getPriorityColor(item.priority);
                             const project = projects.find(p => p.id === item.projectId);

                             return (
                               <motion.div
                                 key={item.id}
                                 layoutId={item.id}
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.9 }}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, item)}
                                 className="bg-[#050A18] border border-white/10 rounded-xl p-4 shadow-sm hover:shadow-[0_0_15px_rgba(0,217,255,0.1)] hover:border-[#00D9FF]/30 cursor-grab active:cursor-grabbing group relative transition-all"
                               >
                                  {/* Actions Hover Menu */}
                                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                     <button onClick={() => openModal(item)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-[#00D9FF]">
                                        <Edit className="w-3 h-3" />
                                     </button>
                                     <button onClick={() => { setItemToDelete(item); setIsDeleteAlertOpen(true); }} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-3 h-3" />
                                     </button>
                                  </div>

                                  <div className="flex justify-between items-start mb-2">
                                     <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase", pColor.text, pColor.bg, pColor.border)}>
                                        {getPriorityLabel(item.priority)}
                                     </span>
                                     <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        {getCategoryLabel(item.category)}
                                     </span>
                                  </div>

                                  <h3 className="font-bold text-gray-100 text-sm mb-1 leading-relaxed">{item.title}</h3>
                                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">{item.description}</p>

                                  {/* Progress Bar */}
                                  <div className="mb-3">
                                     <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                        <span>התקדמות</span>
                                        <span>{item.progress}%</span>
                                     </div>
                                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#00D9FF] rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }}></div>
                                     </div>
                                  </div>

                                  {/* Footer Meta */}
                                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                                     <div className="flex items-center gap-2" title={project?.name || 'אין פרויקט מקושר'}>
                                        <Briefcase className="w-3 h-3 text-gray-600" />
                                        <span className="text-[10px] text-gray-500 max-w-[80px] truncate">{project?.name || 'כללי'}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-gray-600" />
                                        <span className="text-[10px] text-gray-500">{item.dueDate ? new Date(item.dueDate).toLocaleDateString('he-IL', {day: 'numeric', month: 'numeric'}) : '--'}</span>
                                     </div>
                                     {item.team && (
                                       <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center text-[9px] text-white font-bold" title={item.team}>
                                          {item.team.charAt(0)}
                                       </div>
                                     )}
                                  </div>
                               </motion.div>
                             );
                           })}
                      </AnimatePresence>
                      <Button 
                        onClick={() => {
                           setFormData(prev => ({ ...prev, stage: col.id }));
                           openModal();
                        }}
                        variant="ghost" 
                        className="w-full border border-dashed border-white/10 text-gray-500 hover:text-[#00D9FF] hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/5 py-6 rounded-xl gap-2"
                      >
                         <Plus className="w-4 h-4" />
                         הוסף כרטיס
                      </Button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* --- Add/Edit Modal --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogContent className="bg-[#0A0E27] border border-[#00D9FF]/20 text-white sm:max-w-[600px]">
              <DialogHeader>
                 <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {editingItem ? <Edit className="w-5 h-5 text-[#00D9FF]" /> : <Plus className="w-5 h-5 text-[#00D9FF]" />}
                    {editingItem ? 'עריכת רעיון' : 'יצירת רעיון חדש'}
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    מלא את הפרטים עבור כרטיס הסיעור מוחות
                 </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label>כותרת הרעיון</Label>
                    <input 
                       required
                       value={formData.title} 
                       onChange={e => setFormData({...formData, title: e.target.value})}
                       className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       placeholder="לדוגמה: קמפיין השקה חדש"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <Label>תיאור מפורט</Label>
                    <textarea 
                       rows={3}
                       value={formData.description} 
                       onChange={e => setFormData({...formData, description: e.target.value})}
                       className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       placeholder="מה המטרה ואיך נשיג אותה?"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>קטגוריה</Label>
                       <select 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       >
                          {categories.map(cat => (
                             <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label>עדיפות</Label>
                       <select 
                          value={formData.priority}
                          onChange={e => setFormData({...formData, priority: e.target.value})}
                          className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       >
                          <option value="low">נמוכה</option>
                          <option value="medium">בינונית</option>
                          <option value="high">גבוהה</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>פרויקט מקושר</Label>
                       <select 
                          value={formData.projectId}
                          onChange={e => setFormData({...formData, projectId: e.target.value})}
                          className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       >
                          <option value="">ללא שיוך (כללי)</option>
                          {projects.map(p => (
                             <option key={p.id} value={p.id}>{p.name || p.title}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label>תאריך יעד</Label>
                       <input 
                          type="date"
                          value={formData.dueDate}
                          onChange={e => setFormData({...formData, dueDate: e.target.value})}
                          className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>שלב</Label>
                       <select 
                          value={formData.stage}
                          onChange={e => setFormData({...formData, stage: e.target.value})}
                          className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       >
                          {columns.map(col => (
                             <option key={col.id} value={col.id}>{col.label}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label>אחוז התקדמות ({formData.progress}%)</Label>
                       <input 
                          type="range"
                          min="0" max="100" step="5"
                          value={formData.progress}
                          onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                          className="w-full accent-[#00D9FF]"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label>איש צוות אחראי</Label>
                    <input 
                       value={formData.team} 
                       onChange={e => setFormData({...formData, team: e.target.value})}
                       className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]"
                       placeholder="שם חבר צוות"
                    />
                 </div>

                 <DialogFooter className="mt-6 gap-2">
                    <Button type="button" variant="ghost" onClick={closeModal} className="text-gray-400">ביטול</Button>
                    <Button type="submit" className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
                       {editingItem ? 'שמור שינויים' : 'צור רעיון'}
                    </Button>
                 </DialogFooter>
              </form>
           </DialogContent>
        </Dialog>

        {/* --- Delete Alert --- */}
        <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
           <DialogContent className="bg-[#0A0E27] border border-red-500/30 text-white sm:max-w-[400px]">
              <DialogHeader>
                 <DialogTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    מחיקת רעיון
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    האם אתה בטוח שברצונך למחוק את "{itemToDelete?.title}"? פעולה זו אינה הפיכה.
                 </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2">
                 <Button variant="ghost" onClick={() => setIsDeleteAlertOpen(false)} className="text-gray-400">ביטול</Button>
                 <Button variant="destructive" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">מחק</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default Brainstorm;
