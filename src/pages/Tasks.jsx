import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Plus, Trash2, Calendar, Clock, AlertCircle, 
  Search, Filter, FolderKanban, Radio, CheckCircle2, LayoutGrid, List,
  MoreVertical, Edit, AlertTriangle, ArrowRight, X, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { getProjects, getChannels, getTasks, updateCachedTasks } from '@/lib/api';

const Tasks = () => {
  const { toast } = useToast();
  
  // --- State ---
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    channel: 'all'
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    status: 'todo',
    projectId: '',
    channelId: '',
    progress: 0
  });

  // --- Constants ---
  const priorities = [
    { id: 'high', label: 'גבוהה', color: '#FF006E' },
    { id: 'medium', label: 'בינונית', color: '#FFA500' },
    { id: 'low', label: 'נמוכה', color: '#00D9FF' }
  ];

  const statuses = [
    { id: 'todo', label: 'לביצוע', color: 'text-gray-400 bg-gray-400/10' },
    { id: 'in_progress', label: 'בתהליך', color: 'text-[#FFA500] bg-[#FFA500]/10' },
    { id: 'completed', label: 'הושלם', color: 'text-green-500 bg-green-500/10' }
  ];

  // --- Data Loading ---
  useEffect(() => {
    loadData();
  }, []);

  const normalizeTask = (task) => ({
    ...task,
    title: task.title || 'משימה ללא כותרת',
    description: task.description || '',
    dueDate: task.dueDate || task.due_date || task.date || '',
    dueTime: task.dueTime || task.due_time || '',
    priority: task.priority || 'medium',
    status: task.status || (task.completed ? 'completed' : 'todo'),
    projectId: task.projectId || task.project_id || '',
    channelId: task.channelId || task.channel_id || '',
    progress: typeof task.progress === 'number' ? task.progress : task.status === 'completed' ? 100 : 0
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [fetchedProjects, fetchedChannels, fetchedTasks] = await Promise.all([
        getProjects(),
        getChannels(),
        getTasks()
      ]);

      setProjects(fetchedProjects);
      setChannels(fetchedChannels);
      setTasks(fetchedTasks.map(normalizeTask));
    } catch (err) {
      console.error('Failed to load tasks data', err);
      setError('טעינת משימות נכשלה מהשרת.');
      toast({ title: "שגיאה", description: "תקלה בטעינת הנתונים", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    updateCachedTasks(newTasks);
  };

  // --- Handlers ---
  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || task.date || '', // Support legacy 'date'
        dueTime: task.dueTime || '',
        priority: task.priority || 'medium',
        status: task.status || (task.completed ? 'completed' : 'todo'),
        projectId: task.projectId || '',
        channelId: task.channelId || '',
        progress: task.progress || 0
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '12:00',
        priority: 'medium',
        status: 'todo',
        projectId: '',
        channelId: '',
        progress: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({ title: "שגיאה", description: "נא למלא כותרת למשימה", variant: "destructive" });
      return;
    }

    const processedData = {
      ...formData,
      // Ensure we keep legacy field synced if needed or just rely on new fields
      date: formData.dueDate, 
      completed: formData.status === 'completed'
    };

    if (editingTask) {
      const updatedTasks = tasks.map(t => 
        t.id === editingTask.id ? { ...t, ...processedData } : t
      );
      saveTasks(updatedTasks);
      toast({ title: "משימה עודכנה", description: "השינויים נשמרו בהצלחה" });
    } else {
      const newTask = {
        id: `task_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...processedData
      };
      saveTasks([newTask, ...tasks]);
      toast({ title: "משימה נוצרה", description: "המשימה נוספה לרשימה בהצלחה" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!taskToDelete) return;
    const updatedTasks = tasks.filter(t => t.id !== taskToDelete.id);
    saveTasks(updatedTasks);
    setIsDeleteAlertOpen(false);
    setTaskToDelete(null);
    toast({ title: "משימה נמחקה", variant: "destructive" });
  };

  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'completed', progress: newStatus === 'completed' ? 100 : t.progress } : t
    );
    saveTasks(updatedTasks);
    
    if (newStatus === 'completed') {
       toast({ title: "המשימה הושלמה!", className: "bg-green-500 border-green-600 text-white" });
    }
  };

  // --- Filtering & Stats ---
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || t.status === filters.status;
    const matchesPriority = filters.priority === 'all' || t.priority === filters.priority;
    const matchesProject = filters.project === 'all' || t.projectId === filters.project;
    const matchesChannel = filters.channel === 'all' || t.channelId === filters.channel;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesChannel;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      const dueDateTime = new Date(`${t.dueDate}T${t.dueTime || '23:59'}`);
      return !Number.isNaN(dueDateTime.getTime()) && dueDateTime < new Date();
    }).length,
    highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
  };

  const getPriorityColor = (p) => {
     const prio = priorities.find(x => x.id === p) || priorities[1];
     return prio.color;
  };

  const getProjectName = (id) => {
    const p = projects.find(x => x.id === id);
    return p ? p.name : null;
  };

  const getChannelName = (id) => {
    const c = channels.find(x => x.id === id);
    return c ? c.name : null;
  };

  return (
    <>
      <Helmet>
        <title>ניהול משימות - Empire CRM</title>
      </Helmet>

      <div className="space-y-6 pb-20 font-rubik" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="w-full xl:w-auto space-y-4">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#FFA500] to-[#FF006E] drop-shadow-[0_0_10px_rgba(255,165,0,0.3)]">
                ניהול משימות
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#FFA500]" />
                מעקב ביצועים, דדליינים וניהול שוטף
              </p>
            </div>

            {/* Stats Dashboard */}
            <div className="flex gap-4 overflow-x-auto pb-2 xl:pb-0">
               <div className="bg-[#0A0E27]/80 border border-[#FFA500]/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(255,165,0,0.1)]">
                  <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">סה"כ משימות</span>
                  <span className="text-2xl font-black text-white">{stats.total}</span>
               </div>
               <div className="bg-[#0A0E27]/80 border border-green-500/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span className="text-[10px] text-green-500 font-bold uppercase mb-1">הושלמו</span>
                  <span className="text-2xl font-black text-green-500">{stats.completed}</span>
               </div>
               <div className="bg-[#0A0E27]/80 border border-red-500/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <span className="text-[10px] text-red-500 font-bold uppercase mb-1">באיחור</span>
                  <span className="text-2xl font-black text-red-500">{stats.overdue}</span>
               </div>
               <div className="bg-[#0A0E27]/80 border border-[#FF006E]/20 rounded-xl p-4 min-w-[140px] flex flex-col shadow-[0_0_15px_rgba(255,0,110,0.1)]">
                  <span className="text-[10px] text-[#FF006E] font-bold uppercase mb-1">עדיפות גבוהה</span>
                  <span className="text-2xl font-black text-[#FF006E]">{stats.highPriority}</span>
               </div>
            </div>
          </div>

          <Button 
             onClick={() => handleOpenModal()}
             className="bg-gradient-to-r from-[#FFA500] to-[#FF006E] text-white font-bold shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] transition-all h-12 px-6 w-full xl:w-auto"
          >
             <Plus className="w-5 h-5 ml-2" />
             משימה חדשה
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0A0E27]/60 border border-[#FFA500]/10 backdrop-blur-xl p-4 rounded-2xl flex flex-col xl:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-lg">
           <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
              <div className="relative group w-full md:w-64">
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFA500] transition-colors" />
                 <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="חיפוש משימות..." 
                   className="w-full bg-[#050A18] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#FFA500] transition-all"
                 />
              </div>
              
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                 <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#FFA500] outline-none"
                 >
                    <option value="all">כל הסטטוסים</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                 </select>
                 <select 
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#FFA500] outline-none"
                 >
                    <option value="all">כל העדיפויות</option>
                    {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                 </select>
                 <select 
                    value={filters.project}
                    onChange={(e) => setFilters({...filters, project: e.target.value})}
                    className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#FFA500] outline-none max-w-[150px]"
                 >
                    <option value="all">כל הפרויקטים</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <select 
                    value={filters.channel}
                    onChange={(e) => setFilters({...filters, channel: e.target.value})}
                    className="bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#FFA500] outline-none max-w-[150px]"
                 >
                    <option value="all">כל הערוצים</option>
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>
           </div>

           <div className="flex bg-[#050A18] p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-[#FFA500]/20 text-[#FFA500]" : "text-gray-500 hover:text-white")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-[#FFA500]/20 text-[#FFA500]" : "text-gray-500 hover:text-white")}
              >
                <List className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Tasks Grid/List */}
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
           {loading ? (
             <div className="col-span-full py-20 text-center text-gray-500">טוען משימות...</div>
           ) : error ? (
             <div className="col-span-full py-12 text-center text-red-400 bg-red-500/5 border border-red-500/30 rounded-2xl">
               {error}
             </div>
           ) : filteredTasks.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-[#0A0E27]/30 border border-dashed border-white/10 rounded-2xl">
               <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
               <p className="text-gray-400 text-lg">לא נמצאו משימות</p>
               <Button variant="link" onClick={() => handleOpenModal()} className="text-[#FFA500]">צור משימה ראשונה</Button>
             </div>
           ) : (
             <AnimatePresence>
                {filteredTasks.map((task, idx) => {
                  const isOverdue = task.status !== 'completed' && new Date(task.dueDate + 'T' + (task.dueTime || '23:59')) < new Date();
                  const priorityColor = getPriorityColor(task.priority);
                  const projectName = getProjectName(task.projectId);
                  const channelName = getChannelName(task.channelId);

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "group relative bg-[#050A18]/60 backdrop-blur-md border rounded-xl p-6 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden",
                        task.status === 'completed' ? "border-green-500/20 opacity-70" : "border-[#FFA500]/20 hover:border-[#FFA500]",
                        isOverdue && "border-red-500/40 hover:border-red-500"
                      )}
                    >
                       {/* Priority Indicator */}
                       <div className={cn("absolute top-0 right-0 w-1.5 h-full transition-all", task.status === 'completed' ? "bg-green-500" : isOverdue ? "bg-red-500" : "")} 
                         style={{ backgroundColor: (task.status !== 'completed' && !isOverdue) ? priorityColor : undefined }}
                       />

                       <div className="flex justify-between items-start mb-4 pr-3">
                          <div className="flex items-start gap-3 flex-1">
                             <button 
                               onClick={() => toggleTaskCompletion(task.id)}
                               className={cn(
                                 "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm shrink-0",
                                 task.status === 'completed' 
                                   ? "bg-green-500 border-green-500 text-white" 
                                   : "border-gray-500 hover:border-[#FFA500] bg-[#0A0E27]"
                               )}
                             >
                               {task.status === 'completed' && <CheckSquare className="w-3.5 h-3.5" />}
                             </button>
                             <div>
                                <h3 className={cn("text-lg font-bold transition-all line-clamp-1", task.status === 'completed' ? "text-gray-500 line-through" : "text-white")}>
                                   {task.title}
                                </h3>
                                
                                {/* Chips Row */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                   {projectName && (
                                     <div className="flex items-center gap-1 text-[10px] bg-[#00D9FF]/10 text-[#00D9FF] px-2 py-0.5 rounded border border-[#00D9FF]/20">
                                        <FolderKanban className="w-3 h-3" />
                                        <span className="truncate max-w-[100px]">{projectName}</span>
                                     </div>
                                   )}
                                   {channelName && (
                                     <div className="flex items-center gap-1 text-[10px] bg-[#9D4EDD]/10 text-[#9D4EDD] px-2 py-0.5 rounded border border-[#9D4EDD]/20">
                                        <Radio className="w-3 h-3" />
                                        <span className="truncate max-w-[100px]">{channelName}</span>
                                     </div>
                                   )}
                                   {isOverdue && (
                                     <div className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-bold">
                                        <AlertTriangle className="w-3 h-3" />
                                        איחור
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 top-2">
                              <button onClick={() => handleOpenModal(task)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                                 <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setTaskToDelete(task); setIsDeleteAlertOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                       </div>

                       <p className={cn("text-sm mb-4 line-clamp-2 min-h-[40px] pr-3", task.status === 'completed' ? "text-gray-600" : "text-gray-400")}>
                          {task.description || 'אין תיאור למשימה זו.'}
                       </p>

                       {/* Footer Details */}
                       <div className="grid grid-cols-2 gap-2 text-xs pr-3 mb-3">
                          <div className="flex items-center gap-2 text-gray-500 bg-[#0A0E27] p-2 rounded-lg border border-white/5">
                             <Calendar className="w-3 h-3 text-[#FFA500]" />
                             {task.dueDate ? new Date(task.dueDate).toLocaleDateString('he-IL') : 'אין תאריך'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 bg-[#0A0E27] p-2 rounded-lg border border-white/5">
                             <Clock className="w-3 h-3 text-[#FFA500]" />
                             {task.dueTime || '--:--'}
                          </div>
                       </div>

                       {/* Progress Bar */}
                       <div className="pr-3">
                          <div className="flex justify-between text-[10px] mb-1">
                             <span className="text-gray-500">התקדמות</span>
                             <span className={cn("font-bold", task.status === 'completed' ? "text-green-500" : "text-[#FFA500]")}>{task.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#0A0E27] rounded-full overflow-hidden border border-white/5">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${task.progress}%` }}
                                className={cn("h-full rounded-full relative", task.status === 'completed' ? "bg-green-500" : "bg-[#FFA500]")}
                             />
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
           )}
        </div>

        {/* --- Create/Edit Modal --- */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogContent className="bg-[#050A18] border border-[#FFA500]/30 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                 <DialogTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFA500] to-[#FF006E] flex items-center gap-2">
                    {editingTask ? <Edit className="w-6 h-6 text-[#FFA500]" /> : <Plus className="w-6 h-6 text-[#FFA500]" />}
                    {editingTask ? 'עריכת משימה' : 'יצירת משימה חדשה'}
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    מלא את פרטי המשימה והגדר יעדים לביצוע
                 </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label>כותרת המשימה *</Label>
                       <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FFA500] outline-none" placeholder="לדוגמה: הכנת מצגת ללקוח" />
                    </div>
                    
                    <div className="space-y-2">
                       <Label>תיאור</Label>
                       <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FFA500] outline-none" placeholder="פרטים נוספים..." />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>תאריך יעד</Label>
                       <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FFA500] outline-none" />
                    </div>
                    <div className="space-y-2">
                       <Label>שעת יעד</Label>
                       <input type="time" value={formData.dueTime} onChange={e => setFormData({...formData, dueTime: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FFA500] outline-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>עדיפות</Label>
                       <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FFA500] outline-none">
                          {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label>סטטוס</Label>
                       <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#FFA500] outline-none">
                          {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-gray-300">שיוך וקישורים</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>שיוך לפרויקט</Label>
                          <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none">
                             <option value="">ללא פרויקט</option>
                             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label>שיוך לערוץ</Label>
                          <select value={formData.channelId} onChange={e => setFormData({...formData, channelId: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none">
                             <option value="">ללא ערוץ</option>
                             {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label>התקדמות ({formData.progress}%)</Label>
                    <input type="range" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: Number(e.target.value)})} className="w-full accent-[#FFA500]" />
                 </div>

                 <DialogFooter className="sticky bottom-0 bg-[#050A18] pt-4 border-t border-white/5 mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400">ביטול</Button>
                    <Button type="submit" className="bg-[#FFA500] text-[#050A18] font-bold hover:bg-[#FFB700]">
                       {editingTask ? 'שמור שינויים' : 'צור משימה'}
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
                    מחיקת משימה
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    האם אתה בטוח שברצונך למחוק את המשימה <strong>{taskToDelete?.title}</strong>? פעולה זו אינה הפיכה.
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

export default Tasks;