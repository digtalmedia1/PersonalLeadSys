import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Globe, Palette, Layout, Bell, 
  Database, User, Shield, Zap, Terminal, Save, RotateCcw, 
  Download, Upload, Trash2, Moon, Sun, Monitor, Check, 
  AlertTriangle, Smartphone, Mail, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext'; // Use the new context

// Custom Switch Component
const Switch = ({ checked, onCheckedChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-accent" : "bg-gray-700"
    )}
    style={{ backgroundColor: checked ? 'var(--accent-color)' : '' }}
  >
    <span
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
        checked ? "translate-x-0" : "-translate-x-5"
      )}
    />
  </button>
);

const Settings = () => {
  const { toast } = useToast();
  const { settings, updateSetting, resetSettings } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef(null);
  
  // Dialog States
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Actions
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "empire_backup_" + new Date().toISOString() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "ייצוא הושלם", description: "קובץ הגיבוי הורד למחשבך" });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach(key => {
            localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
        });
        toast({ title: "ייבוא הושלם", description: "הנתונים נטענו בהצלחה. מרענן..." });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast({ title: "שגיאה בייבוא", description: "קובץ לא תקין", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    localStorage.clear();
    setConfirmClearOpen(false);
    toast({ title: "הנתונים נמחקו", description: "המערכת תאתחל את עצמה כעת", variant: "destructive" });
    setTimeout(() => window.location.reload(), 2000);
  };

  const handleResetSettings = () => {
    resetSettings();
    setConfirmResetOpen(false);
    toast({ title: "הגדרות אופסו", description: "חזרנו לברירת המחדל" });
  };

  // --- Render Sections ---

  const renderGeneral = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <Label>שם האפליקציה</Label>
             <input 
                type="text" 
                value={settings.general.appName}
                onChange={(e) => updateSetting('general', 'appName', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-white/10 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all"
             />
          </div>
          <div className="space-y-2">
             <Label>שפה</Label>
             <select 
                value={settings.general.language}
                onChange={(e) => updateSetting('general', 'language', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-white/10 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all"
             >
                <option value="he">עברית (Hebrew)</option>
                <option value="en">אנגלית (English)</option>
             </select>
          </div>
          <div className="space-y-2">
             <Label>אזור זמן</Label>
             <select 
                value={settings.general.timezone}
                onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-white/10 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all"
             >
                <option value="Asia/Jerusalem">Asia/Jerusalem (GMT+2)</option>
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
             </select>
          </div>
          <div className="space-y-2">
             <Label>פורמט תאריך</Label>
             <select 
                value={settings.general.dateFormat}
                onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-white/10 rounded-lg p-3 text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all"
             >
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
             </select>
          </div>
       </div>
    </div>
  );

  const renderTheme = () => (
     <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
        {/* Real-time preview box */}
        <div className="glass-panel p-6 rounded-xl border border-[var(--accent-color)] relative overflow-hidden transition-all duration-300">
           <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-[var(--accent-color)] to-transparent opacity-50"></div>
           <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-[var(--accent-color)]" />
              תצוגה מקדימה חיה
           </h3>
           <p className="opacity-80 mb-4">כך נראים האלמנטים עם ההגדרות הנוכחיות שלך.</p>
           <div className="flex gap-4">
              <Button className="bg-[var(--accent-color)] text-black hover:opacity-90 transition-opacity">כפתור ראשי</Button>
              <Button variant="outline" className="border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-black">כפתור משני</Button>
           </div>
        </div>

        <div className="space-y-4">
           <Label className="text-lg">ערכת נושא</Label>
           <div className="grid grid-cols-3 gap-4">
              {['cyberpunk', 'dark', 'light'].map(theme => (
                 <div 
                    key={theme}
                    onClick={() => updateSetting('theme', 'mode', theme)}
                    className={cn(
                       "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all hover:bg-white/5",
                       settings.theme.mode === theme ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10" : "border-white/10"
                    )}
                    style={{ borderColor: settings.theme.mode === theme ? 'var(--accent-color)' : '' }}
                 >
                    {theme === 'cyberpunk' && <Monitor className="w-8 h-8" style={{color: 'var(--accent-color)'}} />}
                    {theme === 'dark' && <Moon className="w-8 h-8 text-[#9D4EDD]" />}
                    {theme === 'light' && <Sun className="w-8 h-8 text-orange-400" />}
                    <span className="capitalize font-bold">{theme}</span>
                 </div>
              ))}
           </div>
        </div>

        <div className="space-y-6 p-6 bg-black/20 rounded-xl border border-white/5">
           <div className="space-y-3">
              <div className="flex justify-between">
                 <Label>עוצמת ניאון (Neon Intensity)</Label>
                 <span className="text-xs text-[var(--accent-color)] font-mono">{settings.theme.neonIntensity}%</span>
              </div>
              <Slider 
                 value={[settings.theme.neonIntensity]} 
                 max={100} 
                 step={1} 
                 className="[&>.relative>.absolute]:bg-[var(--accent-color)]"
                 onValueChange={(val) => updateSetting('theme', 'neonIntensity', val[0])}
              />
           </div>
           <div className="space-y-3">
              <div className="flex justify-between">
                 <Label>רמת שקיפות וטשטוש (Glassmorphism)</Label>
                 <span className="text-xs text-[#9D4EDD] font-mono">{settings.theme.glassmorphism}%</span>
              </div>
              <Slider 
                 value={[settings.theme.glassmorphism]} 
                 max={100} 
                 step={1} 
                 className="[&>.relative>.absolute]:bg-[#9D4EDD]"
                 onValueChange={(val) => updateSetting('theme', 'glassmorphism', val[0])}
              />
           </div>
           <div className="space-y-2">
              <Label>צבע דגש (Accent Color)</Label>
              <div className="flex gap-3 mt-2">
                 {['#00D9FF', '#9D4EDD', '#FF006E', '#00FF9D', '#FFA500'].map(color => (
                    <div 
                       key={color}
                       onClick={() => updateSetting('theme', 'accentColor', color)}
                       className={cn(
                          "w-10 h-10 rounded-full cursor-pointer transition-transform hover:scale-110 border-2",
                          settings.theme.accentColor === color ? "border-white scale-110 shadow-[0_0_15px_currentColor]" : "border-transparent"
                       )}
                       style={{ backgroundColor: color, color: color, boxShadow: settings.theme.accentColor === color ? `0 0 15px ${color}` : 'none' }}
                    />
                 ))}
              </div>
           </div>
        </div>
     </div>
  );

  const renderInterface = () => (
     <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
           <div className="space-y-1">
              <Label>מיקום סרגל צד</Label>
              <p className="text-xs opacity-70">הגדרת צד התפריט הראשי</p>
           </div>
           <div className="flex bg-[var(--bg-primary)] p-1 rounded-lg border border-white/10">
              <button 
                 onClick={() => updateSetting('interface', 'sidebarPos', 'right')}
                 className={cn("px-4 py-1 rounded text-sm transition-all", settings.interface.sidebarPos === 'right' ? "bg-accent text-black font-bold" : "text-gray-400")}
                 style={{ backgroundColor: settings.interface.sidebarPos === 'right' ? 'var(--accent-color)' : '' }}
              >
                 ימין
              </button>
              <button 
                 onClick={() => updateSetting('interface', 'sidebarPos', 'left')}
                 className={cn("px-4 py-1 rounded text-sm transition-all", settings.interface.sidebarPos === 'left' ? "bg-accent text-black font-bold" : "text-gray-400")}
                 style={{ backgroundColor: settings.interface.sidebarPos === 'left' ? 'var(--accent-color)' : '' }}
              >
                 שמאל
              </button>
           </div>
        </div>

        <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5">
           <div className="flex justify-between">
              <Label>גודל גופן בסיסי</Label>
              <span className="text-xs font-mono">{settings.interface.fontSize}px</span>
           </div>
           <Slider 
              value={[settings.interface.fontSize]} 
              min={12} max={24} step={1} 
              className="[&>.relative>.absolute]:bg-white"
              onValueChange={(val) => updateSetting('interface', 'fontSize', val[0])}
           />
        </div>

        <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5">
           <div className="flex justify-between">
              <Label>מהירות אנימציה</Label>
              <span className="text-xs font-mono">x{settings.interface.animSpeed}</span>
           </div>
           <Slider 
              value={[settings.interface.animSpeed]} 
              min={0.5} max={2} step={0.1} 
              className="[&>.relative>.absolute]:bg-green-400"
              onValueChange={(val) => updateSetting('interface', 'animSpeed', val[0])}
           />
        </div>
     </div>
  );

  const renderNotifications = () => (
     <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
        {[
           { id: 'enabled', label: 'התראות מערכת', icon: Bell, desc: 'הצג התראות קופצות בתוך המערכת' },
           { id: 'sound', label: 'צלילי התראה', icon: Volume2, desc: 'השמע צליל בעת קבלת התראה חדשה' },
           { id: 'email', label: 'התראות במייל', icon: Mail, desc: 'שלח סיכום יומי לכתובת המייל' },
        ].map(item => (
           <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-[var(--accent-color)] transition-colors">
              <div className="flex items-center gap-4">
                 <div className="p-2 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)]" style={{ color: 'var(--accent-color)' }}>
                    <item.icon className="w-5 h-5" />
                 </div>
                 <div>
                    <Label className="block text-base">{item.label}</Label>
                    <p className="text-xs opacity-70">{item.desc}</p>
                 </div>
              </div>
              <Switch 
                 checked={settings.notifications[item.id]} 
                 onCheckedChange={(val) => updateSetting('notifications', item.id, val)} 
              />
           </div>
        ))}
        
        <div className="pt-4">
           <Label>תדירות עדכונים</Label>
           <div className="grid grid-cols-3 gap-3 mt-2">
              {['instant', 'hourly', 'daily'].map(freq => (
                 <button 
                    key={freq}
                    onClick={() => updateSetting('notifications', 'frequency', freq)}
                    className={cn(
                       "py-2 px-4 rounded-lg border text-sm transition-all",
                       settings.notifications.frequency === freq 
                          ? "bg-[#9D4EDD]/20 border-[#9D4EDD] text-[#9D4EDD]" 
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                    )}
                 >
                    {freq === 'instant' && 'מיידי'}
                    {freq === 'hourly' && 'שעתי'}
                    {freq === 'daily' && 'יומי'}
                 </button>
              ))}
           </div>
        </div>
     </div>
  );

  const renderData = () => (
     <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="p-6 bg-black/20 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Download className="w-5 h-5 text-green-400" />
                 <h3 className="font-bold">גיבוי וייצוא</h3>
              </div>
              <p className="text-xs opacity-70">הורד את כל נתוני המערכת (לקוחות, פרויקטים, הגדרות) לקובץ JSON.</p>
              <Button onClick={handleExport} variant="outline" className="w-full border-green-500/20 text-green-400 hover:bg-green-500/10">
                 ייצא נתונים
              </Button>
           </div>

           <div className="p-6 bg-black/20 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <Upload className="w-5 h-5 text-[var(--accent-color)]" />
                 <h3 className="font-bold">שחזור וייבוא</h3>
              </div>
              <p className="text-xs opacity-70">טען נתונים מקובץ גיבוי קיים. פעולה זו תדרוס נתונים קיימים.</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
              <Button onClick={handleImportClick} variant="outline" className="w-full border-[var(--accent-color)]/20 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10" style={{ color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}>
                 בחר קובץ
              </Button>
           </div>
        </div>

        <div className="p-6 bg-red-500/5 rounded-xl border border-red-500/20 space-y-4 mt-8">
           <div className="flex items-center gap-3 mb-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-red-500">אזור סכנה</h3>
           </div>
           <p className="text-xs opacity-70">פעולות אלו הן בלתי הפיכות. אנא היזהר.</p>
           <div className="flex gap-4">
              <Button onClick={() => setConfirmClearOpen(true)} variant="destructive" className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50">
                 מחק את כל הנתונים
              </Button>
              <Button onClick={() => setConfirmResetOpen(true)} variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                 אפס הגדרות
              </Button>
           </div>
        </div>
     </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
       <div className="p-6 bg-black/20 rounded-xl border border-white/5 space-y-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <Shield className="w-5 h-5 text-[#FF006E]" />
             הגדרות פרטיות ואיסוף מידע
          </h3>
          
          <div className="flex items-center justify-between py-3 border-b border-white/5">
             <div>
                <Label>איסוף נתוני שימוש (Analytics)</Label>
                <p className="text-xs opacity-60">עזור לנו לשפר את המערכת ע"י שליחת נתונים אנונימיים</p>
             </div>
             <Switch checked={settings.privacy.analytics} onCheckedChange={(v) => updateSetting('privacy', 'analytics', v)} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/5">
             <div>
                <Label>קבצי עוגיות (Cookies)</Label>
                <p className="text-xs opacity-60">שמור העדפות גלישה ונתוני התחברות בדפדפן</p>
             </div>
             <Switch checked={settings.privacy.cookies} onCheckedChange={(v) => updateSetting('privacy', 'cookies', v)} />
          </div>

          <div className="flex items-center justify-between py-3">
             <div>
                <Label>אינטגרציות צד שלישי</Label>
                <p className="text-xs opacity-60">אפשר שיתוף מידע עם שירותים חיצוניים (כגון גוגל קלנדר)</p>
             </div>
             <Switch checked={settings.privacy.thirdParty} onCheckedChange={(v) => updateSetting('privacy', 'thirdParty', v)} />
          </div>
       </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
       <div className="p-6 bg-black/20 rounded-xl border border-white/5 space-y-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <Zap className="w-5 h-5 text-yellow-400" />
             ביצועים ואופטימיזציה
          </h3>

          <div className="flex items-center justify-between py-3 border-b border-white/5">
             <div>
                <Label>שמירת מטמון (Browser Cache)</Label>
                <p className="text-xs opacity-60">שמור נתונים מקומית לטעינה מהירה יותר</p>
             </div>
             <Switch checked={settings.performance.cache} onCheckedChange={(v) => updateSetting('performance', 'cache', v)} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/5">
             <div>
                <Label>סנכרון רקע</Label>
                <p className="text-xs opacity-60">עדכן נתונים ברקע גם כשלא משתמשים באפליקציה</p>
             </div>
             <Switch checked={settings.performance.sync} onCheckedChange={(v) => updateSetting('performance', 'sync', v)} />
          </div>

          <div className="pt-4">
             <Label>תדירות שמירה אוטומטית</Label>
             <div className="flex items-center gap-4 mt-2">
                <Slider 
                   value={[settings.performance.autoSave]} 
                   min={5} max={60} step={5}
                   className="[&>.relative>.absolute]:bg-yellow-400 flex-1"
                   onValueChange={(val) => updateSetting('performance', 'autoSave', val[0])}
                />
                <span className="text-sm font-mono whitespace-nowrap w-20 text-center">כל {settings.performance.autoSave} שניות</span>
             </div>
          </div>
       </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
       <div className="p-6 bg-black/20 rounded-xl border border-white/5 space-y-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <Terminal className="w-5 h-5 text-green-500" />
             הגדרות מתקדמות למפתחים
          </h3>

          <div className="flex items-center justify-between py-3 border-b border-white/5">
             <div>
                <Label>מצב מפתח (Developer Mode)</Label>
                <p className="text-xs opacity-60">חשיפת כלי דיבוג ומידע טכני נוסף</p>
             </div>
             <Switch checked={settings.advanced.devMode} onCheckedChange={(v) => updateSetting('advanced', 'devMode', v)} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/5">
             <div>
                <Label>יומני דיבוג (Debug Logs)</Label>
                <p className="text-xs opacity-60">שמור לוגים מפורטים בקונסול הדפדפן</p>
             </div>
             <Switch checked={settings.advanced.debugLogs} onCheckedChange={(v) => updateSetting('advanced', 'debugLogs', v)} />
          </div>

          <div className="space-y-2 pt-2">
             <Label>כתובת API ראשית</Label>
             <div className="flex gap-2">
                <input 
                   type="text" 
                   value={settings.advanced.apiEndpoint}
                   onChange={(e) => updateSetting('advanced', 'apiEndpoint', e.target.value)}
                   className="flex-1 bg-[var(--bg-primary)] border border-white/10 rounded-lg p-2 text-sm text-[var(--text-primary)] font-mono focus:border-[var(--accent-color)] outline-none"
                   dir="ltr"
                />
             </div>
          </div>
       </div>
    </div>
  );

  const menuItems = [
     { id: 'general', label: 'כללי', icon: Globe },
     { id: 'theme', label: 'תצוגה ונושא', icon: Palette },
     { id: 'interface', label: 'ממשק', icon: Layout },
     { id: 'notifications', label: 'התראות', icon: Bell },
     { id: 'data', label: 'ניהול נתונים', icon: Database },
     { id: 'privacy', label: 'פרטיות', icon: Shield },
     { id: 'performance', label: 'ביצועים', icon: Zap },
     { id: 'advanced', label: 'מתקדם', icon: Terminal },
     { id: 'account', label: 'חשבון', icon: User },
  ];

  return (
    <>
      <Helmet>
        <title>הגדרות מערכת - Empire Leads</title>
      </Helmet>
      
      <div className="h-full flex flex-col md:flex-row gap-6 font-rubik" dir="rtl">
         {/* Sidebar Navigation */}
         <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            <h1 className="text-2xl font-black mb-6 flex items-center gap-3">
               <SettingsIcon className="w-8 h-8 text-[var(--accent-color)] animate-spin-slow" />
               הגדרות מערכת
            </h1>
            <div className="glass-panel p-2 rounded-2xl space-y-1">
               {menuItems.map(item => (
                  <button
                     key={item.id}
                     onClick={() => setActiveTab(item.id)}
                     className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                        activeTab === item.id 
                           ? "bg-accent/20 text-[var(--accent-color)] shadow-[0_0_15px_var(--accent-color)]" 
                           : "opacity-70 hover:opacity-100 hover:bg-white/5"
                     )}
                     style={{ 
                        color: activeTab === item.id ? 'var(--accent-color)' : '',
                        backgroundColor: activeTab === item.id ? 'rgba(var(--accent-color-rgb), 0.1)' : '' 
                     }}
                  >
                     <item.icon className="w-4 h-4" />
                     {item.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 glass-panel rounded-3xl p-6 md:p-8 min-h-[600px] relative overflow-hidden transition-all duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)] opacity-5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 transition-colors duration-500"></div>
            
            <div className="relative z-10">
               <div className="mb-6 pb-6 border-b border-white/5">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                     {menuItems.find(i => i.id === activeTab)?.icon && React.createElement(menuItems.find(i => i.id === activeTab).icon, { className: "w-6 h-6 text-[#9D4EDD]" })}
                     {menuItems.find(i => i.id === activeTab)?.label}
                  </h2>
                  <p className="text-sm opacity-60 mt-1">נהל את הגדרות {menuItems.find(i => i.id === activeTab)?.label} של המערכת</p>
               </div>

               {activeTab === 'general' && renderGeneral()}
               {activeTab === 'theme' && renderTheme()}
               {activeTab === 'interface' && renderInterface()}
               {activeTab === 'notifications' && renderNotifications()}
               {activeTab === 'data' && renderData()}
               {activeTab === 'privacy' && renderPrivacy()}
               {activeTab === 'performance' && renderPerformance()}
               {activeTab === 'advanced' && renderAdvanced()}
               
               {activeTab === 'account' && (
                  <div className="text-center py-20 opacity-50">
                     <User className="w-16 h-16 mx-auto mb-4" />
                     <p>הגדרות חשבון מנוהלות דרך מערכת הניהול המרכזית (Admin Panel)</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* --- Dialogs --- */}
      
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
         <DialogContent className="bg-[#050A18] border border-red-500/30 text-white sm:max-w-[400px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  אזהרת מחיקת נתונים
               </DialogTitle>
               <DialogDescription className="text-gray-400">
                  פעולה זו תמחק את כל הנתונים השמורים בדפדפן, כולל לקוחות, פרויקטים והגדרות. לא ניתן לשחזר את המידע לאחר המחיקה.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-start">
               <Button variant="destructive" onClick={handleClearData}>מחק הכל לצמיתות</Button>
               <Button variant="outline" onClick={() => setConfirmClearOpen(false)} className="border-white/10 hover:bg-white/5 text-gray-300">ביטול</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
         <DialogContent className="bg-[#050A18] border border-white/10 text-white sm:max-w-[400px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-white">
                  <RotateCcw className="w-5 h-5 text-[var(--accent-color)]" />
                  איפוס הגדרות
               </DialogTitle>
               <DialogDescription className="text-gray-400">
                  האם ברצונך לאפס את כל ההגדרות לברירת המחדל? הנתונים האישיים שלך לא יימחקו.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-start">
               <Button onClick={handleResetSettings} className="bg-[var(--accent-color)] text-black font-bold hover:opacity-80">אשר איפוס</Button>
               <Button variant="outline" onClick={() => setConfirmResetOpen(false)} className="border-white/10 hover:bg-white/5 text-gray-300">ביטול</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;