
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Calendar, Users, BarChart2, Folder, 
  Settings, AlertCircle, Plus, Briefcase,
  FileText, Image as ImageIcon, Video, Download,
  Trash2, ChevronRight, ChevronLeft, Filter,
  Share2, Save, UploadCloud, CheckCircle2,
  Layout, List, Grid, Shield, UserPlus, X,
  Copy, Check, Mail, Facebook, Link as LinkIcon, Globe,
  MessageSquare, Server, Database, Cloud, Lock, Key, 
  Eye, EyeOff, Terminal, Activity, AlertTriangle, Cpu, Globe2,
  HardDrive, Target, Edit, MoreVertical, File, FolderPlus,
  PieChart, TrendingUp, DollarSign, Clock, Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// --- Default Data Generators ---
const generateDefaultTeam = () => [
  { id: 1, name: 'דניאל כהן', role: 'Project Manager', avatar: 'DC', status: 'online', access: 'admin', email: 'daniel@empire.com' },
  { id: 2, name: 'שרה לוי', role: 'Lead Developer', avatar: 'SL', status: 'busy', access: 'write', email: 'sara@empire.com' },
];

const generateDefaultTasks = () => [
  { id: 't1', title: 'הגדרת שרתים', priority: 'high', status: 'todo', assignee: 'SL', date: '2024-02-01', description: 'התקנת Nginx וקונפיגורציה ראשונית' },
  { id: 't2', title: 'עיצוב מסך התחברות', priority: 'medium', status: 'todo', assignee: 'RA', date: '2024-02-03', description: 'כולל אנימציות כניסה' },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // --- State ---
  const [activeTab, setActiveTab] = useState('hosting');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [files, setFiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [issues, setIssues] = useState([]);
  const [credentials, setCredentials] = useState([]);
  
  // Hosting & Infra Data
  const [hostingData, setHostingData] = useState({
    serverProvider: '', location: '', serverIp: '', serverStatus: 'online', 
    plan: '', cost: '', domain: '', registrar: '', expiration: '', dnsProvider: '',
    cloudflare: 'connected', ssl: 'active', ddos: 'active', cache: 'enabled',
    vision: '', shortGoals: '', longGoals: ''
  });

  // Security
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  // Modals & Editing State
  const [activeModal, setActiveModal] = useState(null); // 'infrastructure', 'domain', 'cloudflare', 'vision', 'team', 'file', 'report', 'settings', 'credential', 'issue', 'task', 'share', 'masterPwd'
  const [editingItem, setEditingItem] = useState(null);

  // Forms Data
  const [formData, setFormData] = useState({}); // Generic form state container

  // --- Initialization ---
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    // 1. Project
    const storedProjects = JSON.parse(localStorage.getItem('empire_projects') || '[]');
    const foundProject = storedProjects.find(p => p.id === id);
    if (!foundProject) {
        // Fallback for demo if not found in LS
        setProject({
            id, title: 'Project Not Found', client: 'Unknown', description: 'Please create a project first.',
            status: 'planning', deadline: new Date().toISOString(), progress: 0, budget: 0
        });
    } else {
        setProject({
            ...foundProject,
            title: foundProject.name || foundProject.title,
            deadline: foundProject.endDate || foundProject.deadline || new Date().toISOString()
        });
    }

    // 2. Sub-collections
    const loadCollection = (key, setter, defaultGen) => {
        const all = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = all.filter(item => item.projectId === id);
        if (filtered.length === 0 && defaultGen) {
            setter(defaultGen().map(i => ({...i, projectId: id})));
        } else {
            setter(filtered);
        }
    };

    loadCollection('empire_tasks', setTasks, generateDefaultTasks);
    loadCollection('empire_teams', setTeam, generateDefaultTeam);
    loadCollection('empire_files', setFiles);
    loadCollection('empire_reports', setReports);
    loadCollection('empire_issues', setIssues);
    loadCollection('empire_credentials', setCredentials);

    // 3. Hosting
    const allHosting = JSON.parse(localStorage.getItem('empire_hosting') || '{}');
    const pHosting = allHosting[id] || {
        serverProvider: 'DigitalOcean', location: 'Frankfurt', serverIp: '178.62.10.1', serverStatus: 'online', 
        plan: 'Premium Droplet', cost: '$20/mo', domain: foundProject?.name ? `${foundProject.name.toLowerCase().replace(/\s/g,'')}.com` : 'example.com', registrar: 'NameCheap', 
        expiration: '2026-01-01', dnsProvider: 'Cloudflare',
        cloudflare: 'connected', ssl: 'active', ddos: 'active', cache: 'enabled',
        vision: 'להוביל את השוק בתחום החדשנות הדיגיטלית', shortGoals: 'השקת גרסת בטא', longGoals: 'מיליון משתמשים'
    };
    setHostingData(pHosting);
  };

  // --- Persistence Helpers ---
  const saveCollection = (key, items, setter) => {
      setter(items);
      const all = JSON.parse(localStorage.getItem(key) || '[]');
      const others = all.filter(i => i.projectId !== id);
      localStorage.setItem(key, JSON.stringify([...others, ...items]));
  };

  const saveHosting = (newData) => {
      setHostingData(newData);
      const all = JSON.parse(localStorage.getItem('empire_hosting') || '{}');
      all[id] = newData;
      localStorage.setItem('empire_hosting', JSON.stringify(all));
      toast({ title: "נשמר בהצלחה", description: "נתוני התשתית עודכנו" });
  };

  const updateProject = (updates) => {
      const updated = { ...project, ...updates };
      setProject(updated);
      const all = JSON.parse(localStorage.getItem('empire_projects') || '[]');
      const newAll = all.map(p => p.id === id ? { ...p, ...updates, name: updates.title } : p);
      localStorage.setItem('empire_projects', JSON.stringify(newAll));
      toast({ title: "פרויקט עודכן" });
  };

  // --- Form Handlers ---
  const openModal = (type, item = null) => {
      setActiveModal(type);
      setEditingItem(item);
      
      // Initialize form data based on type
      if (type === 'infrastructure' || type === 'domain' || type === 'cloudflare' || type === 'vision') {
          setFormData({ ...hostingData });
      } else if (type === 'team') {
          setFormData(item || { name: '', email: '', role: 'Developer', access: 'read', status: 'online' });
      } else if (type === 'file') {
          setFormData({ name: '', type: 'file' });
      } else if (type === 'report') {
          setFormData(item || { title: '', type: 'status', summary: '', date: new Date().toISOString().split('T')[0] });
      } else if (type === 'issue') {
          setFormData(item || { title: '', description: '', priority: 'medium', status: 'open', dueDate: '' });
      } else if (type === 'credential') {
          setFormData(item ? { ...item, password: '' } : { type: 'ftp', username: '', password: '', host: '' });
      } else if (type === 'settings') {
          setFormData({ ...project });
      } else if (type === 'task') {
          setFormData(item || { title: '', description: '', priority: 'medium', assignee: 'Admin' });
      }
  };

  const handleSave = () => {
      if (activeModal === 'infrastructure' || activeModal === 'domain' || activeModal === 'cloudflare' || activeModal === 'vision') {
          saveHosting({ ...hostingData, ...formData });
      } else if (activeModal === 'team') {
          const newItem = editingItem 
              ? { ...editingItem, ...formData } 
              : { id: `tm_${Date.now()}`, projectId: id, avatar: formData.name.substring(0,2).toUpperCase(), ...formData };
          const newItems = editingItem ? team.map(i => i.id === editingItem.id ? newItem : i) : [...team, newItem];
          saveCollection('empire_teams', newItems, setTeam);
      } else if (activeModal === 'file') {
          // Mock upload
          const newItem = { 
              id: `f_${Date.now()}`, projectId: id, name: formData.name || 'New File.txt', 
              size: '12 KB', type: 'file', date: new Date().toISOString().split('T')[0], author: 'Admin' 
          };
          saveCollection('empire_files', [...files, newItem], setFiles);
      } else if (activeModal === 'report') {
          const newItem = editingItem
              ? { ...editingItem, ...formData }
              : { id: `r_${Date.now()}`, projectId: id, author: 'Admin', ...formData };
          const newItems = editingItem ? reports.map(i => i.id === editingItem.id ? newItem : i) : [...reports, newItem];
          saveCollection('empire_reports', newItems, setReports);
      } else if (activeModal === 'issue') {
           const newItem = editingItem
              ? { ...editingItem, ...formData }
              : { id: `i_${Date.now()}`, projectId: id, date: new Date().toISOString().split('T')[0], ...formData };
           const newItems = editingItem ? issues.map(i => i.id === editingItem.id ? newItem : i) : [...issues, newItem];
           saveCollection('empire_issues', newItems, setIssues);
      } else if (activeModal === 'credential') {
           if (!formData.password && !editingItem) return; 
           const passwordToSave = formData.password ? btoa(formData.password) : editingItem.password;
           const newItem = editingItem
              ? { ...editingItem, ...formData, password: passwordToSave }
              : { id: `c_${Date.now()}`, projectId: id, ...formData, password: passwordToSave };
           const newItems = editingItem ? credentials.map(i => i.id === editingItem.id ? newItem : i) : [...credentials, newItem];
           saveCollection('empire_credentials', newItems, setCredentials);
      } else if (activeModal === 'settings') {
           updateProject(formData);
      } else if (activeModal === 'task') {
           const newItem = editingItem 
               ? { ...editingItem, ...formData }
               : { id: `t_${Date.now()}`, projectId: id, status: 'todo', date: new Date().toISOString(), ...formData };
           const newItems = editingItem ? tasks.map(i => i.id === editingItem.id ? newItem : i) : [...tasks, newItem];
           saveCollection('empire_tasks', newItems, setTasks);
      }

      setActiveModal(null);
      setEditingItem(null);
      setFormData({});
      toast({ title: "נשמר", description: "הפעולה בוצעה בהצלחה" });
  };

  const deleteItem = (type, itemId) => {
      if (!window.confirm("האם אתה בטוח שברצונך למחוק?")) return;
      if (type === 'team') saveCollection('empire_teams', team.filter(i => i.id !== itemId), setTeam);
      if (type === 'file') saveCollection('empire_files', files.filter(i => i.id !== itemId), setFiles);
      if (type === 'report') saveCollection('empire_reports', reports.filter(i => i.id !== itemId), setReports);
      if (type === 'issue') saveCollection('empire_issues', issues.filter(i => i.id !== itemId), setIssues);
      if (type === 'credential') saveCollection('empire_credentials', credentials.filter(i => i.id !== itemId), setCredentials);
      toast({ title: "נמחק", variant: "destructive" });
  };

  // --- Security Helpers ---
  const handleUnlock = () => {
    const stored = localStorage.getItem('empire_master_pwd');
    if (!stored) {
        localStorage.setItem('empire_master_pwd', masterPassword);
        setIsUnlocked(true);
        toast({ title: "הוגדרה סיסמת מאסטר" });
    } else if (stored === masterPassword) {
        setIsUnlocked(true);
        toast({ title: "הכספת נפתחה" });
    } else {
        toast({ title: "סיסמה שגויה", variant: "destructive" });
    }
    setActiveModal(null);
    setMasterPassword('');
  };

  const getStatusColor = (status) => {
    if (['online','active','connected','enabled'].includes(status)) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (['offline','error','disconnected'].includes(status)) return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  };

  // --- Render Sections ---

  const HostingTab = () => (
    <div className="space-y-6 animate-in fade-in">
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0A0E27]/60 backdrop-blur-xl border border-[#00D9FF]/20 rounded-2xl p-6 relative group overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#00D9FF]/10 rounded-xl"><Server className="w-6 h-6 text-[#00D9FF]" /></div>
                        <div><h3 className="font-bold text-lg text-white">תשתית שרתים</h3><p className="text-xs text-gray-400">Hosting & Infrastructure</p></div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openModal('infrastructure')}><Edit className="w-4 h-4 text-[#00D9FF]" /></Button>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>ספק:</span><span className="text-white">{hostingData.serverProvider}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>מיקום:</span><span className="text-white">{hostingData.location}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>IP:</span><span className="font-mono text-[#00D9FF]">{hostingData.serverIp}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>סטטוס:</span><span className={cn("px-2 rounded text-xs", getStatusColor(hostingData.serverStatus))}>{hostingData.serverStatus}</span></div>
                    <div className="flex justify-between"><span>עלות:</span><span className="text-green-500">{hostingData.cost}</span></div>
                </div>
            </div>

            <div className="bg-[#0A0E27]/60 backdrop-blur-xl border border-[#9D4EDD]/20 rounded-2xl p-6 relative group overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#9D4EDD]/10 rounded-xl"><Globe className="w-6 h-6 text-[#9D4EDD]" /></div>
                        <div><h3 className="font-bold text-lg text-white">דומיין ו-DNS</h3><p className="text-xs text-gray-400">Domain Management</p></div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openModal('domain')}><Edit className="w-4 h-4 text-[#9D4EDD]" /></Button>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>דומיין:</span><a href={`https://${hostingData.domain}`} target="_blank" rel="noreferrer" className="text-white hover:text-[#9D4EDD]">{hostingData.domain}</a></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>רשם:</span><span className="text-white">{hostingData.registrar}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>תוקף:</span><span className="text-white">{hostingData.expiration}</span></div>
                    <div className="flex justify-between"><span>DNS:</span><span className="text-white">{hostingData.dnsProvider}</span></div>
                </div>
            </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0A0E27]/60 backdrop-blur-xl border border-[#FFA500]/20 rounded-2xl p-6 relative group overflow-hidden col-span-1">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#FFA500]/10 rounded-xl"><Activity className="w-6 h-6 text-[#FFA500]" /></div>
                        <div><h3 className="font-bold text-lg text-white">Cloudflare</h3><p className="text-xs text-gray-400">Performance</p></div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openModal('cloudflare')}><Edit className="w-4 h-4 text-[#FFA500]" /></Button>
                </div>
                <div className="space-y-3">
                     <div className="flex justify-between p-2 bg-[#050A18] rounded border border-white/5"><span>חיבור</span><div className={cn("w-2 h-2 rounded-full", hostingData.cloudflare === 'connected' ? 'bg-green-500' : 'bg-red-500')} /></div>
                     <div className="flex justify-between p-2 bg-[#050A18] rounded border border-white/5"><span>SSL</span><Shield className={cn("w-4 h-4", hostingData.ssl === 'active' ? 'text-green-500' : 'text-gray-500')} /></div>
                     <div className="flex justify-between p-2 bg-[#050A18] rounded border border-white/5"><span>DDoS</span><Shield className={cn("w-4 h-4", hostingData.ddos === 'active' ? 'text-green-500' : 'text-gray-500')} /></div>
                </div>
            </div>

            <div className="bg-[#0A0E27]/60 backdrop-blur-xl border border-[#FF006E]/20 rounded-2xl p-6 relative group overflow-hidden col-span-1 lg:col-span-2">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#FF006E]/10 rounded-xl"><Target className="w-6 h-6 text-[#FF006E]" /></div>
                        <div><h3 className="font-bold text-lg text-white">חזון ויעדים</h3><p className="text-xs text-gray-400">Goals & Vision</p></div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openModal('vision')}><Edit className="w-4 h-4 text-[#FF006E]" /></Button>
                </div>
                <div className="space-y-4">
                    <div className="bg-[#050A18] p-3 rounded-xl border border-white/5 italic text-gray-300">"{hostingData.vision}"</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-xs text-[#00D9FF] block mb-1">טווח קצר</span><p className="text-sm font-bold">{hostingData.shortGoals}</p></div>
                        <div><span className="text-xs text-[#9D4EDD] block mb-1">טווח ארוך</span><p className="text-sm font-bold">{hostingData.longGoals}</p></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Credentials */}
        <div className="bg-[#0A0E27]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
             <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/5 rounded-xl"><Key className="w-6 h-6 text-yellow-500" /></div>
                      <div><h3 className="font-bold text-lg text-white">כספת סיסמאות</h3><p className="text-xs text-gray-400">Secure Vault</p></div>
                  </div>
                  <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openModal('masterPwd')} className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10">{isUnlocked ? 'פתוח' : 'נעל/פתח'}</Button>
                      <Button size="sm" onClick={() => openModal('credential')} className="bg-white/10 hover:bg-white/20"><Plus className="w-4 h-4 ml-2" />הוסף</Button>
                  </div>
             </div>
             {!isUnlocked ? (
                  <div className="py-10 text-center border border-dashed border-white/10 rounded-xl bg-[#050A18]/50">
                      <Lock className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">המידע נעול. לחץ על הכפתור לפתיחה.</p>
                  </div>
             ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {credentials.map(c => (
                          <div key={c.id} className="bg-[#050A18] p-4 rounded-xl border border-white/5 hover:border-white/20 group relative">
                              <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold uppercase text-xs px-2 py-0.5 bg-white/10 rounded">{c.type}</span>
                                  <div className="flex gap-1">
                                      <button onClick={() => openModal('credential', c)} className="p-1 hover:text-[#00D9FF]"><Edit className="w-3 h-3" /></button>
                                      <button onClick={() => deleteItem('credential', c.id)} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                              </div>
                              <div className="space-y-1 text-xs text-gray-400">
                                  <div>Host: {c.host}</div>
                                  <div>User: {c.username}</div>
                                  <div className="flex items-center gap-2">
                                      Pass: <span className="font-mono bg-white/5 px-1 rounded">{showPassword[c.id] ? atob(c.password) : '••••••'}</span>
                                      <button onClick={() => setShowPassword(p => ({...p, [c.id]: !p[c.id]}))}><Eye className="w-3 h-3" /></button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
             )}
        </div>
    </div>
  );

  const IssuesTab = () => (
     <div className="space-y-4">
        <div className="flex justify-between items-center bg-[#0A0E27]/40 p-4 rounded-xl border border-white/5">
             <h3 className="font-bold text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> תקלות ונושאים פתוחים</h3>
             <Button onClick={() => openModal('issue')} className="bg-red-500 hover:bg-red-600 text-white"><Plus className="w-4 h-4 ml-2" /> חדש</Button>
        </div>
        <div className="space-y-3">
             {issues.length === 0 && <div className="text-center py-10 text-gray-500">אין תקלות פתוחות</div>}
             {issues.map(issue => (
                 <div key={issue.id} className={cn("bg-[#050A18] p-4 rounded-xl border flex justify-between items-center group", issue.status === 'resolved' ? "border-green-500/20 opacity-60" : "border-red-500/20")}>
                     <div className="flex items-center gap-4">
                         <div className={cn("w-3 h-3 rounded-full", issue.priority === 'high' ? 'bg-red-500' : issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500')} />
                         <div>
                             <h4 className={cn("font-bold text-sm", issue.status === 'resolved' && "line-through")}>{issue.title}</h4>
                             <p className="text-xs text-gray-500">{issue.description} • {issue.date}</p>
                         </div>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="sm" onClick={() => openModal('issue', issue)}><Edit className="w-4 h-4" /></Button>
                         <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteItem('issue', issue.id)}><Trash2 className="w-4 h-4" /></Button>
                     </div>
                 </div>
             ))}
        </div>
     </div>
  );

  const TeamManager = () => (
      <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">צוות הפרויקט</h3>
              <Button onClick={() => openModal('team')} className="bg-[#00D9FF] text-black hover:bg-[#00B4D8]"><UserPlus className="w-4 h-4 ml-2" /> הוסף חבר צוות</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map(member => (
                  <div key={member.id} className="bg-[#0A0E27]/60 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-[#00D9FF]/30 transition-all">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#9D4EDD] p-[2px]">
                          <div className="w-full h-full rounded-full bg-[#050A18] flex items-center justify-center font-bold text-white">{member.avatar}</div>
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-white">{member.name}</h4>
                          <p className="text-xs text-gray-400">{member.role}</p>
                          <span className="text-[10px] bg-white/10 px-2 rounded-full mt-1 inline-block">{member.access}</span>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('team', member)} className="p-1 hover:text-[#00D9FF]"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteItem('team', member.id)} className="p-1 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const FileManager = () => (
      <div className="space-y-4">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">קבצים ומסמכים</h3>
              <div className="flex gap-2">
                  <Button variant="outline" className="border-white/10"><FolderPlus className="w-4 h-4 ml-2" /> תיקייה חדשה</Button>
                  <Button onClick={() => openModal('file')} className="bg-[#9D4EDD] text-white hover:bg-[#8B3DCD]"><UploadCloud className="w-4 h-4 ml-2" /> העלאה</Button>
              </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map(file => (
                  <div key={file.id} className="bg-[#050A18] border border-white/5 p-4 rounded-xl hover:bg-white/5 transition-colors group relative aspect-square flex flex-col items-center justify-center text-center">
                       <FileText className="w-10 h-10 text-gray-500 mb-2 group-hover:text-[#00D9FF] transition-colors" />
                       <span className="text-sm font-bold text-gray-300 truncate w-full">{file.name}</span>
                       <span className="text-xs text-gray-500">{file.size}</span>
                       <button onClick={() => deleteItem('file', file.id)} className="absolute top-2 left-2 p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
              ))}
          </div>
      </div>
  );

  const ReportsDashboard = () => (
       <div className="space-y-4">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">דוחות וסטטיסטיקה</h3>
              <Button onClick={() => openModal('report')} className="bg-[#FF006E] text-white hover:bg-[#E0005E]"><PieChart className="w-4 h-4 ml-2" /> דוח חדש</Button>
          </div>
          <div className="space-y-3">
              {reports.map(report => (
                  <div key={report.id} className="bg-[#0A0E27]/40 border border-white/5 p-4 rounded-xl flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-lg"><BarChart2 className="w-6 h-6 text-[#FF006E]" /></div>
                          <div>
                              <h4 className="font-bold text-white">{report.title}</h4>
                              <p className="text-xs text-gray-400">{report.date} • {report.type}</p>
                          </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => openModal('report', report)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteItem('report', report.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                  </div>
              ))}
          </div>
       </div>
  );

  const SettingsPanel = () => (
      <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-[#0A0E27]/60 border border-white/10 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-lg text-white border-b border-white/5 pb-2">הגדרות פרויקט</h3>
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><Label>שם הפרויקט</Label><div className="p-2 bg-[#050A18] rounded border border-white/10 text-gray-300">{project.title}</div></div>
                      <div className="space-y-1"><Label>לקוח</Label><div className="p-2 bg-[#050A18] rounded border border-white/10 text-gray-300">{project.client}</div></div>
                  </div>
                  <div className="space-y-1"><Label>תיאור</Label><div className="p-2 bg-[#050A18] rounded border border-white/10 text-gray-300 min-h-[60px]">{project.description}</div></div>
                  <div className="pt-2">
                       <Button onClick={() => openModal('settings')} className="bg-[#00D9FF] text-black w-full font-bold">ערוך פרטים</Button>
                  </div>
              </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex justify-between items-center">
               <div>
                   <h4 className="font-bold text-red-500">מחיקת פרויקט</h4>
                   <p className="text-xs text-red-400/70">פעולה זו תמחק את כל המידע לצמיתות</p>
               </div>
               <Button variant="destructive">מחק פרויקט</Button>
          </div>
      </div>
  );

  const tabs = [
    { id: 'hosting', label: 'שרתים ותשתית', icon: Server },
    { id: 'issues', label: 'תקלות', icon: AlertTriangle },
    { id: 'team', label: 'צוות', icon: Users },
    { id: 'files', label: 'קבצים', icon: Folder },
    { id: 'analytics', label: 'דוחות', icon: BarChart2 },
    { id: 'settings', label: 'הגדרות', icon: Settings },
  ];

  if (!project) return <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-[#00D9FF]">טוען...</div>;

  return (
    <>
      <Helmet><title>{project.title} | Empire</title></Helmet>
      
      <div className="flex flex-col h-[calc(100vh-6rem)] pb-4 space-y-6 font-rubik">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
             <Link to="/projects"><Button variant="ghost" size="icon" className="bg-[#0A0E27] border border-white/10"><ArrowRight className="w-5 h-5" /></Button></Link>
             <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><span className="opacity-60">Projects</span><span className="opacity-40">/</span><span className="text-[#00D9FF] uppercase tracking-wider font-bold">{project.client}</span></div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">{project.title}</h1>
             </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-white/10 hover:border-[#00D9FF] hover:text-[#00D9FF]" onClick={() => openModal('share')}><Share2 className="w-4 h-4 ml-2" /> שתף</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 border-b border-white/5">
          <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn("px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap outline-none",
                  activeTab === tab.id ? "border-[#00D9FF] text-[#00D9FF] bg-gradient-to-t from-[#00D9FF]/10 to-transparent" : "border-transparent text-gray-500 hover:text-white"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "scale-110 drop-shadow-[0_0_5px_currentColor]")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
                {activeTab === 'hosting' && <HostingTab />}
                {activeTab === 'issues' && <IssuesTab />}
                {activeTab === 'team' && <TeamManager />}
                {activeTab === 'files' && <FileManager />}
                {activeTab === 'analytics' && <ReportsDashboard />}
                {activeTab === 'settings' && <SettingsPanel />}
              </motion.div>
            </AnimatePresence>
        </div>
      </div>

      {/* --- Unified Modal for All Edits --- */}
      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="bg-[#0A0E27] border border-[#00D9FF]/20 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-[#00D9FF] font-bold">
                    {activeModal === 'infrastructure' && 'עריכת תשתית'}
                    {activeModal === 'domain' && 'עריכת דומיין'}
                    {activeModal === 'team' && (editingItem ? 'עריכת חבר צוות' : 'הוספת חבר צוות')}
                    {activeModal === 'file' && 'העלאת קובץ'}
                    {activeModal === 'report' && 'דוח חדש'}
                    {activeModal === 'issue' && 'דיווח תקלה'}
                    {activeModal === 'credential' && 'פרטי גישה'}
                    {activeModal === 'settings' && 'עריכת פרויקט'}
                    {activeModal === 'masterPwd' && 'כספת סיסמאות'}
                </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
                 {/* Infrastructure Form */}
                 {activeModal === 'infrastructure' && (
                     <>
                        <div className="space-y-1"><Label>ספק שרתים</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.serverProvider || ''} onChange={e=>setFormData({...formData, serverProvider:e.target.value})} /></div>
                        <div className="space-y-1"><Label>מיקום</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.location || ''} onChange={e=>setFormData({...formData, location:e.target.value})} /></div>
                        <div className="space-y-1"><Label>כתובת IP</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.serverIp || ''} onChange={e=>setFormData({...formData, serverIp:e.target.value})} /></div>
                        <div className="space-y-1"><Label>סטטוס</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.serverStatus || 'online'} onChange={e=>setFormData({...formData, serverStatus:e.target.value})}><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option></select></div>
                        <div className="space-y-1"><Label>עלות חודשית</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.cost || ''} onChange={e=>setFormData({...formData, cost:e.target.value})} /></div>
                     </>
                 )}

                 {/* Domain Form */}
                 {activeModal === 'domain' && (
                     <>
                        <div className="space-y-1"><Label>דומיין</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.domain || ''} onChange={e=>setFormData({...formData, domain:e.target.value})} /></div>
                        <div className="space-y-1"><Label>רשם (Registrar)</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.registrar || ''} onChange={e=>setFormData({...formData, registrar:e.target.value})} /></div>
                        <div className="space-y-1"><Label>תאריך תפוגה</Label><input type="date" className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.expiration || ''} onChange={e=>setFormData({...formData, expiration:e.target.value})} /></div>
                        <div className="space-y-1"><Label>ספק DNS</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.dnsProvider || ''} onChange={e=>setFormData({...formData, dnsProvider:e.target.value})} /></div>
                     </>
                 )}

                 {/* Cloudflare Form */}
                 {activeModal === 'cloudflare' && (
                     <>
                        <div className="space-y-1"><Label>סטטוס חיבור</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.cloudflare || 'connected'} onChange={e=>setFormData({...formData, cloudflare:e.target.value})}><option value="connected">Connected</option><option value="disconnected">Disconnected</option></select></div>
                        <div className="space-y-1"><Label>SSL/TLS</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.ssl || 'active'} onChange={e=>setFormData({...formData, ssl:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                        <div className="space-y-1"><Label>הגנת DDoS</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.ddos || 'active'} onChange={e=>setFormData({...formData, ddos:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                     </>
                 )}

                 {/* Vision Form */}
                 {activeModal === 'vision' && (
                     <>
                        <div className="space-y-1"><Label>חזון הפרויקט</Label><textarea rows={3} className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.vision || ''} onChange={e=>setFormData({...formData, vision:e.target.value})} /></div>
                        <div className="space-y-1"><Label>יעדים לטווח קצר</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.shortGoals || ''} onChange={e=>setFormData({...formData, shortGoals:e.target.value})} /></div>
                        <div className="space-y-1"><Label>יעדים לטווח ארוך</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.longGoals || ''} onChange={e=>setFormData({...formData, longGoals:e.target.value})} /></div>
                     </>
                 )}

                 {/* Team Form */}
                 {activeModal === 'team' && (
                     <>
                        <div className="space-y-1"><Label>שם מלא</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
                        <div className="space-y-1"><Label>אימייל</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.email || ''} onChange={e=>setFormData({...formData, email:e.target.value})} /></div>
                        <div className="space-y-1"><Label>תפקיד</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.role || ''} onChange={e=>setFormData({...formData, role:e.target.value})} /></div>
                        <div className="space-y-1"><Label>הרשאה</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.access || 'read'} onChange={e=>setFormData({...formData, access:e.target.value})}><option value="read">צפייה בלבד</option><option value="write">עריכה</option><option value="admin">ניהול מלא</option></select></div>
                     </>
                 )}

                 {/* File Form */}
                 {activeModal === 'file' && (
                     <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                        <UploadCloud className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                        <Label className="block mb-2">גרור קובץ לכאן או לחץ להעלאה</Label>
                        <input className="w-full bg-[#050A18] border border-white/10 rounded p-2 mb-2" placeholder="שם הקובץ (לדמו)" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} />
                     </div>
                 )}
                 
                 {/* Reports Form */}
                 {activeModal === 'report' && (
                     <>
                        <div className="space-y-1"><Label>כותרת הדוח</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.title || ''} onChange={e=>setFormData({...formData, title:e.target.value})} /></div>
                        <div className="space-y-1"><Label>סוג</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.type || 'status'} onChange={e=>setFormData({...formData, type:e.target.value})}><option value="status">סטטוס שבועי</option><option value="performance">ביצועים</option><option value="seo">SEO</option></select></div>
                        <div className="space-y-1"><Label>תקציר</Label><textarea rows={3} className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.summary || ''} onChange={e=>setFormData({...formData, summary:e.target.value})} /></div>
                     </>
                 )}

                 {/* Issues Form */}
                 {activeModal === 'issue' && (
                     <>
                        <div className="space-y-1"><Label>כותרת התקלה</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.title || ''} onChange={e=>setFormData({...formData, title:e.target.value})} /></div>
                        <div className="space-y-1"><Label>תיאור</Label><textarea rows={3} className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.description || ''} onChange={e=>setFormData({...formData, description:e.target.value})} /></div>
                        <div className="space-y-1"><Label>דחיפות</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.priority || 'medium'} onChange={e=>setFormData({...formData, priority:e.target.value})}><option value="low">נמוכה</option><option value="medium">בינונית</option><option value="high">גבוהה</option></select></div>
                     </>
                 )}

                 {/* Credentials Form */}
                 {activeModal === 'credential' && (
                     <>
                        <div className="space-y-1"><Label>סוג</Label><select className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.type || 'ftp'} onChange={e=>setFormData({...formData, type:e.target.value})}><option value="ftp">FTP</option><option value="ssh">SSH</option><option value="db">Database</option><option value="admin">Admin Panel</option></select></div>
                        <div className="space-y-1"><Label>Host/URL</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.host || ''} onChange={e=>setFormData({...formData, host:e.target.value})} /></div>
                        <div className="space-y-1"><Label>Username</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.username || ''} onChange={e=>setFormData({...formData, username:e.target.value})} /></div>
                        <div className="space-y-1"><Label>Password</Label><input type="password" className="w-full bg-[#050A18] border border-white/10 rounded p-2" placeholder={editingItem ? '(השאר ריק כדי לשמור קיים)' : ''} value={formData.password || ''} onChange={e=>setFormData({...formData, password:e.target.value})} /></div>
                     </>
                 )}

                 {/* Settings Form */}
                 {activeModal === 'settings' && (
                     <>
                        <div className="space-y-1"><Label>שם הפרויקט</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.title || ''} onChange={e=>setFormData({...formData, title:e.target.value})} /></div>
                        <div className="space-y-1"><Label>תיאור</Label><textarea rows={3} className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.description || ''} onChange={e=>setFormData({...formData, description:e.target.value})} /></div>
                        <div className="space-y-1"><Label>לקוח</Label><input className="w-full bg-[#050A18] border border-white/10 rounded p-2" value={formData.client || ''} onChange={e=>setFormData({...formData, client:e.target.value})} /></div>
                     </>
                 )}

                 {/* Master Password */}
                 {activeModal === 'masterPwd' && (
                     <div className="py-6 text-center">
                         <Label className="mb-2 block">הזן סיסמת מאסטר</Label>
                         <input type="password" autoFocus className="w-full bg-[#050A18] border border-white/10 rounded p-2 text-center text-xl tracking-widest" value={masterPassword} onChange={e=>setMasterPassword(e.target.value)} />
                     </div>
                 )}
            </div>

            <DialogFooter>
                {activeModal === 'masterPwd' ? (
                     <Button onClick={handleUnlock} className="w-full bg-yellow-500 text-black hover:bg-yellow-400">אישור</Button>
                ) : (
                    <>
                        <Button variant="ghost" onClick={() => setActiveModal(null)}>ביטול</Button>
                        <Button onClick={handleSave} className="bg-[#00D9FF] text-black hover:bg-[#00B4D8]">שמור</Button>
                    </>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectDetail;
