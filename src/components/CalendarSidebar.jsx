import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  CheckCircle2, 
  Circle, 
  Plus, 
  MoreHorizontal,
  X,
  Trophy,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const CalendarSidebar = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // daily, weekly, month, year
  const [isOpen, setIsOpen] = useState(true);
  const [goals, setGoals] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // New Item State
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [newItemType, setNewItemType] = useState('goal'); // goal, event
  const [newItemForm, setNewItemForm] = useState({ title: '', target: '', type: 'daily' });

  useEffect(() => {
    // Load data from local storage or seed
    const storedGoals = JSON.parse(localStorage.getItem('empire_goals') || '[]');
    const storedEvents = JSON.parse(localStorage.getItem('empire_events') || '[]');
    
    if (storedGoals.length === 0) {
      const seedGoals = [
        { id: 1, title: 'סגירת 5 עסקאות', current: 3, target: 5, type: 'weekly', completed: false },
        { id: 2, title: 'הכנסה חודשית 50K', current: 35000, target: 50000, type: 'monthly', completed: false },
        { id: 3, title: 'שיפור יחס המרה', current: 2.5, target: 4.0, unit: '%', type: 'monthly', completed: false }
      ];
      setGoals(seedGoals);
      localStorage.setItem('empire_goals', JSON.stringify(seedGoals));
    } else {
      setGoals(storedGoals);
    }
    
    if (storedEvents.length === 0) {
       const seedEvents = [
         { id: 1, title: 'פגישת צוות', date: new Date().toISOString(), type: 'meeting' },
         { id: 2, title: 'השקת קמפיין', date: new Date(Date.now() + 86400000).toISOString(), type: 'launch' }
       ];
       setEvents(seedEvents);
       localStorage.setItem('empire_events', JSON.stringify(seedEvents));
    } else {
      setEvents(storedEvents);
    }
  }, []);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
    else if (view === 'weekly') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
    else if (view === 'weekly') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (newItemType === 'goal') {
      const newGoal = {
        id: Date.now(),
        title: newItemForm.title,
        target: parseInt(newItemForm.target),
        current: 0,
        type: newItemForm.type,
        completed: false
      };
      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      localStorage.setItem('empire_goals', JSON.stringify(updatedGoals));
      toast({ title: 'יעד חדש נוצר', className: "bg-[#050A18] border-[#00D9FF] text-white" });
    } else {
      const newEvent = {
        id: Date.now(),
        title: newItemForm.title,
        date: selectedDate.toISOString(),
        type: 'general'
      };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('empire_events', JSON.stringify(updatedEvents));
      toast({ title: 'אירוע נוסף ללוח שנה', className: "bg-[#050A18] border-[#9D4EDD] text-white" });
    }
    setIsNewItemOpen(false);
    setNewItemForm({ title: '', target: '', type: 'daily' });
  };

  const toggleGoal = (id) => {
    const updatedGoals = goals.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    setGoals(updatedGoals);
    localStorage.setItem('empire_goals', JSON.stringify(updatedGoals));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    return { days, firstDay };
  };

  const renderCalendarGrid = () => {
    const { days, firstDay } = getDaysInMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);
    
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

    return (
      <div className="grid grid-cols-7 gap-1 mb-4 text-center">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(d => (
          <div key={d} className="text-xs text-gray-500 font-medium py-1">{d}</div>
        ))}
        
        {blanks.map((_, i) => <div key={`blank-${i}`} className="h-8" />)}
        
        {dayNumbers.map(d => {
          const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();
          const hasEvent = events.some(e => new Date(e.date).toDateString() === dateStr);
          const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === currentDate.getMonth();
          const isToday = isCurrentMonth && today.getDate() === d;

          return (
            <motion.button
              key={d}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))}
              className={cn(
                "h-8 w-8 text-xs rounded-full flex items-center justify-center relative transition-colors",
                isSelected ? "bg-[#00D9FF] text-[#050A18] font-bold shadow-[0_0_10px_#00D9FF]" : "text-gray-300 hover:bg-white/10",
                isToday && !isSelected && "border border-[#00D9FF] text-[#00D9FF]"
              )}
            >
              {d}
              {hasEvent && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#9D4EDD] rounded-full shadow-[0_0_5px_#9D4EDD]" />
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '#00D9FF'; // Cyan for complete
    if (percentage >= 50) return '#9D4EDD'; // Purple for half way
    return '#FF006E'; // Pink for started
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 w-80 bg-[#050A18]/95 backdrop-blur-xl border-r border-[#00D9FF]/20 z-40 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#00D9FF]/20 flex items-center justify-between bg-gradient-to-r from-[#00D9FF]/5 to-transparent">
              <div className="flex items-center gap-2 text-[#00D9FF]">
                <CalendarIcon className="w-5 h-5" />
                <h2 className="font-bold tracking-wider">יומן ויעדים</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
              
              {/* Calendar Section */}
              <div className="bg-[#0A0E27]/50 rounded-xl border border-[#00D9FF]/10 p-4 relative group">
                <div className="absolute inset-0 bg-[#00D9FF]/5 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
                    <span className="text-sm font-bold text-white">
                      {currentDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
                  </div>

                  <div className="flex justify-center gap-2 mb-4 bg-[#050A18] p-1 rounded-lg border border-white/5">
                    {['daily', 'weekly', 'month', 'year'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={cn(
                          "px-2 py-1 text-[10px] rounded transition-all",
                          view === v ? "bg-[#00D9FF]/20 text-[#00D9FF] font-bold" : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {v === 'daily' ? 'יום' : v === 'weekly' ? 'שבוע' : v === 'month' ? 'חודש' : 'שנה'}
                      </button>
                    ))}
                  </div>

                  {renderCalendarGrid()}
                  
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold text-[#9D4EDD] mb-2 flex items-center gap-2">
                       <CalendarDays className="w-3 h-3" /> אירועים ב-{selectedDate.toLocaleDateString('he-IL')}
                    </h4>
                    {events.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString()).length > 0 ? (
                       events.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString()).map(e => (
                         <div key={e.id} className="text-xs text-gray-300 mb-1 pl-2 border-l-2 border-[#9D4EDD]">{e.title}</div>
                       ))
                    ) : (
                      <p className="text-[10px] text-gray-600">אין אירועים ליום זה</p>
                    )}
                    
                    <button className="w-full mt-3 py-1.5 text-xs text-gray-400 hover:text-[#00D9FF] hover:bg-[#00D9FF]/5 border border-dashed border-gray-700 hover:border-[#00D9FF]/30 rounded transition-all flex items-center justify-center gap-1">
                       <Plus className="w-3 h-3" /> הוסף גוגל קלנדר
                    </button>
                  </div>
                </div>
              </div>

              {/* Goals Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#FF006E]" />
                    יעדים ומטרות
                  </h3>
                  <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
                    <DialogTrigger asChild>
                      <button 
                        onClick={() => setNewItemType('goal')}
                        className="p-1.5 bg-[#FF006E]/10 hover:bg-[#FF006E]/20 text-[#FF006E] rounded-lg transition-colors border border-[#FF006E]/30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#050A18] border border-[#00D9FF]/30 text-white">
                      <DialogHeader><DialogTitle className="text-[#00D9FF]">{newItemType === 'goal' ? 'הוספת יעד חדש' : 'הוספת אירוע'}</DialogTitle></DialogHeader>
                      <form onSubmit={addItem} className="space-y-4 pt-4 text-right" dir="rtl">
                        <div className="flex gap-4 mb-4">
                           <button type="button" onClick={() => setNewItemType('goal')} className={cn("flex-1 py-2 rounded-lg border text-sm transition-all", newItemType === 'goal' ? "bg-[#FF006E]/20 border-[#FF006E] text-[#FF006E]" : "border-gray-700 text-gray-500")}>יעד</button>
                           <button type="button" onClick={() => setNewItemType('event')} className={cn("flex-1 py-2 rounded-lg border text-sm transition-all", newItemType === 'event' ? "bg-[#9D4EDD]/20 border-[#9D4EDD] text-[#9D4EDD]" : "border-gray-700 text-gray-500")}>אירוע</button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-gray-300">כותרת</Label>
                          <input 
                            className="w-full bg-[#0A0E27] border border-gray-700 rounded-md p-2 text-white outline-none focus:border-[#00D9FF]" 
                            value={newItemForm.title} onChange={e => setNewItemForm({...newItemForm, title: e.target.value})} required
                          />
                        </div>

                        {newItemType === 'goal' && (
                          <>
                             <div className="space-y-2">
                               <Label className="text-gray-300">יעד מספרי</Label>
                               <input 
                                 type="number"
                                 className="w-full bg-[#0A0E27] border border-gray-700 rounded-md p-2 text-white outline-none focus:border-[#00D9FF]" 
                                 value={newItemForm.target} onChange={e => setNewItemForm({...newItemForm, target: e.target.value})} required
                               />
                             </div>
                             <div className="space-y-2">
                               <Label className="text-gray-300">תקופה</Label>
                               <select 
                                 className="w-full bg-[#0A0E27] border border-gray-700 rounded-md p-2 text-white outline-none focus:border-[#00D9FF]"
                                 value={newItemForm.type} onChange={e => setNewItemForm({...newItemForm, type: e.target.value})}
                               >
                                 <option value="daily">יומי</option>
                                 <option value="weekly">שבועי</option>
                                 <option value="monthly">חודשי</option>
                                 <option value="yearly">שנתי</option>
                               </select>
                             </div>
                          </>
                        )}

                        <Button type="submit" className="w-full bg-[#00D9FF] hover:bg-[#00D9FF]/80 text-[#050A18] font-bold mt-2">הוסף</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                   {goals.map((goal) => {
                     const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                     const color = getProgressColor(goal.current, goal.target);
                     
                     return (
                       <div key={goal.id} className="bg-[#0A0E27] p-3 rounded-lg border border-white/5 hover:border-[#FF006E]/30 transition-all group">
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             <button onClick={() => toggleGoal(goal.id)} className="text-gray-500 hover:text-[#00D9FF] transition-colors">
                               {goal.completed ? <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" /> : <Circle className="w-4 h-4" />}
                             </button>
                             <div>
                               <p className={cn("text-xs font-bold text-gray-200 transition-all", goal.completed && "line-through text-gray-500")}>{goal.title}</p>
                               <p className="text-[10px] text-gray-500">{goal.type === 'weekly' ? 'שבועי' : goal.type === 'monthly' ? 'חודשי' : 'יומי'}</p>
                             </div>
                           </div>
                           <span className="text-[10px] font-mono text-[#00D9FF]">{percent}%</span>
                         </div>
                         
                         <div className="w-full h-1.5 bg-[#050A18] rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              className="h-full rounded-full shadow-[0_0_8px_currentColor]"
                              style={{ backgroundColor: color, color }}
                            />
                         </div>
                         <div className="flex justify-between mt-1 text-[9px] text-gray-500 font-mono">
                           <span>{goal.current}</span>
                           <span>{goal.target} {goal.unit || ''}</span>
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>
              
              {/* Daily Trophy/Summary */}
              <div className="bg-gradient-to-br from-[#FF006E]/20 to-[#9D4EDD]/20 p-4 rounded-xl border border-[#FF006E]/30 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <Trophy className="w-8 h-8 text-[#FFD700] mx-auto mb-2 drop-shadow-[0_0_10px_#FFD700]" />
                <h4 className="text-sm font-bold text-white mb-1">התקדמות יומית</h4>
                <p className="text-xs text-gray-300">השלמת 3 מתוך 5 משימות היום!</p>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-24 bg-[#050A18] border border-[#00D9FF]/30 border-l-0 text-[#00D9FF] p-2 rounded-r-xl shadow-[0_0_15px_rgba(0,217,255,0.2)] hover:pr-4 transition-all z-30"
        >
          <CalendarIcon className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
};

export default CalendarSidebar;