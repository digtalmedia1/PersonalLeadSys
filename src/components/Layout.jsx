
import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Radio, 
  Inbox as InboxIcon, 
  TrendingUp, 
  Table, 
  CheckSquare, 
  MessageSquare,
  LogOut,
  Menu,
  Bell,
  Settings,
  User,
  Search,
  Activity,
  X,
  Volume2,
  Moon,
  Sun,
  Shield,
  CreditCard,
  UserCircle,
  Wallet,
  Check,
  Lightbulb,
  Network,
  Users
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  // Settings States
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  // Sound Settings
  const [volumes, setVolumes] = useState({ system: 80, notifications: 100, media: 50 });

  // Identify pages that need full screen (no padding)
  const isFullScreenPage = ['/mindmap', '/brainstorm'].includes(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast({ 
      title: !isDarkMode ? "מצב כהה הופעל" : "מצב בהיר הופעל", 
      description: "העדפות התצוגה שלך עודכנו",
      duration: 2000
    });
  };

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'ליד חדש התקבל', desc: 'יוסי כהן השאיר פרטים באתר', time: 'לפני 2 דק\'', unread: true },
    { id: 2, title: 'משימה דחופה', desc: 'לחזור ללקוח VIP', time: 'לפני 15 דק\'', unread: true },
    { id: 3, title: 'עדכון מערכת', desc: 'השרת עבר תחזוקה בהצלחה', time: 'לפני 1 שעה', unread: false },
  ];

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'לוח בקרה' },
    { path: '/projects', icon: FolderKanban, label: 'פרויקטים' },
    { path: '/contacts', icon: Users, label: 'אנשי קשר' },
    { path: '/brainstorm', icon: Lightbulb, label: 'סיעור מוחות' },
    { path: '/mindmap', icon: Network, label: 'מפת חשיבה' },
    { path: '/channels', icon: Radio, label: 'ערוצים' },
    { path: '/inbox', icon: InboxIcon, label: 'תיבת דואר' },
    { path: '/leads/pipeline', icon: TrendingUp, label: 'צנרת לידים' },
    { path: '/leads/table', icon: Table, label: 'טבלת לידים' },
    { path: '/tasks', icon: CheckSquare, label: 'משימות' },
    { path: '/finance', icon: Wallet, label: 'פיננסים' },
    { path: '/faq-templates', icon: MessageSquare, label: 'תבניות שו"ת' }
  ];

  return (
    <div className={`min-h-screen bg-[#0A0E27] text-white flex overflow-hidden font-rubik selection:bg-[#00D9FF] selection:text-[#0A0E27] ${!isDarkMode ? 'bg-gray-100 text-gray-900' : ''}`}>
      {/* Click overlay for closing dropdowns */}
      {activeMenu && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveMenu(null)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#0A0E27]/90 backdrop-blur-xl border-l border-[#00D9FF]/20 transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:relative md:flex md:flex-col shadow-[0_0_50px_rgba(0,217,255,0.1)]`}>
        <div className="p-8 border-b border-[#00D9FF]/20 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-[#00D9FF] to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-4 z-10 w-full">
            <motion.div 
              className="w-12 h-12 bg-[#00D9FF]/10 border border-[#00D9FF] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,217,255,0.4)] relative group"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity className="w-7 h-7 text-[#00D9FF] drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]" />
              <div className="absolute inset-0 bg-[#00D9FF] opacity-0 group-hover:opacity-30 transition-opacity rounded-xl blur-lg duration-500"></div>
            </motion.div>
            
            <div className="flex flex-col">
              <motion.h1 
                className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]"
                animate={{ textShadow: ["0 0 10px rgba(0,217,255,0.3)", "0 0 20px rgba(157,78,221,0.5)", "0 0 10px rgba(0,217,255,0.3)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                EMPIRE
              </motion.h1>
              <span className="text-[10px] tracking-[0.4em] text-[#00D9FF] font-bold ml-1">SYSTEMS</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-[#00D9FF] hover:text-white transition-colors absolute left-4">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="relative group block"
              >
                <div className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 border border-transparent
                  ${isActive 
                    ? 'text-[#00D9FF] border-[#00D9FF]/30 bg-[#00D9FF]/10 shadow-[0_0_20px_rgba(0,217,255,0.1)] translate-x-[-5px]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-[-2px]'
                  }
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_5px_rgba(0,217,255,0.8)]' : ''}`} />
                  <span className="tracking-wide">{item.label}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute right-0 top-0 bottom-0 w-1 bg-[#00D9FF] rounded-l-lg shadow-[0_0_10px_#00D9FF]" 
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#00D9FF]/20 relative bg-gradient-to-t from-[#00D9FF]/5 to-transparent">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-[#FF006E] hover:bg-[#FF006E]/10 transition-all group border border-transparent hover:border-[#FF006E]/30"
          >
            <LogOut className="w-5 h-5 ml-3 group-hover:drop-shadow-[0_0_5px_#FF006E] transition-all" />
            <span className="tracking-wider">ניתוק מערכת</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: `linear-gradient(#00D9FF 1px, transparent 1px), linear-gradient(90deg, #00D9FF 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
        />

        {/* Header */}
        <header className="bg-[#0A0E27]/80 backdrop-blur-md border-b border-[#00D9FF]/20 h-20 flex items-center justify-between px-8 sticky top-0 z-40 shadow-lg">
           <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="text-[#00D9FF]">
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-[#00D9FF] tracking-widest">EMPIRE</span>
           </div>

           <div className="hidden md:flex items-center flex-1 max-w-md">
             <div className="relative w-full group">
               <div className="absolute inset-0 bg-[#00D9FF]/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative flex items-center bg-[#050A18] border border-[#00D9FF]/30 rounded-full px-4 py-2 transition-all focus-within:border-[#00D9FF] focus-within:shadow-[0_0_15px_rgba(0,217,255,0.2)]">
                 <Search className="w-4 h-4 text-[#00D9FF]/70 ml-3" />
                 <input type="text" placeholder="חיפוש במערכת..." className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 w-full font-rubik text-right" />
               </div>
             </div>
           </div>

           <div className="flex items-center gap-6">
              {/* Notifications */}
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMenu('notifications')}
                  className={`relative p-2 rounded-full transition-all duration-300 ${activeMenu === 'notifications' ? 'bg-[#9D4EDD]/20 text-[#9D4EDD] shadow-[0_0_15px_rgba(157,78,221,0.5)]' : 'text-gray-400 hover:text-[#9D4EDD] hover:bg-[#9D4EDD]/10'}`}
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF006E] rounded-full shadow-[0_0_8px_#FF006E] animate-pulse"></span>
                </motion.button>

                <AnimatePresence>
                  {activeMenu === 'notifications' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-4 w-80 bg-[#050A18]/95 backdrop-blur-xl border border-[#9D4EDD]/30 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#9D4EDD]/20 flex justify-between items-center bg-[#9D4EDD]/5">
                        <h3 className="font-bold text-white">התראות</h3>
                        <span className="text-xs text-[#9D4EDD] bg-[#9D4EDD]/10 px-2 py-0.5 rounded-full border border-[#9D4EDD]/30">3 חדשות</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-sm font-bold ${n.unread ? 'text-white' : 'text-gray-400'}`}>{n.title}</span>
                              <span className="text-[10px] text-gray-500">{n.time}</span>
                            </div>
                            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{n.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center border-t border-[#9D4EDD]/20 bg-[#050A18]">
                        <button className="text-xs text-[#9D4EDD] hover:text-white transition-colors font-bold w-full h-full py-1">סמן הכל כנקרא</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Settings Dropdown */}
              <div className="relative">
                 <motion.button 
                   whileHover={{ rotate: 90 }}
                   whileTap={{ scale: 0.95 }}
                   transition={{ duration: 0.3 }}
                   onClick={() => toggleMenu('settings')}
                   className={`relative p-2 rounded-full transition-all duration-300 ${activeMenu === 'settings' ? 'bg-[#00D9FF]/20 text-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.5)]' : 'text-gray-400 hover:text-[#00D9FF] hover:bg-[#00D9FF]/10'}`}
                 >
                   <Settings className="w-6 h-6" />
                 </motion.button>

                 <AnimatePresence>
                  {activeMenu === 'settings' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-4 w-72 bg-[#050A18]/95 backdrop-blur-xl border border-[#00D9FF]/30 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#00D9FF]/20 bg-[#00D9FF]/5">
                        <h3 className="font-bold text-white">הגדרות מהירות</h3>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setIsSoundModalOpen(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                        >
                           <Volume2 className="w-4 h-4 text-[#00D9FF]" />
                           <span className="text-sm">צלילי מערכת</span>
                        </button>
                        <button 
                          onClick={toggleDarkMode}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                        >
                           {isDarkMode ? <Moon className="w-4 h-4 text-[#9D4EDD]" /> : <Sun className="w-4 h-4 text-orange-400" />}
                           <span className="text-sm">{isDarkMode ? 'מצב כהה (פעיל)' : 'מצב בהיר'}</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsPrivacyModalOpen(true);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                        >
                           <Shield className="w-4 h-4 text-[#FF006E]" />
                           <span className="text-sm">פרטיות ואבטחה</span>
                        </button>
                      </div>
                      <div className="p-3 border-t border-[#00D9FF]/20 bg-[#050A18]">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                             setActiveMenu(null);
                             navigate('/settings');
                          }}
                          className="w-full border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10 text-xs h-8"
                        >
                          לכל ההגדרות
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent mx-2"></div>

              {/* Profile */}
              <div className="relative">
                <motion.div 
                  onClick={() => toggleMenu('profile')}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-bold text-white group-hover:text-[#00D9FF] transition-colors drop-shadow-md">{user?.username || 'מפקד'}</p>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase group-hover:text-[#00D9FF]/70 transition-colors">גישת מנהל</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#9D4EDD] p-[2px] shadow-[0_0_15px_rgba(157,78,221,0.4)] transition-all ${activeMenu === 'profile' ? 'shadow-[0_0_20px_#00D9FF]' : ''}`}>
                     <div className="w-full h-full rounded-full bg-[#050A18] flex items-center justify-center overflow-hidden">
                        <User className="w-5 h-5 text-white" />
                     </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {activeMenu === 'profile' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-4 w-64 bg-[#050A18]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                    >
                      <div className="p-4 bg-white/5 border-b border-white/10 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#9D4EDD] p-[2px] mx-auto mb-3 shadow-[0_0_20px_rgba(0,217,255,0.3)]">
                           <div className="w-full h-full rounded-full bg-[#050A18] flex items-center justify-center">
                              <User className="w-8 h-8 text-white" />
                           </div>
                        </div>
                        <h3 className="font-bold text-white">{user?.username || 'Admin User'}</h3>
                        <p className="text-xs text-gray-400">admin@empire.com</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                           <UserCircle className="w-4 h-4" />
                           <span className="text-sm">הפרופיל שלי</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                           <CreditCard className="w-4 h-4" />
                           <span className="text-sm">חיובים ומנויים</span>
                        </button>
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#FF006E]/10 text-gray-300 hover:text-[#FF006E] transition-colors">
                           <LogOut className="w-4 h-4" />
                           <span className="text-sm">יציאה מהחשבון</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </header>

        {/* Dynamic Main Padding based on Page Type */}
        <main className={`flex-1 bg-transparent relative z-10 ${isFullScreenPage ? 'p-0 overflow-hidden' : 'p-6 md:p-8 overflow-auto'}`}>
          <Outlet />
        </main>
      </div>
      
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- Sound Settings Modal --- */}
      <Dialog open={isSoundModalOpen} onOpenChange={setIsSoundModalOpen}>
        <DialogContent className="bg-[#050A18] border border-[#00D9FF]/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
               <Volume2 className="w-5 h-5 text-[#00D9FF]" />
               הגדרות שמע
            </DialogTitle>
            <DialogDescription className="text-center text-gray-400">
               התאם את עוצמת הצלילים במערכת
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6" dir="rtl">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label htmlFor="system-vol">מערכת כללי</Label>
                <span className="text-xs text-[#00D9FF] font-mono">{volumes.system}%</span>
              </div>
              <Slider 
                 id="system-vol"
                 defaultValue={[volumes.system]} 
                 max={100} 
                 step={1} 
                 className="[&>.relative>.absolute]:bg-[#00D9FF]"
                 onValueChange={(val) => setVolumes({...volumes, system: val[0]})}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label htmlFor="notif-vol">התראות</Label>
                <span className="text-xs text-[#9D4EDD] font-mono">{volumes.notifications}%</span>
              </div>
              <Slider 
                 id="notif-vol"
                 defaultValue={[volumes.notifications]} 
                 max={100} 
                 step={1} 
                 className="[&>.relative>.absolute]:bg-[#9D4EDD]"
                 onValueChange={(val) => setVolumes({...volumes, notifications: val[0]})}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label htmlFor="media-vol">מדיה</Label>
                <span className="text-xs text-[#FF006E] font-mono">{volumes.media}%</span>
              </div>
              <Slider 
                 id="media-vol"
                 defaultValue={[volumes.media]} 
                 max={100} 
                 step={1} 
                 className="[&>.relative>.absolute]:bg-[#FF006E]"
                 onValueChange={(val) => setVolumes({...volumes, media: val[0]})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSoundModalOpen(false)} className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8] w-full">
              שמור הגדרות
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Privacy Modal --- */}
      <Dialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>
        <DialogContent className="bg-[#050A18] border border-[#FF006E]/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
               <Shield className="w-5 h-5 text-[#FF006E]" />
               פרטיות ואבטחה
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4" dir="rtl">
             <div className="p-4 border border-white/5 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-sm">אימות דו-שלבי (2FA)</span>
                <span className="text-xs text-green-400 flex items-center gap-1 font-bold border border-green-500/20 px-2 py-1 rounded-full bg-green-500/10">
                  <Check className="w-3 h-3" /> פעיל
                </span>
             </div>
             <div className="p-4 border border-white/5 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-sm">היסטוריית התחברויות</span>
                <Button variant="link" className="text-[#00D9FF] h-auto p-0 text-xs">צפה ביומן</Button>
             </div>
             <div className="p-4 border border-white/5 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-sm">מחק נתונים זמניים</span>
                <Button variant="ghost" className="text-[#FF006E] hover:text-[#FF006E] hover:bg-[#FF006E]/10 h-auto py-1 px-2 text-xs border border-[#FF006E]/20">נקה עכשיו</Button>
             </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsPrivacyModalOpen(false)} className="text-gray-400 hover:text-white w-full">סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
