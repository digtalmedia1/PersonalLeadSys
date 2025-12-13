import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, TrendingDown, CreditCard, 
  PiggyBank, DollarSign, Calendar, AlertCircle, 
  Plus, Trash2, PieChart, Activity, Check,
  ArrowDownLeft, ArrowUpRight, Receipt, Landmark,
  Edit2, X, ChevronDown, ChevronUp, AlertTriangle, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
// Removed unused Tabs import that was causing the error since we use custom tab logic in this file
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- INITIAL DATA (Seed if empty) ---
const INITIAL_DATA = {
  transactions: [
    { id: 't1', type: 'expense', amount: 4500, category: 'שכירות', date: '2024-12-01', description: 'שכירות משרד חודשית', accountId: 'a1' },
    { id: 't2', type: 'expense', amount: 350, category: 'חשמל', date: '2024-12-05', description: 'חשבון חשמל', accountId: 'a1' },
    { id: 't3', type: 'income', amount: 12000, category: 'מכירות', date: '2024-12-10', description: 'פרויקט גמא', accountId: 'a1' },
  ],
  accounts: [
    { id: 'a1', name: 'עובר ושב ראשי', type: 'bank', bankName: 'בנק הפועלים', balance: 45200, color: '#00D9FF', accountNumber: '123456789', lastDigits: '6789' },
    { id: 'a2', name: 'חיסכון עסקי', type: 'bank', bankName: 'לאומי', balance: 120000, color: '#9D4EDD', accountNumber: '987654321', lastDigits: '4321' },
    { id: 'c1', name: 'ויזה כאל', type: 'credit', limit: 30000, balance: 4500, dueDate: '10', color: '#FF006E', cardNumber: '4580123456781122', lastDigits: '1122', interestRate: 1.5 }
  ],
  budgets: [
    { id: 'b1', category: 'שיווק', limit: 5000, spent: 2300, period: 'monthly' },
    { id: 'b2', category: 'ציוד משרדי', limit: 1000, spent: 850, period: 'monthly' },
    { id: 'b3', category: 'אירוח', limit: 2000, spent: 150, period: 'monthly' }
  ],
  loans: [
    { id: 'l1', name: 'הלוואה בערבות מדינה', principal: 100000, remaining: 85000, interestRate: 4.5, monthlyPayment: 2100, nextDueDate: '2025-01-15' }
  ]
};

const Finance = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [data, setData] = useState(INITIAL_DATA);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'transaction', 'budget', 'account-bank', 'account-credit', 'loan'
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Confirmation Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id }

  // Expanded Sections
  const [expandedAccount, setExpandedAccount] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('empire_finance');
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (e) {
        console.error("Error loading data", e);
        setData(INITIAL_DATA);
      }
    } else {
      localStorage.setItem('empire_finance', JSON.stringify(INITIAL_DATA));
    }
  }, []);

  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem('empire_finance', JSON.stringify(newData));
  };

  // --- Helpers ---
  const validateForm = () => {
    const newErrors = {};
    if (['transaction', 'budget', 'loan', 'account-bank', 'account-credit'].includes(modalType)) {
      if (!formData.name && modalType.includes('account')) newErrors.name = 'שדה חובה';
      if (!formData.category && (modalType === 'transaction' || modalType === 'budget')) newErrors.category = 'שדה חובה';
      if (!formData.amount && modalType === 'transaction') newErrors.amount = 'שדה חובה';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAccountName = (id) => {
    const account = data.accounts.find(a => a.id === id);
    return account ? account.name : 'חשבון לא ידוע';
  };

  // --- CRUD Operations ---

  const handleOpenModal = (type, mode = 'create', item = null) => {
    setModalType(type);
    setModalMode(mode);
    setEditingItem(item);
    setErrors({});
    
    if (mode === 'edit' && item) {
      setFormData({ ...item });
    } else {
      // Set defaults for new items
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        accountId: data.accounts[0]?.id || '',
        color: '#00D9FF'
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (type, id) => {
    setItemToDelete({ type, id });
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    const { type, id } = itemToDelete;
    const newData = { ...data };

    if (type === 'transaction') newData.transactions = newData.transactions.filter(t => t.id !== id);
    if (type === 'budget') newData.budgets = newData.budgets.filter(b => b.id !== id);
    if (type === 'account') newData.accounts = newData.accounts.filter(a => a.id !== id);
    if (type === 'loan') newData.loans = newData.loans.filter(l => l.id !== id);

    saveData(newData);
    setConfirmOpen(false);
    setItemToDelete(null);
    toast({ title: "נמחק בהצלחה", variant: "default" });
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({ title: "שגיאה בטופס", description: "אנא מלא את כל שדות החובה", variant: "destructive" });
      return;
    }

    const newData = { ...data };
    const id = modalMode === 'create' ? Date.now().toString() : editingItem.id;

    // Helper to process account data
    const processAccount = (type) => ({
      id,
      name: formData.name,
      type: type, // 'bank' or 'credit'
      bankName: formData.bankName || '',
      balance: Number(formData.balance || 0),
      limit: Number(formData.limit || 0),
      color: formData.color || '#00D9FF',
      accountNumber: formData.accountNumber || '',
      cardNumber: formData.cardNumber || '',
      lastDigits: (formData.accountNumber || formData.cardNumber || '0000').slice(-4),
      dueDate: formData.dueDate || '',
      interestRate: Number(formData.interestRate || 0)
    });

    if (modalType === 'account-bank') {
      const accountData = processAccount('bank');
      if (modalMode === 'create') newData.accounts.push(accountData);
      else newData.accounts = newData.accounts.map(a => a.id === id ? accountData : a);
    } 
    else if (modalType === 'account-credit') {
       const accountData = processAccount('credit');
       if (modalMode === 'create') newData.accounts.push(accountData);
       else newData.accounts = newData.accounts.map(a => a.id === id ? accountData : a);
    }
    else if (modalType === 'transaction') {
      const transactionData = {
        id,
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description || '',
        accountId: formData.accountId
      };

      if (modalMode === 'create') {
        newData.transactions.unshift(transactionData);
        // Update balance logic (simplified)
        const accIdx = newData.accounts.findIndex(a => a.id === transactionData.accountId);
        if (accIdx > -1) {
          if (transactionData.type === 'income') newData.accounts[accIdx].balance += transactionData.amount;
          else newData.accounts[accIdx].balance -= transactionData.amount;
        }
      } else {
        // Handle edit balance update (revert old, apply new) - simplified for now just updates record
        newData.transactions = newData.transactions.map(t => t.id === id ? transactionData : t);
      }
    }
    else if (modalType === 'budget') {
      const budgetData = {
        id,
        category: formData.category,
        limit: Number(formData.limit),
        spent: Number(formData.spent || 0),
        period: formData.period || 'monthly'
      };
      if (modalMode === 'create') newData.budgets.push(budgetData);
      else newData.budgets = newData.budgets.map(b => b.id === id ? budgetData : b);
    }
    else if (modalType === 'loan') {
      const loanData = {
        id,
        name: formData.name,
        principal: Number(formData.principal),
        remaining: Number(formData.remaining),
        interestRate: Number(formData.interestRate),
        monthlyPayment: Number(formData.monthlyPayment),
        nextDueDate: formData.nextDueDate
      };
      if (modalMode === 'create') newData.loans.push(loanData);
      else newData.loans = newData.loans.map(l => l.id === id ? loanData : l);
    }

    saveData(newData);
    setIsModalOpen(false);
    toast({ title: modalMode === 'create' ? "נוצר בהצלחה" : "עודכן בהצלחה", description: "הנתונים נשמרו במערכת" });
  };

  // --- Sub-Components ---

  const DashboardTab = () => {
    const totalIncome = data.transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = data.transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netBalance = data.accounts.reduce((acc, curr) => curr.type === 'bank' ? acc + curr.balance : acc - curr.balance, 0);
    
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[#0A0E27]/60 border border-green-500/20 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp className="w-16 h-16 text-green-500" /></div>
              <h3 className="text-gray-400 text-sm font-bold">הכנסות החודש</h3>
              <p className="text-3xl font-black text-green-400 mt-2">₪{totalIncome.toLocaleString()}</p>
           </div>
           <div className="bg-[#0A0E27]/60 border border-red-500/20 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingDown className="w-16 h-16 text-red-500" /></div>
              <h3 className="text-gray-400 text-sm font-bold">הוצאות החודש</h3>
              <p className="text-3xl font-black text-red-400 mt-2">₪{totalExpenses.toLocaleString()}</p>
           </div>
           <div className="bg-[#0A0E27]/60 border border-[#00D9FF]/20 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet className="w-16 h-16 text-[#00D9FF]" /></div>
              <h3 className="text-gray-400 text-sm font-bold">שווי נקי כולל</h3>
              <p className={`text-3xl font-black mt-2 ${netBalance >= 0 ? 'text-[#00D9FF]' : 'text-orange-500'}`}>₪{netBalance.toLocaleString()}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Budget Overview */}
           <div className="bg-[#0A0E27]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#FF006E]" />
                    ניצול תקציב
                 </h3>
                 <Button variant="ghost" size="sm" onClick={() => setActiveTab('budgets')} className="text-xs text-[#00D9FF]">ניהול תקציב</Button>
              </div>
              <div className="space-y-6">
                 {data.budgets.slice(0, 4).map(b => {
                    const percent = b.limit > 0 ? Math.min(100, (b.spent / b.limit) * 100) : 0;
                    return (
                       <div key={b.id}>
                          <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-300 font-bold">{b.category}</span>
                             <span className="text-gray-500">{Math.round(percent)}%</span>
                          </div>
                          <div className="h-2 w-full bg-[#050A18] rounded-full overflow-hidden border border-white/5">
                             <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                   width: `${percent}%`, 
                                   backgroundColor: percent > 90 ? '#FF006E' : percent > 70 ? '#FFA500' : '#00D9FF' 
                                }}
                             ></div>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-[#0A0E27]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-center gap-4">
              <h3 className="text-lg font-bold text-white mb-2">פעולות מהירות</h3>
              <div className="grid grid-cols-2 gap-4">
                 <Button onClick={() => handleOpenModal('transaction', 'create', { type: 'income' })} className="h-20 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 flex flex-col gap-2">
                    <ArrowDownLeft className="w-6 h-6" />
                    הכנסה חדשה
                 </Button>
                 <Button onClick={() => handleOpenModal('transaction', 'create', { type: 'expense' })} className="h-20 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex flex-col gap-2">
                    <ArrowUpRight className="w-6 h-6" />
                    הוצאה חדשה
                 </Button>
                 <Button onClick={() => handleOpenModal('account-bank')} className="h-20 bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 border border-[#00D9FF]/30 text-[#00D9FF] flex flex-col gap-2">
                    <Landmark className="w-6 h-6" />
                    חשבון בנק
                 </Button>
                 <Button onClick={() => handleOpenModal('account-credit')} className="h-20 bg-[#9D4EDD]/10 hover:bg-[#9D4EDD]/20 border border-[#9D4EDD]/30 text-[#9D4EDD] flex flex-col gap-2">
                    <CreditCard className="w-6 h-6" />
                    כרטיס אשראי
                 </Button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const AccountsTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       <div className="flex gap-4">
         <Button onClick={() => handleOpenModal('account-bank')} className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
            <Plus className="w-4 h-4 ml-2" />
            הוסף חשבון בנק
         </Button>
         <Button onClick={() => handleOpenModal('account-credit')} className="bg-[#FF006E] text-white font-bold hover:bg-[#D9005F]">
            <Plus className="w-4 h-4 ml-2" />
            הוסף כרטיס אשראי
         </Button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.accounts.map(acc => {
             const isExpanded = expandedAccount === acc.id;
             const accTransactions = data.transactions.filter(t => t.accountId === acc.id).slice(0, 5); // Show last 5

             return (
               <div 
                  key={acc.id} 
                  className={cn(
                    "rounded-2xl relative overflow-hidden shadow-xl transition-all duration-300 border border-white/5",
                    isExpanded ? "md:col-span-2 lg:col-span-2 row-span-2" : "hover:-translate-y-1"
                  )}
                  style={{ 
                    background: `linear-gradient(135deg, ${acc.color}15 0%, #050A18 100%)`, 
                    borderColor: `${acc.color}30` 
                  }}
               >
                  <div className="p-6 relative z-10">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                             {acc.type === 'bank' ? <Landmark className="w-6 h-6 text-white" /> : <CreditCard className="w-6 h-6 text-white" />}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-white/50 tracking-wider uppercase">{acc.bankName || 'כרטיס אשראי'}</p>
                              <h3 className="text-xl font-black text-white">{acc.name}</h3>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleOpenModal(acc.type === 'bank' ? 'account-bank' : 'account-credit', 'edit', acc)} className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                              <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest('account', acc.id)} className="h-8 w-8 text-white/50 hover:text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </div>

                     <div className="mb-6">
                        <p className="text-xs text-white/40 font-mono tracking-widest mb-1">**** **** **** {acc.lastDigits}</p>
                        <p className="text-3xl font-bold text-white tracking-tight">₪{acc.balance.toLocaleString()}</p>
                        {acc.type === 'credit' && (
                           <div className="mt-2 flex items-center justify-between text-xs">
                              <span className="text-white/40">מסגרת: ₪{acc.limit.toLocaleString()}</span>
                              <span className="text-[#FF006E]">נותר: ₪{(acc.limit - acc.balance).toLocaleString()}</span>
                           </div>
                        )}
                     </div>

                     <div className="flex justify-between items-center border-t border-white/5 pt-4">
                        <span className="text-xs text-white/40">
                           {acc.type === 'credit' ? `תאריך חיוב: ${acc.dueDate || '10'} לחודש` : 'עובר ושב'}
                        </span>
                        <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setExpandedAccount(isExpanded ? null : acc.id)}
                           className="text-xs text-[#00D9FF] hover:bg-[#00D9FF]/10 gap-1 h-8"
                        >
                           {isExpanded ? 'סגור פירוט' : 'צפה בתנועות'}
                           {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                     </div>
                  </div>

                  {/* Expanded Transaction History */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#0A0E27]/50 border-t border-white/5"
                      >
                         <div className="p-4 space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 mb-3 px-2">תנועות אחרונות בחשבון זה</h4>
                            {accTransactions.length === 0 ? (
                               <div className="text-center py-4 text-gray-500 text-xs">אין תנועות להצגה</div>
                            ) : (
                               accTransactions.map(t => (
                                  <div key={t.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                     <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs", t.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500')}>
                                           {t.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                           <p className="text-sm font-bold text-white">{t.description}</p>
                                           <p className="text-[10px] text-gray-500">{t.date} • {t.category}</p>
                                        </div>
                                     </div>
                                     <span className={cn("font-bold text-sm", t.type === 'income' ? 'text-green-400' : 'text-white')}>
                                        {t.type === 'income' ? '+' : '-'}₪{t.amount.toLocaleString()}
                                     </span>
                                  </div>
                               ))
                            )}
                            <div className="pt-2 text-center">
                               <Button variant="link" size="sm" onClick={() => setActiveTab('expenses')} className="text-xs text-gray-400">לכל התנועות</Button>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             )
          })}
       </div>
    </div>
  );

  const ExpensesTab = () => (
     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-[#0A0E27]/60 p-4 rounded-xl border border-white/5">
           <h3 className="font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#9D4EDD]" />
              יומן תנועות
           </h3>
           <Button onClick={() => handleOpenModal('transaction')} className="bg-[#00D9FF] text-[#050A18] hover:bg-[#00B4D8] font-bold shadow-lg shadow-[#00D9FF]/20">
              <Plus className="w-4 h-4 ml-2" />
              הוסף תנועה
           </Button>
        </div>

        <div className="bg-[#0A0E27]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[600px]">
                <thead className="bg-[#050A18] text-xs uppercase text-gray-500 font-bold border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">סוג</th>
                      <th className="px-6 py-4">תיאור</th>
                      <th className="px-6 py-4">חשבון</th>
                      <th className="px-6 py-4">קטגוריה</th>
                      <th className="px-6 py-4">תאריך</th>
                      <th className="px-6 py-4">סכום</th>
                      <th className="px-6 py-4">פעולות</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.transactions.map(t => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${t.type === 'income' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {t.type === 'income' ? 'הכנסה' : 'הוצאה'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{t.description}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{getAccountName(t.accountId)}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{t.category}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm font-mono">{t.date}</td>
                          <td className={`px-6 py-4 font-bold ${t.type === 'income' ? 'text-green-400' : 'text-gray-200'}`}>
                            ₪{t.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => handleOpenModal('transaction', 'edit', t)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDeleteRequest('transaction', t.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                          </td>
                      </tr>
                    ))}
                </tbody>
              </table>
           </div>
        </div>
     </div>
  );

  const BudgetsTab = () => (
     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-[#0A0E27]/60 p-4 rounded-xl border border-white/5">
           <h3 className="font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#FF006E]" />
              תכנון תקציב
           </h3>
           <Button onClick={() => handleOpenModal('budget')} className="bg-[#FF006E] text-white hover:bg-[#D9005F] font-bold shadow-lg shadow-[#FF006E]/20">
              <Plus className="w-4 h-4 ml-2" />
              תקציב חדש
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {data.budgets.map(budget => {
              const percent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
              const isOverBudget = percent > 100;
              
              return (
                 <div key={budget.id} className="bg-[#0A0E27]/60 border border-white/5 p-6 rounded-2xl relative group hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h3 className="text-lg font-bold text-white">{budget.category}</h3>
                          <p className="text-xs text-gray-500 capitalize">{budget.period === 'monthly' ? 'חודשי' : 'שנתי'}</p>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenModal('budget', 'edit', budget)}><Edit2 className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" onClick={() => handleDeleteRequest('budget', budget.id)}><Trash2 className="w-3 h-3" /></Button>
                       </div>
                    </div>
                    
                    <div className="mb-4">
                       <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">נוצל: ₪{budget.spent.toLocaleString()}</span>
                          <span className="text-white font-bold">מתוך: ₪{budget.limit.toLocaleString()}</span>
                       </div>
                       <div className="h-3 w-full bg-[#050A18] rounded-full overflow-hidden border border-white/10">
                          <div 
                             className={cn("h-full rounded-full transition-all duration-500", isOverBudget ? "bg-red-500" : "bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD]")}
                             style={{ width: `${Math.min(100, percent)}%` }}
                          ></div>
                       </div>
                    </div>
                    
                    {isOverBudget && (
                       <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-2 rounded-lg">
                          <AlertTriangle className="w-4 h-4" />
                          חריגה של ₪{(budget.spent - budget.limit).toLocaleString()}
                       </div>
                    )}
                 </div>
              )
           })}
        </div>
     </div>
  );

  const LoansTab = () => (
     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-[#0A0E27]/60 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-[#FF006E]/10 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-[#FF006E]" />
                </div>
                <div>
                    <h3 className="text-[#FF006E] font-bold text-lg">חובות והלוואות</h3>
                    <p className="text-gray-400 text-xs">סה"כ יתרה: ₪{data.loans.reduce((acc, l) => acc + l.remaining, 0).toLocaleString()}</p>
                </div>
            </div>
            <Button onClick={() => handleOpenModal('loan')} className="bg-[#FF006E] text-white hover:bg-[#D9005F] font-bold">
               <Plus className="w-4 h-4 ml-2" />
               הוסף הלוואה
            </Button>
        </div>

        <div className="grid gap-4">
           {data.loans.map(loan => (
              <div key={loan.id} className="bg-[#0A0E27]/60 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6 hover:border-[#FF006E]/30 transition-colors group">
                 <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{loan.name}</h3>
                    <div className="flex gap-4 text-sm text-gray-400 mt-2">
                       <span>ריבית: {loan.interestRate}%</span>
                       <span>תשלום חודשי: ₪{loan.monthlyPayment.toLocaleString()}</span>
                    </div>
                 </div>
                 
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-400">נותר לתשלום</span>
                       <span className="text-white font-bold">₪{loan.remaining.toLocaleString()} / ₪{loan.principal.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-[#050A18] rounded-full overflow-hidden border border-white/10">
                       <div 
                          className="h-full bg-gradient-to-r from-[#FF006E] to-[#9D4EDD]" 
                          style={{ width: `${(loan.remaining / loan.principal) * 100}%` }}
                       ></div>
                    </div>
                    <p className="text-xs text-[#FF006E] text-left">תאריך פירעון קרוב: {loan.nextDueDate}</p>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal('loan', 'edit', loan)} className="text-gray-500 hover:text-white">
                       <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest('loan', loan.id)} className="text-gray-500 hover:text-red-500">
                       <Trash2 className="w-4 h-4" />
                    </Button>
                 </div>
              </div>
           ))}
        </div>
     </div>
  );

  return (
    <>
      <Helmet>
        <title>ניהול פיננסי - Empire Systems</title>
      </Helmet>
      
      <div className="space-y-8 pb-20" dir="rtl">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-3xl font-black text-white mb-2 tracking-tight">ניהול פיננסי</h1>
               <p className="text-gray-400 text-sm">מערכת מעקב ובקרה תקציבית לארגון</p>
            </div>
            <div className="bg-[#050A18] px-4 py-2 rounded-lg border border-[#00D9FF]/20 text-[#00D9FF] font-mono text-sm shadow-[0_0_15px_rgba(0,217,255,0.1)]">
               {new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 custom-scrollbar">
            {[
               { id: 'dashboard', label: 'לוח בקרה', icon: PieChart },
               { id: 'accounts', label: 'חשבונות ובנקים', icon: Landmark },
               { id: 'expenses', label: 'תנועות', icon: Receipt },
               { id: 'budgets', label: 'תקציב', icon: PiggyBank },
               { id: 'loans', label: 'התחייבויות', icon: AlertCircle },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                     "px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap",
                     activeTab === tab.id 
                        ? "bg-[#00D9FF] text-[#050A18] shadow-[0_0_20px_rgba(0,217,255,0.3)] scale-105" 
                        : "bg-[#0A0E27] text-gray-400 border border-white/5 hover:bg-white/5 hover:text-white"
                  )}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="min-h-[500px]">
             {activeTab === 'dashboard' && <DashboardTab />}
             {activeTab === 'accounts' && <AccountsTab />}
             {activeTab === 'expenses' && <ExpensesTab />}
             {activeTab === 'budgets' && <BudgetsTab />}
             {activeTab === 'loans' && <LoansTab />}
         </div>
      </div>

      {/* --- Main Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#050A18] border border-[#00D9FF]/20 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
           <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
                 {modalMode === 'edit' ? <Edit2 className="w-5 h-5 text-[#00D9FF]" /> : <Plus className="w-5 h-5 text-[#00D9FF]" />}
                 {modalMode === 'edit' ? 'עריכת' : 'הוספת'} 
                 {modalType === 'transaction' && ' תנועה'}
                 {modalType === 'account-bank' && ' חשבון בנק'}
                 {modalType === 'account-credit' && ' כרטיס אשראי'}
                 {modalType === 'budget' && ' תקציב'}
                 {modalType === 'loan' && ' הלוואה'}
              </DialogTitle>
           </DialogHeader>

           <div className="space-y-4 py-4 text-right" dir="rtl">
              
              {/* Transaction Form */}
              {modalType === 'transaction' && (
                 <>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>סוג פעולה</Label>
                          <select 
                             className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                             value={formData.type || 'expense'}
                             onChange={(e) => setFormData({...formData, type: e.target.value})}
                          >
                             <option value="expense">הוצאה</option>
                             <option value="income">הכנסה</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label>סכום (₪)</Label>
                          <input 
                             type="number" 
                             className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                             value={formData.amount || ''}
                             onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          />
                          {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label>תיאור</Label>
                       <input 
                          type="text" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.description || ''}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>חשבון מקושר</Label>
                           <select 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.accountId || ''}
                              onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                           >
                              {data.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <Label>קטגוריה</Label>
                           <input 
                              type="text" 
                              list="categories"
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.category || ''}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                           />
                           <datalist id="categories">
                              <option value="כללי" />
                              <option value="שכירות" />
                              <option value="שיווק" />
                              <option value="משכורות" />
                              <option value="ציוד" />
                              <option value="מכירות" />
                           </datalist>
                           {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>תאריך</Label>
                        <input 
                           type="date" 
                           className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                           value={formData.date || ''}
                           onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                 </>
              )}

              {/* Bank Account Form */}
              {modalType === 'account-bank' && (
                 <>
                    <div className="space-y-2">
                       <Label>שם החשבון (כינוי)</Label>
                       <input 
                          type="text" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="עובר ושב ראשי"
                       />
                       {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                    </div>
                    <div className="space-y-2">
                       <Label>שם הבנק</Label>
                       <input 
                          type="text" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.bankName || ''}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>מספר חשבון</Label>
                           <input 
                              type="text" 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.accountNumber || ''}
                              onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>יתרה נוכחית (₪)</Label>
                           <input 
                              type="number" 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.balance || ''}
                              onChange={(e) => setFormData({...formData, balance: e.target.value})}
                           />
                        </div>
                    </div>
                    <div className="space-y-2">
                       <Label>צבע תצוגה</Label>
                       <div className="flex gap-2">
                          {['#00D9FF', '#9D4EDD', '#FF006E', '#FFA500', '#00FF9D'].map(c => (
                             <div 
                                key={c} 
                                onClick={() => setFormData({...formData, color: c})}
                                className={cn("w-8 h-8 rounded-full cursor-pointer border-2 transition-all", formData.color === c ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100")}
                                style={{ backgroundColor: c }}
                             />
                          ))}
                       </div>
                    </div>
                 </>
              )}

              {/* Credit Card Form */}
              {modalType === 'account-credit' && (
                 <>
                    <div className="space-y-2">
                       <Label>שם הכרטיס</Label>
                       <input 
                          type="text" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                       {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>מסגרת אשראי (₪)</Label>
                           <input 
                              type="number" 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.limit || ''}
                              onChange={(e) => setFormData({...formData, limit: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>יתרה לחיוב (₪)</Label>
                           <input 
                              type="number" 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.balance || ''}
                              onChange={(e) => setFormData({...formData, balance: e.target.value})}
                           />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>מספר כרטיס (4 ספרות)</Label>
                           <input 
                              type="text" 
                              maxLength={4}
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.cardNumber ? formData.cardNumber.slice(-4) : ''}
                              onChange={(e) => setFormData({...formData, cardNumber: '****' + e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>יום חיוב בחודש</Label>
                           <input 
                              type="number" 
                              min={1} max={31}
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.dueDate || ''}
                              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                           />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>ריבית (%)</Label>
                        <input 
                           type="number" 
                           step="0.1"
                           className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                           value={formData.interestRate || ''}
                           onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                        />
                    </div>
                 </>
              )}

              {/* Budget Form */}
              {modalType === 'budget' && (
                 <>
                    <div className="space-y-2">
                       <Label>קטגוריה</Label>
                       <input 
                          type="text" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.category || ''}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                       />
                       {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}
                    </div>
                    <div className="space-y-2">
                       <Label>תקרה לתקציב (₪)</Label>
                       <input 
                          type="number" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.limit || ''}
                          onChange={(e) => setFormData({...formData, limit: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <Label>כבר נוצל (אופציונלי)</Label>
                       <input 
                          type="number" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.spent || ''}
                          onChange={(e) => setFormData({...formData, spent: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <Label>תקופה</Label>
                       <select 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.period || 'monthly'}
                          onChange={(e) => setFormData({...formData, period: e.target.value})}
                       >
                          <option value="monthly">חודשי</option>
                          <option value="yearly">שנתי</option>
                       </select>
                    </div>
                 </>
              )}

              {/* Loan Form */}
              {modalType === 'loan' && (
                 <>
                    <div className="space-y-2">
                       <Label>שם ההלוואה</Label>
                       <input 
                          type="text" 
                          className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                       {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>סכום קרן (₪)</Label>
                           <input 
                              type="number" 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.principal || ''}
                              onChange={(e) => setFormData({...formData, principal: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>יתרה לתשלום (₪)</Label>
                           <input 
                              type="number" 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.remaining || ''}
                              onChange={(e) => setFormData({...formData, remaining: e.target.value})}
                           />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>ריבית (%)</Label>
                           <input 
                              type="number" step="0.1"
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.interestRate || ''}
                              onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label>תשלום חודשי (₪)</Label>
                           <input 
                              type="number" 
                              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                              value={formData.monthlyPayment || ''}
                              onChange={(e) => setFormData({...formData, monthlyPayment: e.target.value})}
                           />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>תאריך פירעון קרוב</Label>
                        <input 
                           type="date" 
                           className="w-full bg-[#0A0E27] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00D9FF]"
                           value={formData.nextDueDate || ''}
                           onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})}
                        />
                    </div>
                 </>
              )}

           </div>

           <DialogFooter className="sm:justify-start">
              <Button onClick={handleSubmit} className="w-full bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
                 <Save className="w-4 h-4 ml-2" />
                 שמור
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Confirmation Dialog --- */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-[#050A18] border border-red-500/30 text-white sm:max-w-[400px]">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                 <AlertTriangle className="w-5 h-5" />
                 אישור מחיקה
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                 האם אתה בטוח שברצונך למחוק פריט זה? הפעולה אינה הפיכה.
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2 sm:justify-start">
              <Button variant="destructive" onClick={confirmDelete}>מחק לצמיתות</Button>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} className="border-white/10 hover:bg-white/5 text-gray-300">ביטול</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Finance;