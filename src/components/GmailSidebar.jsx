import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  Star, 
  Inbox as InboxIcon, 
  LogOut,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const GmailSidebar = ({ onSelectEmail, selectedEmailId, emails, setEmails }) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Connection Modal State
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Load connected accounts
    const storedAccounts = JSON.parse(localStorage.getItem('gmail_accounts') || '[]');
    setAccounts(storedAccounts);
    
    if (storedAccounts.length > 0 && emails.length === 0) {
      fetchEmails(storedAccounts);
    }
  }, []);

  const fetchEmails = (currentAccounts) => {
    setLoading(true);
    // Simulate API fetch with "premium" delay
    setTimeout(() => {
      const mockEmails = [
        { 
          id: 'e1', 
          accountId: currentAccounts[0]?.id, 
          sender: 'Google Workspace', 
          subject: 'ברוכים הבאים ל-Workspace החדש', 
          preview: 'התחל לעבוד עם הכלים החדשים שלך וגלה עולם של אפשרויות...', 
          date: '10:30', 
          unread: true,
          starred: true,
          content: '<h1>ברוכים הבאים!</h1><p>שמחים שהצטרפתם אלינו. כאן תוכלו לנהל את המיילים שלכם בצורה חכמה.</p>',
          avatarColor: 'from-blue-500 to-cyan-500'
        },
        { 
          id: 'e2', 
          accountId: currentAccounts[0]?.id, 
          sender: 'חשבונית ירוקה', 
          subject: 'קבלה על תשלום מנוי Pro', 
          preview: 'היי, מצורפת קבלה עבור חודש דצמבר. תודה שבחרת בנו...', 
          date: 'אתמול', 
          unread: false,
          starred: false,
          content: '<p>היי,</p><p>תודה על התשלום. הקבלה שלך מצורפת למייל זה.</p>',
          avatarColor: 'from-green-500 to-emerald-500'
        },
        { 
          id: 'e3', 
          accountId: currentAccounts[0]?.id, 
          sender: 'ישראל ישראלי', 
          subject: 'הצעת מחיר: פרויקט סייבר', 
          preview: 'היי, בהמשך לשיחתנו אני שולח את הפירוט המלא עבור...', 
          date: '10/12', 
          unread: true,
          starred: false,
          content: '<p>שלום רב,</p><p>אני שמח לשלוח את הצעת המחיר המעודכנת. אנא עיין בקובץ המצורף.</p>',
          avatarColor: 'from-purple-500 to-pink-500'
        },
      ];
      setEmails(mockEmails);
      setLoading(false);
    }, 2000);
  };

  const handleConnect = (e) => {
    e.preventDefault();
    setIsConnecting(true);

    setTimeout(() => {
      const newAccount = {
        id: Date.now().toString(),
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        name: 'משתמש דמו',
        avatar: 'U',
        token: 'mock_token_' + Date.now()
      };
      
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      localStorage.setItem('gmail_accounts', JSON.stringify(updatedAccounts));
      
      setIsConnecting(false);
      setIsConnectOpen(false);
      setClientId('');
      fetchEmails(updatedAccounts);
      
      toast({ 
        title: '✨ חשבון Gmail חובר בהצלחה', 
        description: `המערכת מסונכרנת כעת עם ${newAccount.email}`,
        className: "bg-[#050A18] border-[#00D9FF] text-white shadow-[0_0_20px_rgba(0,217,255,0.3)]" 
      });
    }, 2000);
  };

  const handleDisconnect = (accountId) => {
    const updatedAccounts = accounts.filter(a => a.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('gmail_accounts', JSON.stringify(updatedAccounts));
    toast({ title: 'חשבון הוסר', className: "bg-[#050A18] border-red-500 text-white" });
  };

  const filteredEmails = emails.filter(email => 
    email.subject.includes(searchTerm) || 
    email.sender.includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF006E]/5 via-transparent to-[#00D9FF]/5 pointer-events-none" />

      {/* Header Section */}
      <div className="p-5 border-b border-[#FF006E]/20 relative z-10 backdrop-blur-md bg-[#050A18]/60">
        <div className="flex justify-between items-center mb-6">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF006E] blur-md opacity-40 animate-pulse" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF006E] to-[#9D4EDD] flex items-center justify-center relative z-10 shadow-lg border border-white/10">
                <Mail className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-400 tracking-wide">
                GMAIL
              </h2>
              <p className="text-[10px] text-[#FF006E] font-medium tracking-widest uppercase">INTEGRATION</p>
            </div>
          </motion.div>

          <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
            <DialogTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 0, 110, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-full bg-[#FF006E]/10 border border-[#FF006E]/50 text-[#FF006E] flex items-center justify-center transition-all hover:bg-[#FF006E] hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-[#050A18]/95 backdrop-blur-xl border border-[#FF006E]/30 text-white max-w-md shadow-[0_0_50px_rgba(255,0,110,0.15)]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center mb-2 flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-[#FF006E]/10 flex items-center justify-center border border-[#FF006E]/30 shadow-[0_0_20px_rgba(255,0,110,0.2)]">
                      <Mail className="w-8 h-8 text-[#FF006E]" />
                   </div>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF006E] to-[#FFA500]">
                     חיבור חשבון Google
                   </span>
                </DialogTitle>
                <DialogDescription className="text-center text-gray-400 text-sm">
                  התחברות מאובטחת באמצעות פרוטוקול OAuth 2.0
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4 text-right" dir="rtl">
                <div className="bg-[#0A0E27]/80 p-4 rounded-xl border border-[#FF006E]/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF006E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-start gap-3 relative z-10">
                    <AlertCircle className="w-5 h-5 text-[#FF006E] shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-300 space-y-2">
                      <p className="font-bold text-[#FF006E]">הוראות הגדרה מהירה:</p>
                      <ul className="list-disc pr-4 space-y-1 text-gray-400">
                        <li>פתח את Google Cloud Console</li>
                        <li>הפעל את ה-Gmail API בפרויקט שלך</li>
                        <li>צור מזהה לקוח (Client ID) חדש</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#FF006E] text-xs font-bold uppercase tracking-wider">Client ID</Label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF006E] to-[#9D4EDD] rounded-lg opacity-30 group-hover:opacity-70 transition duration-300 blur"></div>
                    <input 
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="הדבק כאן את המזהה..."
                      className="relative w-full bg-[#050A18] border border-[#FF006E]/30 rounded-md p-3 text-white outline-none focus:text-[#FF006E] placeholder:text-gray-700 transition-all font-mono text-xs"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="w-full h-12 bg-gradient-to-r from-[#EA4335] to-[#FF006E] hover:from-[#C5221F] hover:to-[#D9005C] text-white font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(234,67,53,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isConnecting ? (
                    <motion.div className="flex items-center gap-2">
                       <Loader2 className="w-5 h-5 animate-spin" /> 
                       <span>מבצע חיבור מאובטח...</span>
                    </motion.div>
                  ) : (
                    "התחבר עכשיו"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Connected Accounts & Search */}
        <div className="space-y-4">
          {/* Accounts Strip */}
          <AnimatePresence>
            {accounts.length > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar mask-gradient"
              >
                {accounts.map((acc, i) => (
                  <motion.div 
                    key={acc.id} 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative shrink-0 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FF006E] to-[#9D4EDD] rounded-full blur opacity-40 group-hover:opacity-80 transition-opacity" />
                    <div className="w-10 h-10 rounded-full bg-[#050A18] border border-[#FF006E]/30 relative z-10 flex items-center justify-center text-xs font-bold text-white group-hover:border-[#FF006E] transition-colors">
                      {acc.avatar}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDisconnect(acc.id); }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                <motion.button 
                   whileHover={{ scale: 1.1 }}
                   onClick={() => setIsConnectOpen(true)}
                   className="w-10 h-10 rounded-full bg-[#050A18] border border-dashed border-gray-600 flex items-center justify-center text-gray-500 hover:text-[#FF006E] hover:border-[#FF006E] transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF006E] to-[#00D9FF] rounded-xl opacity-20 group-hover:opacity-60 transition duration-500 blur-sm"></div>
            <div className="relative flex items-center bg-[#050A18] rounded-xl border border-white/10 group-hover:border-white/20 transition-all">
              <Search className="w-4 h-4 text-gray-500 absolute right-4 group-hover:text-[#FF006E] transition-colors" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש מהיר..." 
                className="w-full bg-transparent border-none py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 relative z-0">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-40 gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 border-4 border-[#FF006E]/20 border-t-[#FF006E] rounded-full w-12 h-12 animate-spin" />
                <div className="absolute inset-2 border-4 border-[#00D9FF]/20 border-b-[#00D9FF] rounded-full w-8 h-8 animate-spin-reverse" />
              </div>
              <span className="text-xs text-[#FF006E] font-medium tracking-widest animate-pulse">מסנכרן הודעות...</span>
            </motion.div>
          ) : accounts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center p-6"
            >
               <div className="relative mb-6">
                 <div className="absolute inset-0 bg-[#FF006E] blur-[50px] opacity-20" />
                 <Mail className="w-20 h-20 text-[#FF006E]/40" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">המערכת ממתינה לחיבור</h3>
               <p className="text-gray-500 text-sm max-w-[250px] leading-relaxed">
                 חבר את חשבון ה-Gmail שלך כדי להתחיל לקבל ולנהל הודעות ישירות מכאן
               </p>
               <Button onClick={() => setIsConnectOpen(true)} variant="outline" className="mt-6 border-[#FF006E]/50 text-[#FF006E] hover:bg-[#FF006E]/10">
                 התחל חיבור
               </Button>
            </motion.div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs">לא נמצאו תוצאות לחיפוש</div>
          ) : (
            filteredEmails.map((email, index) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, translateX: -5 }}
                onClick={() => onSelectEmail(email)}
                className={cn(
                  "p-4 rounded-2xl cursor-pointer border transition-all relative group overflow-hidden",
                  selectedEmailId === email.id 
                    ? "bg-[#FF006E]/10 border-[#FF006E] shadow-[0_0_25px_rgba(255,0,110,0.15)]" 
                    : "bg-[#0A0E27]/40 border-white/5 hover:border-[#FF006E]/40 hover:bg-[#0A0E27]/60"
                )}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF006E]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg bg-gradient-to-br shrink-0", email.avatarColor || 'from-gray-500 to-gray-700')}>
                         {email.sender[0]}
                       </div>
                       <span className={cn("text-xs font-bold truncate transition-colors", email.unread ? "text-white" : "text-gray-400 group-hover:text-gray-300")}>
                         {email.sender}
                       </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{email.date}</span>
                  </div>
                  
                  <h4 className={cn("text-sm mb-1.5 truncate pr-11 transition-all", email.unread ? "text-[#FF006E] font-bold" : "text-gray-300 group-hover:text-white")}>
                    {email.subject}
                  </h4>
                  
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed pl-4 group-hover:text-gray-400 transition-colors">
                    {email.preview}
                  </p>
                </div>
                
                {email.starred && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute bottom-4 left-4"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                  </motion.div>
                )}
                
                {email.unread && (
                  <motion.div 
                    layoutId={`unread-${email.id}`}
                    className="absolute top-4 left-4"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF006E] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF006E]"></span>
                    </span>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Status */}
      {accounts.length > 0 && (
         <div className="py-3 border-t border-[#FF006E]/10 bg-[#050A18]/80 backdrop-blur flex justify-between items-center text-[10px] text-gray-500 px-5 relative z-10">
           <span className="flex items-center gap-1.5">
             <CheckCircle2 className="w-3 h-3 text-green-500" />
             מערכת מסונכרנת
           </span>
           <button onClick={() => fetchEmails(accounts)} className="flex items-center gap-1 hover:text-[#FF006E] transition-colors group">
             <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" />
             <span>רענן</span>
           </button>
         </div>
      )}
    </div>
  );
};

export default GmailSidebar;