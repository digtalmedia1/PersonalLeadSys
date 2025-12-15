import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, Plus, MessageCircle, Globe, Smartphone, Copy, Check, Search, 
  ExternalLink, MoreVertical, Trash2, Edit, Activity, Power, RefreshCw,
  Filter, Shield, AlertTriangle, Terminal, Play, Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { getChannels, updateCachedChannels } from '@/lib/api';

const Channels = () => {
  const { toast } = useToast();

  // --- State ---
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // Active Items
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [editingChannel, setEditingChannel] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    type: 'whatsapp',
    source: '',
    description: '',
    status: 'active',
    category: 'marketing'
  });

  // Constants
  const channelTypes = [
    { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageCircle, color: '#25D366' },
    { id: 'website', label: 'Website Form', icon: Globe, color: '#00D9FF' },
    { id: 'api', label: 'Custom API', icon: Terminal, color: '#9D4EDD' },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone, color: '#FF006E' }
  ];

  // --- Data Loading ---
  useEffect(() => {
    loadChannels();
  }, []);

  const normalizeChannel = (channel) => ({
    id: channel.id,
    name: channel.name || 'ערוץ ללא שם',
    type: channel.type || channel.channel_type || 'api',
    source: channel.source || channel.project_id || 'לא צוין מקור',
    webhook: channel.webhook || channel.webhook_url || '',
    status: channel.status || 'active',
    description: channel.description || channel.notes || '',
    events: channel.events ?? channel.metrics?.events ?? 0,
    lastActive: channel.lastActive || channel.last_active || channel.updated_at || channel.created_at || new Date().toISOString()
  });

  const loadChannels = async () => {
    setLoading(true);
    setError('');
    try {
      const fetched = await getChannels();
      setChannels(fetched.map(normalizeChannel));
    } catch (err) {
      console.error('Failed to load channels', err);
      setError('טעינת הערוצים נכשלה מהשרת.');
    } finally {
      setLoading(false);
    }
  };

  const saveChannels = (newChannels) => {
    setChannels(newChannels);
    updateCachedChannels(newChannels);
  };

  // --- Actions ---
  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    
    if (editingChannel) {
      // Update
      const updated = channels.map(c => 
        c.id === editingChannel.id ? { ...c, ...formData } : c
      );
      saveChannels(updated);
      toast({ title: "ערוץ עודכן", description: "פרטי הערוץ נשמרו בהצלחה" });
    } else {
      // Create
      const newChannel = {
        id: `ch_${Date.now()}`,
        webhook: `https://api.empire.com/wh/${Date.now()}`, // Auto-generate webhook
        events: 0,
        lastActive: new Date().toISOString(),
        ...formData
      };
      saveChannels([...channels, newChannel]);
      toast({ title: "ערוץ נוצר", description: "הערוץ נוסף למערכת וקיבל כתובת Webhook" });
    }
    
    setIsCreateModalOpen(false);
    setEditingChannel(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!channelToDelete) return;
    const filtered = channels.filter(c => c.id !== channelToDelete.id);
    saveChannels(filtered);
    setIsDeleteAlertOpen(false);
    setChannelToDelete(null);
    if (selectedChannel?.id === channelToDelete.id) setIsDetailModalOpen(false);
    toast({ title: "ערוץ נמחק", variant: "destructive" });
  };

  const toggleStatus = (channel) => {
    const newStatus = channel.status === 'active' ? 'inactive' : 'active';
    const updated = channels.map(c => 
      c.id === channel.id ? { ...c, status: newStatus } : c
    );
    saveChannels(updated);
    
    // Update selected channel view if open
    if (selectedChannel && selectedChannel.id === channel.id) {
      setSelectedChannel({ ...selectedChannel, status: newStatus });
    }
    
    toast({ 
      title: newStatus === 'active' ? "הערוץ הופעל" : "הערוץ הושבת",
      className: newStatus === 'active' ? "border-green-500" : "border-gray-500"
    });
  };

  const regenerateWebhook = (channel) => {
    const newWebhook = `https://api.empire.com/wh/${Date.now()}_v2`;
    const updated = channels.map(c => 
      c.id === channel.id ? { ...c, webhook: newWebhook } : c
    );
    saveChannels(updated);
    if (selectedChannel) setSelectedChannel({ ...selectedChannel, webhook: newWebhook });
    toast({ title: "Webhook עודכן", description: "כתובת חדשה נוצרה בהצלחה" });
  };

  // --- Helpers ---
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'whatsapp',
      source: '',
      description: '',
      status: 'active',
      category: 'marketing'
    });
  };

  const openEdit = (channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      type: channel.type,
      source: channel.source,
      description: channel.description || '',
      status: channel.status,
      category: channel.category || 'marketing'
    });
    setIsCreateModalOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "הועתק", description: "הטקסט הועתק ללוח" });
  };

  const filteredChannels = channels.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: channels.length,
    active: channels.filter(c => c.status === 'active').length,
    events: channels.reduce((acc, curr) => acc + (curr.events || 0), 0)
  };

  return (
    <>
      <Helmet>
        <title>ניהול ערוצים - Empire CRM</title>
      </Helmet>
      
      <div className="space-y-6 pb-20 font-rubik" dir="rtl">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
           <div className="w-full xl:w-auto space-y-4">
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
                  ניהול ערוצים
                </h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#00D9FF]" />
                  מקורות לידים, אינטגרציות וחיבורי Webhook
                </p>
              </div>

              {/* Mini Stats */}
              <div className="flex gap-4">
                 <div className="bg-[#0A0E27]/80 border border-[#00D9FF]/20 rounded-xl p-3 min-w-[120px] shadow-[0_0_15px_rgba(0,217,255,0.1)]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">ערוצים פעילים</span>
                    <span className="text-2xl font-black text-white">{stats.active}<span className="text-gray-500 text-sm font-normal">/{stats.total}</span></span>
                 </div>
                 <div className="bg-[#0A0E27]/80 border border-[#9D4EDD]/20 rounded-xl p-3 min-w-[120px] shadow-[0_0_15px_rgba(157,78,221,0.1)]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">סה"כ אירועים</span>
                    <span className="text-2xl font-black text-[#9D4EDD]">{stats.events.toLocaleString()}</span>
                 </div>
              </div>
           </div>

           <Button 
             onClick={() => { setEditingChannel(null); resetForm(); setIsCreateModalOpen(true); }}
             className="bg-gradient-to-r from-[#9D4EDD] to-[#FF006E] text-white font-bold shadow-[0_0_20px_rgba(157,78,221,0.4)] hover:shadow-[0_0_30px_rgba(157,78,221,0.6)] transition-all h-12 px-6 w-full xl:w-auto"
           >
             <Plus className="w-5 h-5 ml-2" />
             ערוץ חדש
           </Button>
        </div>

        {/* Filters & Search */}
        <div className="bg-[#0A0E27]/60 border border-[#00D9FF]/10 backdrop-blur-xl p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-lg">
           <div className="relative group w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D9FF] transition-colors" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש לפי שם או מקור..." 
                className="w-full bg-[#050A18] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-all"
              />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Button 
                variant="ghost" 
                onClick={() => setFilterType('all')}
                className={cn("rounded-xl border", filterType === 'all' ? "bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/50" : "border-transparent text-gray-400 hover:text-white hover:bg-white/5")}
              >
                הכל
              </Button>
              {channelTypes.map(type => (
                <Button 
                  key={type.id}
                  variant="ghost" 
                  onClick={() => setFilterType(type.id)}
                  className={cn("rounded-xl border gap-2", filterType === type.id ? "bg-[#00D9FF]/20 text-white border-[#00D9FF]/50" : "border-transparent text-gray-400 hover:text-white hover:bg-white/5")}
                >
                  <type.icon className="w-4 h-4" style={{ color: filterType === type.id ? 'white' : type.color }} />
                  {type.label}
                </Button>
              ))}
           </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
             <div className="col-span-full py-20 text-center text-gray-500">טוען ערוצים...</div>
           ) : error ? (
             <div className="col-span-full py-12 text-center text-red-400 bg-red-500/5 border border-red-500/30 rounded-2xl">
               {error}
             </div>
           ) : filteredChannels.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-[#0A0E27]/30 border border-dashed border-white/10 rounded-2xl">
               <Radio className="w-12 h-12 text-gray-600 mx-auto mb-4" />
               <p className="text-gray-400 text-lg">לא נמצאו ערוצים</p>
               <Button variant="link" onClick={() => setIsCreateModalOpen(true)} className="text-[#00D9FF]">צור ערוץ ראשון</Button>
             </div>
           ) : (
             <AnimatePresence>
                {filteredChannels.map((channel, idx) => {
                  const TypeIcon = channelTypes.find(t => t.id === channel.type)?.icon || Radio;
                  const typeColor = channelTypes.find(t => t.id === channel.type)?.color || '#gray';
                  const isActive = channel.status === 'active';

                  return (
                    <motion.div
                      key={channel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => { setSelectedChannel(channel); setIsDetailModalOpen(true); }}
                      className="group relative bg-[#050A18] border border-white/5 hover:border-[#00D9FF]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,217,255,0.1)] cursor-pointer overflow-hidden"
                    >
                       {/* Status Indicator Stripe */}
                       <div className={cn("absolute top-0 right-0 w-1.5 h-full transition-colors", isActive ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-gray-600")} />

                       <div className="flex justify-between items-start mb-4 pr-3">
                          <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0A0E27] border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                                <TypeIcon className="w-6 h-6" style={{ color: typeColor }} />
                             </div>
                             <div>
                                <h3 className="font-bold text-white text-lg leading-tight group-hover:text-[#00D9FF] transition-colors">{channel.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 font-mono truncate max-w-[150px]">{channel.source}</p>
                             </div>
                          </div>
                          <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20")}>
                             {isActive ? 'פעיל' : 'מושהה'}
                          </div>
                       </div>

                       <p className="text-sm text-gray-400 mb-6 line-clamp-2 min-h-[40px] pr-3">
                          {channel.description || 'אין תיאור זמין עבור ערוץ זה.'}
                       </p>

                       <div className="grid grid-cols-2 gap-2 mb-4 pr-3">
                          <div className="bg-[#0A0E27] p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                             <span className="text-[10px] text-gray-500">אירועים</span>
                             <span className="text-lg font-bold text-white">{channel.events || 0}</span>
                          </div>
                          <div className="bg-[#0A0E27] p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                             <span className="text-[10px] text-gray-500">פעילות אחרונה</span>
                             <span className="text-xs font-bold text-white">{new Date(channel.lastActive).toLocaleDateString('he-IL', {day:'numeric', month:'numeric'})}</span>
                          </div>
                       </div>
                       
                       {/* Quick Actions overlay on hover */}
                       <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-5 h-5 text-[#00D9FF]" />
                       </div>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
           )}
        </div>

        {/* --- Create/Edit Modal --- */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
           <DialogContent className="bg-[#0A0E27] border border-[#00D9FF]/20 text-white sm:max-w-[500px]">
              <DialogHeader>
                 <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {editingChannel ? <Edit className="w-5 h-5 text-[#00D9FF]" /> : <Plus className="w-5 h-5 text-[#00D9FF]" />}
                    {editingChannel ? 'עריכת ערוץ' : 'הוספת ערוץ חדש'}
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    הגדר את פרטי הערוץ לחיבור למערכת הלידים
                 </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label>שם הערוץ</Label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" placeholder="לדוגמה: דף נחיתה ראשי" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>סוג ערוץ</Label>
                       <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]">
                          {channelTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label>סטטוס</Label>
                       <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]">
                          <option value="active">פעיל</option>
                          <option value="inactive">לא פעיל</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label>מקור (Source Identifier)</Label>
                    <input required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" placeholder="לדוגמה: domain.com או טלפון" />
                 </div>

                 <div className="space-y-2">
                    <Label>תיאור</Label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#050A18] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" />
                 </div>

                 <DialogFooter className="mt-4 gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="text-gray-400">ביטול</Button>
                    <Button type="submit" className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
                       {editingChannel ? 'שמור שינויים' : 'צור ערוץ'}
                    </Button>
                 </DialogFooter>
              </form>
           </DialogContent>
        </Dialog>

        {/* --- Detail Modal --- */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
           <DialogContent className="bg-[#050A18] border border-[#00D9FF]/20 text-white sm:max-w-[700px] overflow-hidden p-0 gap-0">
              {selectedChannel && (
                <div className="flex flex-col h-full">
                   {/* Modal Header Banner */}
                   <div className="h-32 bg-gradient-to-r from-[#00D9FF]/20 to-[#9D4EDD]/20 relative">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
                      <div className="absolute -bottom-10 right-8 flex items-end gap-4">
                         <div className="w-20 h-20 rounded-2xl bg-[#050A18] border-2 border-[#00D9FF] flex items-center justify-center shadow-xl p-4">
                            {(() => {
                               const TypeIcon = channelTypes.find(t => t.id === selectedChannel.type)?.icon || Radio;
                               const typeColor = channelTypes.find(t => t.id === selectedChannel.type)?.color;
                               return <TypeIcon className="w-full h-full" style={{ color: typeColor }} />;
                            })()}
                         </div>
                      </div>
                      <DialogClose className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                         <MoreVertical className="w-5 h-5" />
                      </DialogClose>
                   </div>

                   {/* Content */}
                   <div className="pt-12 px-8 pb-8 space-y-6">
                      <div className="flex justify-between items-start">
                         <div>
                            <h2 className="text-2xl font-black text-white">{selectedChannel.name}</h2>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                               <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {selectedChannel.source}</span>
                               <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {selectedChannel.events} אירועים</span>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => toggleStatus(selectedChannel)}
                              className={cn("gap-2 border-opacity-50", selectedChannel.status === 'active' ? "text-green-500 border-green-500 hover:bg-green-500/10" : "text-gray-400 border-gray-500 hover:bg-gray-500/10")}
                            >
                               {selectedChannel.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                               {selectedChannel.status === 'active' ? 'השהה' : 'הפעל'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setIsDetailModalOpen(false); openEdit(selectedChannel); }} className="gap-2 border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF]/10">
                               <Edit className="w-4 h-4" /> ערוך
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => { setChannelToDelete(selectedChannel); setIsDeleteAlertOpen(true); }} className="gap-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white">
                               <Trash2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </div>

                      {/* Webhook Section */}
                      <div className="bg-[#0A0E27] rounded-xl border border-[#00D9FF]/20 p-4 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-1 h-full bg-[#00D9FF]" />
                         <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                               <Terminal className="w-4 h-4 text-[#00D9FF]" />
                               Webhook Integration
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => regenerateWebhook(selectedChannel)} className="h-6 text-xs text-gray-500 hover:text-[#00D9FF]">
                               <RefreshCw className="w-3 h-3 mr-1" /> חדש מפתח
                            </Button>
                         </div>
                         <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-gray-300 break-all flex items-center justify-between gap-4">
                            <span>{selectedChannel.webhook}</span>
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedChannel.webhook)} className="hover:bg-white/10 shrink-0">
                               <Copy className="w-4 h-4" />
                            </Button>
                         </div>
                         <p className="text-[10px] text-gray-500 mt-2">
                            השתמש בכתובת זו כדי לשלוח לידים למערכת בפורמט JSON. וודא שאתה שולח POST request.
                         </p>
                      </div>

                      {/* Recent Activity Log (Mock) */}
                      <div>
                         <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">לוג פעילות אחרון</h3>
                         <div className="space-y-2">
                            {[1, 2, 3].map((_, i) => (
                               <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                                  <div className="flex items-center gap-3">
                                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                                     <span className="text-gray-300">ליד חדש התקבל בהצלחה</span>
                                  </div>
                                  <span className="text-gray-500">{new Date(Date.now() - i * 3600000).toLocaleTimeString('he-IL')}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </DialogContent>
        </Dialog>

        {/* --- Delete Alert --- */}
        <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
           <DialogContent className="bg-[#050A18] border border-red-500/30 text-white sm:max-w-[400px]">
              <DialogHeader>
                 <DialogTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    מחיקת ערוץ
                 </DialogTitle>
                 <DialogDescription className="text-gray-400">
                    האם אתה בטוח שברצונך למחוק את הערוץ <strong>{channelToDelete?.name}</strong>? פעולה זו תפסיק קבלת לידים ממקור זה באופן מיידי.
                 </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 gap-2">
                 <Button variant="ghost" onClick={() => setIsDeleteAlertOpen(false)} className="text-gray-400">ביטול</Button>
                 <Button variant="destructive" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">מחק ערוץ</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default Channels;