import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, MessageSquare, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getFaqTemplates, updateCachedFaqTemplates } from '@/lib/api';

const FAQTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'כללי' });
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const remoteTemplates = await getFaqTemplates();
      const normalized = remoteTemplates.map((t, idx) => ({
        id: t.id || `faq_${Date.now()}_${idx}`,
        title: t.title || t.question || 'ללא כותרת',
        content: t.content || t.answer || '',
        category: t.category || 'כללי',
        created_at: t.created_at || new Date().toISOString(),
      }));
      setTemplates(normalized);
    } catch (err) {
      console.error('Failed to load FAQ templates', err);
      setError('טעינת התבניות מהשרת נכשלה');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplates = (newTemplates) => {
    updateCachedFaqTemplates(newTemplates);
    setTemplates(newTemplates);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      const updated = templates.map(t => t.id === editingTemplate.id ? { ...t, ...formData } : t);
      saveTemplates(updated);
      toast({ title: 'תבנית עודכנה בהצלחה', className: "bg-[#050A18] border-[#9D4EDD] text-white" });
    } else {
      const newTemplate = { id: Date.now().toString(), ...formData, created_at: new Date().toISOString() };
      saveTemplates([...templates, newTemplate]);
      toast({ title: 'תבנית נוצרה בהצלחה', className: "bg-[#050A18] border-[#9D4EDD] text-white" });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    saveTemplates(templates.filter(t => t.id !== id));
    toast({ title: 'תבנית נמחקה', className: "bg-[#050A18] border-red-500 text-white" });
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'הועתק ללוח', className: "bg-[#050A18] border-[#00D9FF] text-white" });
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({ title: '', content: '', category: 'כללי' });
  };

  const openEdit = (t) => {
    setEditingTemplate(t);
    setFormData({ title: t.title, content: t.content, category: t.category });
    setIsDialogOpen(true);
  };

  const categories = [...new Set(templates.map(t => t.category))].sort();

  return (
    <>
      <Helmet>
        <title>תבניות שו"ת - Empire Leads Hub</title>
      </Helmet>

      <div className="relative min-h-full font-rubik text-right" dir="rtl">
        <div className="flex justify-between items-center mb-8">
           <div>
             <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#9D4EDD] to-[#00D9FF] mb-2 drop-shadow-[0_0_10px_rgba(157,78,221,0.4)]">
               מאגר תשובות
             </h1>
             <p className="text-gray-400 font-medium">ניהול תבניות למענה מהיר</p>
           </div>

           <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-[#9D4EDD] hover:bg-[#9D4EDD]/80 text-white shadow-[0_0_15px_rgba(157,78,221,0.4)] border border-[#9D4EDD]/50">
                  <Plus className="w-4 h-4 ml-2" />
                  תבנית חדשה
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#050A18]/95 backdrop-blur-xl border border-[#9D4EDD]/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#9D4EDD]">{editingTemplate ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">כותרת התבנית</Label>
                    <input className="flex h-10 w-full rounded-md border border-[#9D4EDD]/30 bg-[#0A0E27] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[#9D4EDD]"
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">קטגוריה</Label>
                    <input className="flex h-10 w-full rounded-md border border-[#9D4EDD]/30 bg-[#0A0E27] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[#9D4EDD]"
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="למשל: כללי, מכירות..." required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">תוכן התשובה</Label>
                    <textarea className="flex min-h-[120px] w-full rounded-md border border-[#9D4EDD]/30 bg-[#0A0E27] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[#9D4EDD]"
                      value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
                  </div>
                  <Button type="submit" className="w-full bg-[#9D4EDD] hover:bg-[#9D4EDD]/80 mt-4 font-bold">שמור תבנית</Button>
                </form>
              </DialogContent>
           </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
             <p className="text-center text-gray-400 col-span-full">טוען תבניות...</p>
           ) : error ? (
             <p className="text-center text-red-400 col-span-full">{error}</p>
           ) : categories.length === 0 ? (
             <p className="text-center text-gray-500 col-span-full">לא קיימות תבניות להצגה</p>
           ) : categories.map(category => (
             <React.Fragment key={category}>
               <div className="col-span-full flex items-center gap-2 mt-4 mb-2">
                 <Sparkles className="w-4 h-4 text-[#00D9FF]" />
                 <h2 className="text-xl font-bold text-white">{category}</h2>
                 <div className="h-px bg-gradient-to-l from-transparent via-[#00D9FF]/30 to-transparent flex-1 ml-4"></div>
               </div>
               
               {templates.filter(t => t.category === category).map((template, idx) => (
                 <motion.div
                   key={template.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.1 }}
                   className="group relative bg-[#050A18]/60 backdrop-blur-md border border-[#9D4EDD]/20 rounded-xl p-5 shadow-lg hover:border-[#9D4EDD] hover:shadow-[0_0_20px_rgba(157,78,221,0.2)] transition-all flex flex-col"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-2 bg-[#9D4EDD]/10 rounded-lg border border-[#9D4EDD]/20">
                          <MessageSquare className="w-5 h-5 text-[#9D4EDD]" />
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(template)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(template.id)} className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>

                    <h3 className="font-bold text-lg text-white mb-2">{template.title}</h3>
                    <div className="bg-[#0A0E27] p-3 rounded-lg border border-white/5 text-sm text-gray-300 font-mono mb-4 flex-1 overflow-hidden relative group/code">
                       {template.content}
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => handleCopy(template.content)}
                      className="w-full border-[#9D4EDD]/30 text-[#9D4EDD] hover:bg-[#9D4EDD]/10 hover:text-white"
                    >
                      <Copy className="w-4 h-4 ml-2" />
                      העתק תוכן
                    </Button>
                 </motion.div>
               ))}
             </React.Fragment>
           ))}
        </div>
      </div>
    </>
  );
};

export default FAQTemplates;