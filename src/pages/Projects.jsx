import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Plus, Search, Filter, FolderKanban, Clock, Users, 
  MoreVertical, Calendar, ArrowUpRight, Target, LayoutGrid, List,
  Briefcase, Globe, Server, Activity, CheckCircle2, Folder,
  Smartphone, PenTool, Megaphone, AlertTriangle, Edit, Trash2, X,
  Save, DollarSign, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useApiResource } from '@/hooks/useApiResource';

const Projects = () => {
  const { toast } = useToast();
  
  // --- State ---
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const { items: projects, loading, createItem, updateItem, deleteItem, setItems } = useApiResource('projects');

  // Filters State
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    priority: 'medium',
    category: 'web',
    teamMembers: '',
    technologies: '',
    progress: 0
  });

  // --- Constants ---
  const categories = [
    { id: 'web', label: 'פיתוח אתרים', icon: Globe, color: '#00D9FF' },
    { id: 'mobile', label: 'אפליקציות', icon: Smartphone, color: '#9D4EDD' },
    { id: 'design', label: 'עיצוב ומיתוג', icon: PenTool, color: '#FF006E' },
    { id: 'marketing', label: 'שיווק דיגיטלי', icon: Megaphone, color: '#FFA500' },
    { id: 'other', label: 'אחר', icon: Folder, color: '#10B981' }
  ];

  const statuses = [
    { id: 'planning', label: 'בתכנון', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
    { id: 'active', label: 'פעיל', color: 'text-[#00D9FF] bg-[#00D9FF]/10 border-[#00D9FF]/20' },
    { id: 'paused', label: 'מושהה', color: 'text-[#FFA500] bg-[#FFA500]/10 border-[#FFA500]/20' },
    { id: 'completed', label: 'הושלם', color: 'text-green-500 bg-green-500/10 border-green-500/20' }
  ];

  const priorities = [
    { id: 'high', label: 'גבוהה', color: '#FF006E' },
    { id: 'medium', label: 'בינונית', color: '#FFA500' },
    { id: 'low', label: 'נמוכה', color: '#00D9FF' }
  ];

  useEffect(() => {
    if (!loading && projects.length === 0) {
      // keep data shape consistent for new installs
      setItems([]);
    }
  }, [loading, projects.length, setItems]);

  // --- Handlers ---
  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name || project.title,
        description: project.description || '',
        client: project.client || '',
        budget: typeof project.budget === 'string' ? project.budget.replace(/[^0-9]/g, '') : project.budget,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : project.deadline?.split('T')[0] || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        category: project.category || 'web',
        teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : '',
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
        progress: project.progress || 0
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '', description: '', client: '', budget: '', 
        startDate: new Date().toISOString().split('T')[0],
        endDate: '', status: 'planning', priority: 'medium', 
        category: 'web', teamMembers: '', technologies: '', progress: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.client) {
      toast({ title: "שגיאה", description: "נא למלא שדות חובה (שם פרויקט ולקוח)", variant: "destructive" });
      return;
    }

    const processedData = {
      name: formData.name,
      title: formData.name, // Support legacy key
      description: formData.description,
      client: formData.client,
      budget: Number(formData.budget),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      deadline: new Date(formData.endDate).toISOString(), // Support legacy key
      status: formData.status,
      priority: formData.priority,
      category: formData.category,
      progress: Number(formData.progress),
      teamMembers: formData.teamMembers.split(',').map(s => s.trim()).filter(Boolean),
      members: formData.teamMembers.split(',').map(s => s.trim()).filter(Boolean), // Support legacy key
      technologies: formData.technologies.split(',').map(s => s.trim()).filter(Boolean),
      tasks: { total: 0, completed: 0 } // Default for new
    };

    if (editingProject) {
      updateItem(editingProject.id, processedData)
        .then(() => toast({ title: "פרויקט עודכן", description: "השינויים נשמרו בהצלחה" }))
        .catch(() => toast({ title: "שגיאה", description: "שמירה נכשלה", variant: 'destructive' }));
    } else {
      createItem(processedData)
        .then(() => toast({ title: "פרויקט נוצר", description: "הפרויקט נוסף למערכת בהצלחה" }))
        .catch(() => toast({ title: "שגיאה", description: "שמירה נכשלה", variant: 'destructive' }));
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!projectToDelete) return;
    deleteItem(projectToDelete.id)
      .then(() => toast({ title: "פרויקט נמחק", variant: "destructive" }))
      .finally(() => {
        setIsDeleteAlertOpen(false);
        setProjectToDelete(null);
      });
  };

  // --- Filtering & Stats ---
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || p.status === filters.status;
    const matchesPriority = filters.priority === 'all' || p.priority === filters.priority;
    const matchesCategory = filters.category === 'all' || p.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    budget: projects.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0)
  };

  const getCategoryIcon = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.icon : Folder;
  };

  const getCategoryColor = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.color : '#gray';
  };

  return (
    <>
      <Helmet>
        <title>ניהול פרויקטים - Empire CRM</title>
      </Helmet>

      <div className="space-y-6 pb-20 font-rubik" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="w-full xl:w-auto space-y-4">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
                פרויקטים ונכסים
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#00D9FF]" />
                ניהול ומעקב אחר כל הפרויקטים במערכת
              </p>
            </div>

            {/* Stats Dashboard */}
            <div className="flex gap-4 overflow-x-auto pb-2 xl:pb-0">
               <div className="bg-[#0A0E27]/80 border border-[#00D9FF]/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(0,217,255,0.1)]">
                  <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">סה"כ פרויקטים</span>
                  <span className="text-2xl font-black text-white">{stats.total}</span>
               </div>
               <div className="bg-[#0A0E27]/80 border border-[#00D9FF]/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(0,217,255,0.1)]">
                  <span className="text-[10px] text-[#00D9FF] font-bold uppercase mb-1">פעילים כעת</span>
                  <span className="text-2xl font-black text-[#00D9FF]">{stats.active}</span>
               </div>
               <div className="bg-[#0A0E27]/80 border border-green-500/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span className="text-[10px] text-green-500 font-bold uppercase mb-1">הושלמו</span>
                  <span className="text-2xl font-black text-green-500">{stats.completed}</span>
               </div>
               <div className="bg-[#0A0E27]/80 border border-[#9D4EDD]/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(157,78,221,0.1)]">
                  <span className="text-[10px] text-[#9D4EDD] font-bold uppercase mb-1">שווי כולל</span>
                  <span className="text-2xl font-black text-[#9D4EDD]">₪{(stats.budget/1000).toFixed(1)}k</span>
               </div>
            </div>
          </div>

          <Button 
             onClick={() => handleOpenModal()}
             className="bg-gradient-to-r from-[#00D9FF] to-[#00B4D8] text-[#050A18] font-bold shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] transition-all h-12 px-6 w-full xl:w-auto"
          >
             <Plus className="w-5 h-5 ml-2" />
             פרויקט חדש
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0A0E27]/60 border border-[#00D9FF]/10 backdrop-blur-xl p-4 rounded-2xl flex flex-col xl:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-lg">
           <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
              <div className="relative group w-full md:w-64">
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D9FF] transition-colors" />
                 <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="חיפוש לפי שם או לקוח..." 
                   className="w-full bg-[#050A18] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-all"
                 />
              </div>
              
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
                 <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#00D9FF] outline-none"
                 >
                    <option value="all">כל הסטטוסים</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                 </select>
                 <select 
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#00D9FF] outline-none"
                 >
                    <option value="all">כל הקטגוריות</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                 </select>
                 <select 
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#00D9FF] outline-none"
                 >
                    <option value="all">כל העדיפויות</option>
                    {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                 </select>
              </div>
           </div>

           <div className="flex bg-[#050A18] p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-[#00D9FF]/20 text-[#00D9FF]" : "text-gray-500 hover:text-white")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-[#00D9FF]/20 text-[#00D9FF]" : "text-gray-500 hover:text-white")}
              >
                <List className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Projects Grid */}
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
           {loading ? (
             <div className="col-span-full py-20 text-center text-gray-500">טוען נתונים...</div>
           ) : filteredProjects.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-[#0A0E27]/30 border border-dashed border-white/10 rounded-2xl">
               <Folder className="w-12 h-12 text-gray-600 mx-auto mb-4" />
               <p className="text-gray-400 text-lg">לא נמצאו פרויקטים</p>
               <Button variant="link" onClick={() => handleOpenModal()} className="text-[#00D9FF]">צור פרויקט ראשון</Button>
             </div>
           ) : (
             <AnimatePresence>
                {filteredProjects.map((project, idx) => {
                  const CatIcon = getCategoryIcon(project.category);
                  const catColor = getCategoryColor(project.category);
                  const statusInfo = statuses.find(s => s.id === project.status) || statuses[0];

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                       <div className="group relative bg-[#0A0E27]/40 border border-[#00D9FF]/10 hover:border-[#00D9FF]/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,217,255,0.1)] overflow-hidden h-full flex flex-col">
                          {/* Hover Glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                          {/* Header */}
                          <div className="flex justify-between items-start mb-6 relative z-10">
                             <div className="flex-1 min-w-0 ml-4">
                                <div className="flex gap-2 mb-2">
                                   <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", statusInfo.color)}>
                                      {statusInfo.label}
                                   </span>
                                   <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#050A18] border border-white/10 text-gray-400">
                                      {categories.find(c => c.id === project.category)?.label || project.category}
                                   </span>
                                </div>
                                <Link to={`/projects/${project.id}`}>
                                   <h3 className="text-xl font-bold text-white group-hover:text-[#00D9FF] transition-colors truncate mb-1">
                                      {project.name}
                                   </h3>
                                </Link>
                                <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                                   <Briefcase className="w-3 h-3" />
                                   {project.client}
                                </p>
                             </div>
                             
                             {/* Actions Dropdown Mock or Direct Actions */}
                             <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 top-0">
                                <button onClick={() => handleOpenModal(project)} className="p-2 bg-[#050A18] rounded-lg border border-white/10 text-gray-400 hover:text-[#FFA500] hover:border-[#FFA500] shadow-lg">
                                   <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setProjectToDelete(project); setIsDeleteAlertOpen(true); }} className="p-2 bg-[#050A18] rounded-lg border border-white/10 text-gray-400 hover:text-red-500 hover:border-red-500 shadow-lg">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>

                             <div className="w-10 h-10 rounded-2xl bg-[#050A18] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shrink-0">
                                <CatIcon className="w-5 h-5" style={{ color: catColor }} />
                             </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                             <div className="bg-[#050A18]/50 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                   <DollarSign className="w-3 h-3" /> תקציב
                                </div>
                                <span className="text-base font-bold text-white">₪{Number(project.budget).toLocaleString()}</span>
                             </div>
                             <div className="bg-[#050A18]/50 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                   <Clock className="w-3 h-3" /> סיום
                                </div>
                                <span className="text-base font-bold text-white text-sm pt-0.5">
                                   {new Date(project.endDate).toLocaleDateString('he-IL')}
                                </span>
                             </div>
                          </div>

                          {/* Progress */}
                          <div className="mb-6 relative z-10 mt-auto">
                             <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-400">התקדמות</span>
                                <span className="text-[#00D9FF] font-bold">{project.progress}%</span>
                             </div>
                             <div className="h-2 w-full bg-[#050A18] rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${project.progress}%` }}
                                   className="h-full rounded-full relative"
                                   style={{ backgroundColor: catColor }}
                                >
                                   <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </motion.div>
                             </div>
                          </div>

                          {/* Footer: Team & Link */}
                          <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                             <div className="flex -space-x-2 space-x-reverse">
                                {project.teamMembers.slice(0, 3).map((m, i) => (
                                   <div key={i} className="w-7 h-7 rounded-full bg-[#050A18] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-md relative hover:z-10 hover:scale-110 transition-transform" title={typeof m === 'string' ? m : 'Member'}>
                                      {typeof m === 'string' ? m.charAt(0).toUpperCase() : '?'}
                                   </div>
                                ))}
                                {project.teamMembers.length > 3 && (
                                   <div className="w-7 h-7 rounded-full bg-[#0A0E27] border border-white/10 flex items-center justify-center text-[9px] text-gray-400">
                                      +{project.teamMembers.length - 3}
                                   </div>
                                )}
                             </div>
                             <Link to={`/projects/${project.id}`}>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#00D9FF] hover:bg-[#00D9FF]/10 p-0 h-auto font-normal text-xs gap-1">
                                   ניהול
                                   <ArrowUpRight className="w-3 h-3" />
                                </Button>
                             </Link>
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
           )}
        </div>

        {/* --- Add/Edit Project Modal --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogContent className="bg-[#050A18] border border-[#00D9FF]/30 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                 <DialogTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] flex items-center gap-2">
                    {editingProject ? <Edit className="w-6 h-6 text-[#00D9FF]" /> : <Plus className="w-6 h-6 text-[#00D9FF]" />}
                    {editingProject ? 'עריכת פרויקט' : 'יצירת פרויקט חדש'}
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    מלא את כל הפרטים הנדרשים ליצירת כרטיס פרויקט חדש במערכת
                 </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                 {/* Basic Info */}
                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#00D9FF] uppercase tracking-wider border-b border-[#00D9FF]/20 pb-2">פרטים כלליים</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>שם הפרויקט *</Label>
                          <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                       </div>
                       <div className="space-y-2">
                          <Label>שם לקוח *</Label>
                          <input required value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label>תיאור הפרויקט</Label>
                       <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                    </div>
                 </div>

                 {/* Settings */}
                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#9D4EDD] uppercase tracking-wider border-b border-[#9D4EDD]/20 pb-2">הגדרות וניהול</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="space-y-2">
                          <Label>קטגוריה</Label>
                          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none">
                             {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label>סטטוס</Label>
                          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none">
                             {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label>עדיפות</Label>
                          <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none">
                             {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label>תקציב (₪)</Label>
                          <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>תאריך התחלה</Label>
                          <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none" />
                       </div>
                       <div className="space-y-2">
                          <Label>תאריך יעד</Label>
                          <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none" />
                       </div>
                    </div>
                 </div>

                 {/* Tech & Team */}
                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#FF006E] uppercase tracking-wider border-b border-[#FF006E]/20 pb-2">צוות וטכנולוגיות</h3>
                    <div className="space-y-2">
                       <Label>חברי צוות (מופרד בפסיקים)</Label>
                       <input value={formData.teamMembers} onChange={e => setFormData({...formData, teamMembers: e.target.value})} placeholder="דניאל, שרה, יוסי..." className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF006E] outline-none" />
                    </div>
                    <div className="space-y-2">
                       <Label>טכנולוגיות (מופרד בפסיקים)</Label>
                       <input value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} placeholder="React, Node.js, AWS..." className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FF006E] outline-none" />
                    </div>
                    <div className="space-y-2">
                       <Label>התקדמות ({formData.progress}%)</Label>
                       <input type="range" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} className="w-full accent-[#00D9FF]" />
                    </div>
                 </div>

                 <DialogFooter className="sticky bottom-0 bg-[#050A18] pt-4 border-t border-white/5 mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400">ביטול</Button>
                    <Button type="submit" className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
                       {editingProject ? 'שמור שינויים' : 'צור פרויקט'}
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
                    מחיקת פרויקט
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    האם אתה בטוח שברצונך למחוק את הפרויקט <strong>{projectToDelete?.name}</strong>? כל המשימות והקבצים המקושרים יימחקו גם כן.
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

export default Projects;