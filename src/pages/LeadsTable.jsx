import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Eye, MoreVertical, Download, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { getLeads, updateCachedLeads } from '@/lib/api';

const LeadsTable = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new',
    source: '',
    value: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedLeads = await getLeads();
      // Enhance leads if missing data for UI
      const enhancedLeads = fetchedLeads.map(l => ({
        ...l,
        name: l.contact_name || l.title || 'Unknown',
        email: l.email || 'no-email@provided.com', // Placeholder if not in seed
        phone: l.phone || '',
        date: l.created_at ? l.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        source: l.source || 'Manual'
      }));
      setLeads(enhancedLeads);
    } catch (error) {
      console.error('Failed to load leads', error);
      setError('טעינת נתוני הלידים נכשלה');
    }
    setLoading(false);
  };

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    updateCachedLeads(newLeads);
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.status) {
      toast({ title: "שגיאה", description: "נא למלא שדות חובה", variant: "destructive" });
      return;
    }

    const newLead = {
      id: `l_${Date.now()}`,
      contact_name: formData.name,
      title: `${formData.name} - ${formData.source || 'New Lead'}`,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      source: formData.source,
      value: Number(formData.value) || 0,
      created_at: new Date(formData.date).toISOString()
    };

    saveLeads([newLead, ...leads]);
    setIsAddModalOpen(false);
    resetForm();
    toast({ title: "ליד נוסף בהצלחה", description: newLead.contact_name });
  };

  const handleEditLead = (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    const updatedLeads = leads.map(l => l.id === selectedLead.id ? {
      ...l,
      contact_name: formData.name,
      title: `${formData.name} - ${formData.source || 'Lead'}`,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      source: formData.source,
      value: Number(formData.value) || 0,
      // Date usually doesn't change on edit unless specified, but we'll allow it
      created_at: new Date(formData.date).toISOString()
    } : l);

    saveLeads(updatedLeads);
    setIsEditModalOpen(false);
    setSelectedLead(null);
    resetForm();
    toast({ title: "הליד עודכן בהצלחה" });
  };

  const handleDeleteLead = () => {
    if (!selectedLead) return;
    const filteredLeads = leads.filter(l => l.id !== selectedLead.id);
    saveLeads(filteredLeads);
    setIsDeleteModalOpen(false);
    setSelectedLead(null);
    toast({ title: "הליד נמחק", variant: "destructive" });
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name || lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      value: lead.value,
      date: lead.date || lead.created_at.split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'new',
      source: '',
      value: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/50';
      case 'contacted': return 'bg-[#9D4EDD]/20 text-[#9D4EDD] border-[#9D4EDD]/50';
      case 'in_process': return 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/50';
      case 'closed': case 'won': return 'bg-[#25D366]/20 text-[#25D366] border-[#25D366]/50';
      case 'lost': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'חדש',
      contacted: 'נוצר קשר',
      in_process: 'בתהליך',
      closed: 'סגור/זכייה',
      won: 'זכייה',
      lost: 'הפסד'
    };
    return labels[status] || status;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals for dashboard summary at top of table
  const totalValue = leads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const conversionRate = leads.length > 0 
    ? ((leads.filter(l => l.status === 'closed' || l.status === 'won').length / leads.length) * 100).toFixed(1) 
    : 0;

  return (
    <>
      <Helmet>
        <title>טבלת לידים - Empire Leads Hub</title>
      </Helmet>
      
      <div className="relative min-h-full font-rubik text-right pb-20" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
           <div>
             <h1 className="text-3xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(157,78,221,0.5)]">מאגר לידים</h1>
             <p className="text-gray-400 text-sm">צפייה וניהול מרוכז של כל הלידים במערכת</p>
           </div>
           <div className="flex gap-2">
             <Button 
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                className="bg-[#00D9FF] text-[#050A18] hover:bg-[#00B4D8] font-bold shadow-[0_0_15px_rgba(0,217,255,0.4)]"
             >
               <Plus className="w-5 h-5 ml-2" />
               ליד חדש
             </Button>
             <Button variant="outline" className="border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10">
               <Download className="w-4 h-4 ml-2" />
               ייצוא CSV
             </Button>
           </div>
        </div>

        {/* Mini Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-[#050A18]/60 border border-white/5 p-4 rounded-xl">
              <span className="text-gray-400 text-xs">סה"כ לידים</span>
              <p className="text-2xl font-black text-white">{leads.length}</p>
           </div>
           <div className="bg-[#050A18]/60 border border-white/5 p-4 rounded-xl">
              <span className="text-gray-400 text-xs">שווי כולל</span>
              <p className="text-2xl font-black text-[#00D9FF]">₪{totalValue.toLocaleString()}</p>
           </div>
           <div className="bg-[#050A18]/60 border border-white/5 p-4 rounded-xl">
              <span className="text-gray-400 text-xs">יחס המרה</span>
              <p className="text-2xl font-black text-[#9D4EDD]">{conversionRate}%</p>
           </div>
           <div className="bg-[#050A18]/60 border border-white/5 p-4 rounded-xl">
              <span className="text-gray-400 text-xs">לידים חדשים החודש</span>
              <p className="text-2xl font-black text-[#FF006E]">
                 {leads.filter(l => l.date && l.date.startsWith(new Date().toISOString().slice(0, 7))).length}
              </p>
           </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#050A18]/60 backdrop-blur-md border border-[#00D9FF]/20 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
           <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00D9FF]" />
              <input 
                type="text" 
                placeholder="חיפוש לפי שם, אימייל או טלפון..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0E27] border border-[#00D9FF]/20 rounded-lg py-2 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-[#00D9FF] transition-colors"
              />
           </div>
           <div className="flex gap-3 w-full md:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0A0E27] border border-[#00D9FF]/20 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-[#00D9FF] flex-1"
              >
                <option value="all">כל הסטטוסים</option>
                <option value="new">חדש</option>
                <option value="contacted">נוצר קשר</option>
                <option value="in_process">בתהליך</option>
                <option value="closed">סגור/זכייה</option>
              </select>
           </div>
        </div>

        {/* Table */}
        <div className="bg-[#050A18]/60 backdrop-blur-md border border-[#00D9FF]/20 rounded-xl overflow-hidden shadow-2xl min-h-[400px]">
           <div className="overflow-x-auto">
             <table className="w-full text-right">
               <thead>
                 <tr className="border-b border-[#00D9FF]/20 bg-[#00D9FF]/5 text-xs uppercase tracking-wider text-[#00D9FF]">
                   <th className="p-4 font-bold">שם מלא</th>
                   <th className="p-4 font-bold">סטטוס</th>
                   <th className="p-4 font-bold">ערך משוער</th>
                   <th className="p-4 font-bold">מקור</th>
                   <th className="p-4 font-bold">תאריך יצירה</th>
                   <th className="p-4 font-bold text-left">פעולות</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {loading ? (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-gray-500">טוען נתוני לידים...</td>
                   </tr>
                 ) : error ? (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-red-400">{error}</td>
                   </tr>
                 ) : filteredLeads.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-gray-500">
                       לא נמצאו לידים תואמים לחיפוש
                     </td>
                   </tr>
                 ) : (
                   filteredLeads.map((lead, i) => (
                     <motion.tr
                       key={lead.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="group hover:bg-white/5 transition-colors"
                     >
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center text-xs font-bold text-white shrink-0">
                             {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                           </div>
                           <div>
                             <p className="font-bold text-white text-sm">{lead.name}</p>
                             <p className="text-xs text-gray-500">{lead.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(lead.status)}`}>
                           {getStatusLabel(lead.status)}
                         </span>
                       </td>
                       <td className="p-4 text-white font-mono">₪{Number(lead.value).toLocaleString()}</td>
                       <td className="p-4 text-gray-400 text-sm">{lead.source}</td>
                       <td className="p-4 text-gray-400 text-sm font-mono">{lead.date}</td>
                       <td className="p-4 text-left">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/leads/${lead.id}`)} className="h-8 w-8 p-0 text-[#00D9FF] hover:bg-[#00D9FF]/10" title="צפה בפרטים">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openEditModal(lead)} className="h-8 w-8 p-0 text-[#FFA500] hover:bg-[#FFA500]/10" title="ערוך">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDeleteModal(lead)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10" title="מחק">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                       </td>
                     </motion.tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
         <DialogContent className="bg-[#050A18] border border-[#00D9FF]/30 text-white sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle className="text-xl font-bold text-[#00D9FF]">הוספת ליד חדש</DialogTitle>
               <DialogDescription className="text-gray-400">הזן את פרטי הליד החדש למערכת</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLead} className="space-y-4 py-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>שם מלא *</Label>
                     <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" />
                  </div>
                  <div className="space-y-2">
                     <Label>טלפון</Label>
                     <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" dir="ltr" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>אימייל</Label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" dir="ltr" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>ערך משוער (₪)</Label>
                     <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" />
                  </div>
                  <div className="space-y-2">
                     <Label>מקור הגעה</Label>
                     <input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" placeholder="לדוגמה: פייסבוק" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>סטטוס</Label>
                     <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]">
                        <option value="new">חדש</option>
                        <option value="contacted">נוצר קשר</option>
                        <option value="in_process">בתהליך</option>
                        <option value="closed">סגור/זכייה</option>
                        <option value="lost">הפסד</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label>תאריך יצירה</Label>
                     <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D9FF]" />
                  </div>
               </div>
               <DialogFooter className="mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-gray-400">ביטול</Button>
                  <Button type="submit" className="bg-[#00D9FF] text-[#050A18] hover:bg-[#00B4D8] font-bold">שמור ליד</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>

      {/* Edit Lead Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="bg-[#050A18] border border-[#FFA500]/30 text-white sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle className="text-xl font-bold text-[#FFA500]">עריכת ליד</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditLead} className="space-y-4 py-4">
               {/* Same fields as Add Modal */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>שם מלא *</Label>
                     <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FFA500]" />
                  </div>
                  <div className="space-y-2">
                     <Label>טלפון</Label>
                     <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FFA500]" dir="ltr" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>אימייל</Label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FFA500]" dir="ltr" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>ערך משוער (₪)</Label>
                     <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FFA500]" />
                  </div>
                  <div className="space-y-2">
                     <Label>מקור הגעה</Label>
                     <input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FFA500]" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>סטטוס</Label>
                     <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FFA500]">
                        <option value="new">חדש</option>
                        <option value="contacted">נוצר קשר</option>
                        <option value="in_process">בתהליך</option>
                        <option value="closed">סגור/זכייה</option>
                        <option value="lost">הפסד</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label>תאריך יצירה</Label>
                     <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#FFA500]" />
                  </div>
               </div>
               <DialogFooter className="mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-gray-400">ביטול</Button>
                  <Button type="submit" className="bg-[#FFA500] text-[#050A18] hover:bg-[#FFB700] font-bold">עדכן פרטים</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
         <DialogContent className="bg-[#050A18] border border-red-500/30 text-white sm:max-w-[400px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  מחיקת ליד
               </DialogTitle>
               <DialogDescription className="text-gray-400">
                  האם אתה בטוח שברצונך למחוק את הליד <strong>{selectedLead?.name}</strong>? פעולה זו אינה הפיכה.
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-start mt-4">
               <Button variant="destructive" onClick={handleDeleteLead} className="w-full sm:w-auto">מחק לצמיתות</Button>
               <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-white/10 hover:bg-white/5 text-gray-300 w-full sm:w-auto">ביטול</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadsTable;