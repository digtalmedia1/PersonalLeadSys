import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Phone, Video, MoreVertical, Paperclip, CheckCheck, Filter, MessageSquare, Mail, Archive, Trash2, Reply, Star, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GmailSidebar from '@/components/GmailSidebar';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const Inbox = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'gmail'
  
  // Chat State
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  
  // Gmail State
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState([]);

  // Mock Data for Chat
  const chats = [
    { id: 1, name: 'יוסי כהן', lastMessage: 'היי, ראיתי את האתר ואני מעוניין...', time: '10:30', unread: 2, status: 'online', avatar: 'YC', color: '#00D9FF' },
    { id: 2, name: 'שרה לוי', lastMessage: 'תודה רבה על העזרה!', time: 'אתמול', unread: 0, status: 'offline', avatar: 'SL', color: '#9D4EDD' },
    { id: 3, name: 'רון אברהמי', lastMessage: 'מתי אפשר לקבוע פגישה?', time: 'אתמול', unread: 0, status: 'online', avatar: 'RA', color: '#FF006E' },
    { id: 4, name: 'מערכות סייבר בע"מ', lastMessage: 'שלחתי את המסמכים במייל', time: '12/10', unread: 1, status: 'busy', avatar: 'MS', color: '#FFA500' },
  ];

  const chatMessages = [
    { id: 1, text: 'שלום, הגעתי דרך האתר NLP Coaching', sender: 'them', time: '10:28' },
    { id: 2, text: 'היי יוסי, שמח לשמוע. איך אני יכול לעזור?', sender: 'me', time: '10:29' },
    { id: 3, text: 'היי, ראיתי את האתר ואני מעוניין לשמוע פרטים על תוכנית הליווי האישי.', sender: 'them', time: '10:30' },
  ];

  const handleEmailAction = (action) => {
    if (!selectedEmail) return;
    
    let message = '';
    let color = '';
    
    if (action === 'archive') { message = 'המייל הועבר לארכיון'; color = '#00D9FF'; }
    if (action === 'delete') { message = 'המייל נמחק'; color = '#FF006E'; }
    if (action === 'star') { message = 'המייל סומן בכוכב'; color = '#FFA500'; }

    // Update state to remove/update email locally
    if (action === 'delete' || action === 'archive') {
      setEmails(emails.filter(e => e.id !== selectedEmail.id));
      setSelectedEmail(null);
    }

    toast({ title: message, className: `bg-[#050A18] border-[${color}] text-white shadow-[0_0_15px_${color}40]` });
  };

  return (
    <>
      <Helmet>
        <title>תיבת דואר - Empire Leads Hub</title>
      </Helmet>
      
      <div className="relative h-[calc(100vh-140px)] font-rubik text-right overflow-hidden flex rounded-3xl border border-[#00D9FF]/20 bg-[#050A18]/80 backdrop-blur-2xl shadow-2xl group" dir="rtl">
         {/* Background Glows */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00D9FF]/5 rounded-full blur-[100px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF006E]/5 rounded-full blur-[100px] pointer-events-none" />

         {/* Sidebar Area */}
         <div className="w-full md:w-[400px] border-l border-[#00D9FF]/10 flex flex-col bg-[#0A0E27]/40 relative z-10 transition-all duration-300">
            {/* Tab Switcher */}
            <div className="p-4 pb-2">
              <div className="flex p-1 gap-1 bg-[#050A18]/80 border border-white/5 rounded-xl relative">
                {/* Animated Background Slider */}
                <motion.div 
                  className={cn("absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-lg z-0", activeTab === 'chat' ? "bg-[#00D9FF]/20 right-1" : "bg-[#FF006E]/20 right-[calc(50%+2px)]")}
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                
                <button 
                  onClick={() => { setActiveTab('chat'); setSelectedEmail(null); }}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-colors relative z-10", activeTab === 'chat' ? "text-[#00D9FF]" : "text-gray-400 hover:text-gray-200")}
                >
                  <MessageSquare className="w-4 h-4" /> צ'אט
                </button>
                <button 
                  onClick={() => { setActiveTab('gmail'); setSelectedChat(null); }}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-colors relative z-10", activeTab === 'gmail' ? "text-[#FF006E]" : "text-gray-400 hover:text-gray-200")}
                >
                  <Mail className="w-4 h-4" /> Gmail
                </button>
              </div>
            </div>

            {/* Content based on Active Tab */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTab === 'chat' ? (
                  <motion.div 
                    key="chat-list"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    <div className="px-4 pb-4 border-b border-[#00D9FF]/10">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white tracking-wide">שיחות אחרונות</h2>
                        <Button variant="ghost" size="icon" className="text-[#00D9FF] hover:bg-[#00D9FF]/10 rounded-full">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="relative group">
                         <div className="absolute -inset-0.5 bg-[#00D9FF]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                        <input 
                          type="text" 
                          placeholder="חיפוש באנשי קשר..." 
                          className="relative w-full pl-4 pr-10 py-2.5 rounded-lg bg-[#050A18] border border-[#00D9FF]/20 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-all placeholder:text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                      {chats.map((chat) => (
                        <motion.div 
                          key={chat.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ backgroundColor: 'rgba(0, 217, 255, 0.05)', scale: 1.01 }}
                          onClick={() => setSelectedChat(chat)}
                          className={cn("p-4 border-b border-white/5 cursor-pointer transition-all relative", selectedChat?.id === chat.id && "bg-[#00D9FF]/5")}
                        >
                          {selectedChat?.id === chat.id && (
                            <motion.div layoutId="activeChatBorder" className="absolute right-0 top-0 bottom-0 w-1 bg-[#00D9FF] shadow-[0_0_10px_#00D9FF]" />
                          )}
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#050A18] to-[#1a1f3c] border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-lg overflow-hidden">
                                  <div className="absolute inset-0 opacity-20" style={{ backgroundColor: chat.color }} />
                                  {chat.avatar}
                                </div>
                                <div className={cn("absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0A0E27]", chat.status === 'online' ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]" : "bg-gray-500")}></div>
                              </div>
                              <div>
                                <h3 className={cn("font-bold text-sm transition-colors", selectedChat?.id === chat.id ? "text-[#00D9FF]" : "text-gray-200")}>{chat.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{chat.lastMessage}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-[10px] text-gray-500 font-mono">{chat.time}</span>
                              {chat.unread > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-[#00D9FF] text-[10px] font-bold text-[#050A18] shadow-[0_0_10px_rgba(0,217,255,0.4)]">
                                  {chat.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="gmail-sidebar"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full"
                  >
                    <GmailSidebar 
                      onSelectEmail={setSelectedEmail} 
                      selectedEmailId={selectedEmail?.id} 
                      emails={emails}
                      setEmails={setEmails}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col bg-[#050A18]/20 relative overflow-hidden">
           
           {/* CHAT VIEW */}
           {activeTab === 'chat' && (
             selectedChat ? (
               <>
                 {/* Chat Header */}
                 <motion.div 
                   initial={{ y: -20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="p-4 border-b border-[#00D9FF]/10 flex justify-between items-center bg-[#050A18]/60 backdrop-blur-md relative z-20"
                 >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#050A18] to-[#1a1f3c] border border-white/10 flex items-center justify-center text-sm font-bold text-white relative">
                         <div className="absolute inset-0 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: selectedChat.color }} />
                         {selectedChat.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-wide">{selectedChat.name}</h3>
                        <p className="text-xs text-[#00D9FF] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-pulse" />
                          מחובר כעת
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#00D9FF] hover:bg-[#00D9FF]/10 rounded-xl"><Phone className="w-5 h-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#9D4EDD] hover:bg-[#9D4EDD]/10 rounded-xl"><Video className="w-5 h-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"><MoreVertical className="w-5 h-5" /></Button>
                    </div>
                 </motion.div>

                 {/* Messages */}
                 <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                    {chatMessages.map((msg, i) => (
                      <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex ${msg.sender === 'me' ? 'justify-start' : 'justify-end'}`}
                      >
                         <div className={`max-w-[70%] p-4 rounded-2xl relative group shadow-lg backdrop-blur-sm ${
                           msg.sender === 'me' 
                             ? 'bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-white rounded-tr-none' 
                             : 'bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 text-white rounded-tl-none'
                         }`}>
                           <p className="text-sm leading-relaxed tracking-wide">{msg.text}</p>
                           <div className="flex items-center justify-end gap-1.5 mt-2 opacity-50 text-[10px]">
                             <span>{msg.time}</span>
                             {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-[#00D9FF]" />}
                           </div>
                           {/* Glow Effect */}
                           <div className={`absolute inset-0 blur-xl -z-10 opacity-10 transition-opacity group-hover:opacity-20 ${msg.sender === 'me' ? 'bg-[#00D9FF]' : 'bg-[#9D4EDD]'}`}></div>
                         </div>
                      </motion.div>
                    ))}
                 </div>

                 {/* Input */}
                 <div className="p-4 bg-[#050A18]/80 border-t border-[#00D9FF]/10 backdrop-blur-md relative z-20">
                   <div className="flex items-center gap-3 bg-[#0A0E27] border border-white/5 rounded-2xl p-2.5 focus-within:border-[#00D9FF]/50 focus-within:shadow-[0_0_15px_rgba(0,217,255,0.1)] transition-all">
                     <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#00D9FF] shrink-0 rounded-xl hover:bg-[#00D9FF]/10">
                       <Paperclip className="w-5 h-5" />
                     </Button>
                     <input 
                       type="text" 
                       value={messageInput}
                       onChange={(e) => setMessageInput(e.target.value)}
                       placeholder="הקלד הודעה..." 
                       className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-600"
                       onKeyDown={(e) => e.key === 'Enter' && setMessageInput('')}
                     />
                     <motion.button 
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       className="w-10 h-10 bg-gradient-to-tr from-[#00D9FF] to-[#00B4D8] text-[#050A18] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.4)]"
                     >
                       <Send className="w-5 h-5" />
                     </motion.button>
                   </div>
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50 select-none">
                 <div className="w-24 h-24 rounded-full bg-[#00D9FF]/5 border border-[#00D9FF]/20 flex items-center justify-center mb-6 relative">
                   <div className="absolute inset-0 bg-[#00D9FF] blur-2xl opacity-20 animate-pulse" />
                   <MessageSquare className="w-10 h-10 text-[#00D9FF]" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">בחר שיחה להתחלת צ'אט</h3>
                 <p className="text-sm">כל השיחות שלך במקום אחד, מסודרות ומאובטחות</p>
               </div>
             )
           )}

           {/* GMAIL VIEW */}
           {activeTab === 'gmail' && (
              selectedEmail ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col h-full bg-[#050A18]/40"
                >
                  {/* Email Actions Header */}
                  <div className="p-6 border-b border-[#FF006E]/10 flex justify-between items-center bg-[#050A18]/60 backdrop-blur-md sticky top-0 z-30">
                     <div className="flex items-center gap-4 overflow-hidden">
                       <motion.button 
                         whileHover={{ scale: 1.1 }}
                         onClick={() => setSelectedEmail(null)}
                         className="md:hidden text-gray-400 hover:text-white"
                       >
                         <ChevronLeft className="w-6 h-6" />
                       </motion.button>
                       <div>
                         <h3 className="font-bold text-white text-xl truncate max-w-lg leading-tight tracking-tight mb-1">{selectedEmail.subject}</h3>
                         <div className="flex items-center gap-2">
                            {selectedEmail.unread && (
                              <span className="bg-[#FF006E]/20 text-[#FF006E] border border-[#FF006E]/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,0,110,0.2)]">
                                הודעה חדשה
                              </span>
                            )}
                            <span className="text-[#FF006E]/60 text-xs">תיבת דואר נכנס</span>
                         </div>
                       </div>
                     </div>
                     <div className="flex gap-2">
                       <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF' }} onClick={() => handleEmailAction('archive')} className="p-2 rounded-xl text-gray-400 transition-colors"><Archive className="w-5 h-5" /></motion.button>
                       <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(234, 67, 53, 0.1)', color: '#EA4335' }} onClick={() => handleEmailAction('delete')} className="p-2 rounded-xl text-gray-400 transition-colors"><Trash2 className="w-5 h-5" /></motion.button>
                       <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(250, 204, 21, 0.1)', color: '#FACC15' }} onClick={() => handleEmailAction('star')} className="p-2 rounded-xl text-gray-400 transition-colors"><Star className="w-5 h-5" /></motion.button>
                     </div>
                  </div>

                  {/* Email Body */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                     <div className="max-w-4xl mx-auto">
                       <div className="flex items-start gap-5 mb-8 pb-8 border-b border-white/5">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl bg-gradient-to-br border border-white/10", selectedEmail.avatarColor || 'from-gray-700 to-gray-900')}>
                            {selectedEmail.sender[0]}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                               <div>
                                 <p className="font-bold text-white text-lg tracking-wide">{selectedEmail.sender}</p>
                                 <p className="text-sm text-gray-400 mt-0.5">אל: <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded text-xs">me@empire.com</span></p>
                               </div>
                               <p className="text-xs font-mono text-gray-500 bg-[#050A18] border border-white/5 px-3 py-1.5 rounded-lg">{selectedEmail.date}</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed font-sans prose-headings:text-white prose-a:text-[#FF006E] prose-strong:text-[#FF006E]" dangerouslySetInnerHTML={{ __html: selectedEmail.content }} />
                       
                       <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                          <Button variant="outline" className="border-[#FF006E]/30 text-[#FF006E] hover:bg-[#FF006E] hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,110,0.4)]">
                            <Reply className="w-4 h-4 ml-2" /> השב למייל
                          </Button>
                          <Button variant="ghost" className="text-gray-400 hover:text-white">
                            העבר הודעה
                          </Button>
                       </div>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50 select-none">
                  <div className="w-32 h-32 rounded-full bg-[#FF006E]/5 border border-[#FF006E]/10 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-[#FF006E] blur-[40px] opacity-20 animate-pulse-slow" />
                    <div className="absolute inset-0 border border-[#FF006E]/30 rounded-full animate-ping-slow opacity-20"></div>
                    <Mail className="w-12 h-12 text-[#FF006E]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">תיבת הדואר שלך</h3>
                  <p className="text-base text-gray-400 max-w-xs text-center leading-relaxed">בחר הודעה מהרשימה בצד ימין כדי להציג את התוכן המלא שלה</p>
                </div>
              )
           )}

         </div>
      </div>
    </>
  );
};

export default Inbox;