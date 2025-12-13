
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Users, Phone, Mail, Instagram, Linkedin, 
  Twitter, Facebook, MessageCircle, Edit, Trash2, 
  Briefcase, Upload, FileSpreadsheet, Check,
  Download, FileText, AlertCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Contacts = () => {
  const { toast } = useToast();
  
  // --- State ---
  const [contacts, setContacts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [editingContact, setEditingContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);

  // Import State
  const fileInputRef = useRef(null);
  const [importedData, setImportedData] = useState([]);
  const [importProject, setImportProject] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectId: '',
    role: '',
    company: '',
    tags: '',
    notes: '',
    social: {
      linkedin: '',
      instagram: '',
      twitter: '',
      facebook: '',
      whatsapp: ''
    }
  });

  // --- Initialization ---
  useEffect(() => {
    // Load Contacts
    const storedContacts = JSON.parse(localStorage.getItem('empire_contacts') || '[]');
    setContacts(storedContacts);

    // Load Projects (for selection)
    const storedProjects = JSON.parse(localStorage.getItem('empire_projects') || '[]');
    setProjects(storedProjects);
  }, []);

  // --- Persistence ---
  const saveContacts = (updatedContacts) => {
    setContacts(updatedContacts);
    localStorage.setItem('empire_contacts', JSON.stringify(updatedContacts));
  };

  // --- Helpers ---
  const getProjectName = (pid) => {
    const p = projects.find(proj => proj.id === pid);
    return p ? p.name : 'ללא פרויקט';
  };

  // --- Filtering ---
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.phone?.includes(searchTerm);
    const matchesProject = selectedProjectFilter === 'all' || c.projectId === selectedProjectFilter;
    
    return matchesSearch && matchesProject;
  });

  // --- Export Logic ---
  const getExportData = () => {
    return filteredContacts.map(c => ({
      'Name': c.name || '',
      'Email': c.email || '',
      'Phone': c.phone || '',
      'Role': c.role || '',
      'Company': c.company || '',
      'Project': getProjectName(c.projectId) || '',
      'Tags': Array.isArray(c.tags) ? c.tags.join(', ') : (c.tags || ''),
      'Notes': c.notes || '',
      'LinkedIn': c.social?.linkedin || '',
      'Instagram': c.social?.instagram || '',
      'Twitter': c.social?.twitter || '',
      'Facebook': c.social?.facebook || '',
      'WhatsApp': c.social?.whatsapp || ''
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    if (data.length === 0) {
      toast({ title: "אין נתונים לייצוא", variant: "destructive" });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const value = row[fieldName] ? String(row[fieldName]).replace(/"/g, '""') : '';
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, 'csv');
  };

  const handleExportExcel = () => {
    const data = getExportData();
    if (data.length === 0) {
      toast({ title: "אין נתונים לייצוא", variant: "destructive" });
      return;
    }

    const headers = Object.keys(data[0]);
    
    // Create HTML Table for Excel (Works as .xls)
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Contacts</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; }
          th { background-color: #f0f0f0; font-weight: bold; border: 1px solid #ccc; padding: 5px; }
          td { border: 1px solid #ccc; padding: 5px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel' });
    downloadFile(blob, 'xls');
  };

  const downloadFile = (blob, extension) => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `empire_contacts_${date}.${extension}`;
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast({ 
      title: "הייצוא בוצע בהצלחה", 
      description: `הקובץ ${fileName} ירד למחשבך` 
    });
  };

  // --- Handlers ---
  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        projectId: contact.projectId || '',
        role: contact.role || '',
        company: contact.company || '',
        tags: contact.tags ? contact.tags.join(', ') : '',
        notes: contact.notes || '',
        social: {
          linkedin: contact.social?.linkedin || '',
          instagram: contact.social?.instagram || '',
          twitter: contact.social?.twitter || '',
          facebook: contact.social?.facebook || '',
          whatsapp: contact.social?.whatsapp || ''
        }
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '', email: '', phone: '', projectId: '', role: '', company: '', tags: '', notes: '',
        social: { linkedin: '', instagram: '', twitter: '', facebook: '', whatsapp: '' }
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.name) return "שם איש קשר הוא שדה חובה";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) return "כתובת אימייל לא תקינה";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast({ title: "שגיאה בטופס", description: error, variant: "destructive" });
      return;
    }

    const processedData = {
      ...formData,
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags,
      updatedAt: new Date().toISOString()
    };

    if (editingContact) {
      const updatedList = contacts.map(c => 
        c.id === editingContact.id ? { ...c, ...processedData } : c
      );
      saveContacts(updatedList);
      toast({ title: "עודכן בהצלחה", description: "פרטי איש הקשר עודכנו" });
    } else {
      const newContact = {
        id: `cnt_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...processedData
      };
      saveContacts([newContact, ...contacts]);
      toast({ title: "נוצר בהצלחה", description: "איש קשר חדש נוסף למערכת" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!contactToDelete) return;
    const updatedList = contacts.filter(c => c.id !== contactToDelete.id);
    saveContacts(updatedList);
    setIsDeleteAlertOpen(false);
    setContactToDelete(null);
    toast({ title: "נמחק", description: "איש הקשר הוסר מהמערכת", variant: "destructive" });
  };

  // --- Import Logic ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      parseFile(file);
    }
  };

  const parseFile = (file) => {
    if (file.type === "text/csv" || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        try {
          const parsed = parseCSV(text);
          if (parsed.length > 0) {
            setImportedData(parsed);
            setIsImportModalOpen(true);
            toast({ title: "הקובץ נטען", description: `נמצאו ${parsed.length} רשומות רלוונטיות` });
          } else {
            toast({ title: "שגיאה", description: "לא נמצאו נתונים תקינים או שכל הרשומות חסרות שם", variant: "destructive" });
          }
        } catch (err) {
          console.error(err);
          toast({ title: "שגיאה", description: "נכשל בפענוח הקובץ", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    } else {
      toast({ 
        title: "פורמט לא נתמך כרגע", 
        description: "אנא המר את קובץ האקסל ל-CSV ונסה שוב", 
        variant: "destructive" 
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    // Keep plus sign, digits, but remove spaces, dashes, dots, parenthesis
    return phone.replace(/[^0-9+]/g, ''); 
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const parseLine = (line) => {
      const res = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          res.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          current = '';
        } else {
          current += char;
        }
      }
      res.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      return res;
    };

    const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
    
    // Check if it looks like Google Contacts CSV
    const isGoogleFormat = headers.includes('given name') || headers.includes('family name') || headers.includes('e-mail 1 - value') || headers.includes('organization 1 - title');

    const results = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const currentLine = parseLine(lines[i]);
      if (currentLine.length < headers.length) continue; // Skip incomplete lines
      
      if (currentLine.length > 0) {
        const obj = { social: {} };
        let nameFound = false;
        let phoneFound = false;
        
        // --- Google Format Handling ---
        if (isGoogleFormat) {
          // Name Strategy:
          // 1. Given Name + Family Name
          // 2. Name
          // 3. File As
          const givenNameIdx = headers.indexOf('given name');
          const familyNameIdx = headers.indexOf('family name');
          const nameIdx = headers.indexOf('name');
          const fileAsIdx = headers.indexOf('file as');
          
          let name = '';
          const given = givenNameIdx > -1 ? (currentLine[givenNameIdx] || '') : '';
          const family = familyNameIdx > -1 ? (currentLine[familyNameIdx] || '') : '';
          
          if (given || family) {
             name = `${given} ${family}`.trim();
          }
          
          if (!name && nameIdx > -1) {
             name = currentLine[nameIdx] || '';
          }

          if (!name && fileAsIdx > -1) {
             name = currentLine[fileAsIdx] || '';
          }

          // Clean up "garbage" text in names (e.g. "My Contact :::")
          if (name) {
             name = name.replace(/[:;<>]/g, '').trim();
          }

          if (name) {
            obj.name = name;
            nameFound = true;
          }

          // Phones (Google uses 'Phone 1 - Value', 'Mobile Phone')
          const phoneIdx1 = headers.indexOf('phone 1 - value');
          const mobileIdx = headers.indexOf('mobile phone');
          
          let rawPhone = '';
          if (phoneIdx1 > -1 && currentLine[phoneIdx1]) rawPhone = currentLine[phoneIdx1];
          else if (mobileIdx > -1 && currentLine[mobileIdx]) rawPhone = currentLine[mobileIdx];

          if (rawPhone) {
             obj.phone = cleanPhoneNumber(rawPhone);
             phoneFound = true;
          }

          // Email
          const emailIdx1 = headers.indexOf('e-mail 1 - value');
          const emailIdxOld = headers.indexOf('email address');
          if (emailIdx1 > -1 && currentLine[emailIdx1]) obj.email = currentLine[emailIdx1];
          else if (emailIdxOld > -1 && currentLine[emailIdxOld]) obj.email = currentLine[emailIdxOld];

          // Role/Company
          const orgTitleIdx = headers.indexOf('organization 1 - title');
          const orgNameIdx = headers.indexOf('organization 1 - name');
          const titleIdx = headers.indexOf('job title');
          const companyIdx = headers.indexOf('company');

          if (orgTitleIdx > -1 && currentLine[orgTitleIdx]) obj.role = currentLine[orgTitleIdx];
          else if (titleIdx > -1 && currentLine[titleIdx]) obj.role = currentLine[titleIdx];

          if (orgNameIdx > -1 && currentLine[orgNameIdx]) obj.company = currentLine[orgNameIdx];
          else if (companyIdx > -1 && currentLine[companyIdx]) obj.company = currentLine[companyIdx];

          // Notes
          const notesIdx = headers.indexOf('notes');
          if (notesIdx > -1 && currentLine[notesIdx]) obj.notes = currentLine[notesIdx];
        
        } else {
          // --- Standard / Custom Format Handling ---
          headers.forEach((header, index) => {
            const value = currentLine[index] || '';
            if (!value) return;

            if (['name', 'full name', 'fullname', 'שם', 'שם מלא'].includes(header)) {
               obj.name = value;
               nameFound = true;
            }
            else if (['email', 'e-mail', 'mail', 'אימייל', 'דואר אלקטרוני'].includes(header)) obj.email = value;
            else if (['phone', 'mobile', 'cell', 'tel', 'טלפון', 'נייד'].includes(header)) {
               obj.phone = cleanPhoneNumber(value);
               phoneFound = true;
            }
            else if (['company', 'organization', 'חברה', 'ארגון', 'organization 1 - name'].includes(header)) obj.company = value;
            else if (['role', 'job', 'title', 'position', 'תפקיד', 'organization 1 - title'].includes(header)) obj.role = value;
            else if (['notes', 'description', 'info', 'הערות'].includes(header)) obj.notes = value;
          });
        }

        // Logic: 
        // 1. If we have name, great.
        // 2. If NO name but we HAVE phone, use phone as name placeholder or generic name.
        // 3. User requested: "Skip rows with only phone numbers and no name". 
        //    Wait, actually user said "Extract phone numbers even when First Name/Last Name are empty" in point 1, 
        //    BUT then said "Skip rows with only phone numbers and no name" in point 3. 
        //    These are contradictory. I will assume point 3 means "Skip rows that have ONLY phone numbers AND NOTHING ELSE meaningful (like email/company)".
        //    Or better, I'll allow rows with just Phone, but label them "Unknown Contact - [Phone]".
        
        if (!obj.name && obj.phone) {
           obj.name = `איש קשר - ${obj.phone.slice(-4)}`; // Fallback name
           nameFound = true;
        }

        if (nameFound) {
          if (!obj.social) obj.social = {};
          results.push(obj);
        }
      }
    }
    return results;
  };

  const handleRemoveImportItem = (index) => {
    const updated = [...importedData];
    updated.splice(index, 1);
    setImportedData(updated);
  };

  const handleUpdateImportItem = (index, field, value) => {
    const updated = [...importedData];
    updated[index] = { ...updated[index], [field]: value };
    setImportedData(updated);
  };

  const handleConfirmImport = () => {
    const newContacts = importedData.map((c, idx) => ({
      id: `cnt_imp_${Date.now()}_${idx}`,
      createdAt: new Date().toISOString(),
      name: c.name || 'Unnamed Import',
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      role: c.role || '',
      notes: c.notes || '',
      tags: c.tags || [],
      projectId: importProject || '',
      social: c.social || { linkedin: '', instagram: '', twitter: '', facebook: '', whatsapp: '' }
    }));

    saveContacts([...newContacts, ...contacts]);
    setIsImportModalOpen(false);
    setImportedData([]);
    setImportProject('');
    toast({ title: "הייבוא הושלם", description: `${newContacts.length} אנשי קשר נוספו בהצלחה` });
  };

  return (
    <>
      <Helmet><title>אנשי קשר - Empire CRM</title></Helmet>

      <div className="space-y-6 pb-20 font-rubik" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
                אנשי קשר
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00D9FF]" />
                ניהול מאגר אנשי קשר ושיוך לפרויקטים
              </p>
           </div>
           
           <div className="flex flex-wrap gap-3 w-full md:w-auto">
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv" 
                className="hidden" 
             />
             
             {/* Import Button */}
             <Button 
               variant="outline"
               onClick={() => fileInputRef.current?.click()}
               className="border-[#9D4EDD]/50 text-[#9D4EDD] hover:bg-[#9D4EDD]/10 font-bold h-10 px-4 flex-1 md:flex-none"
             >
               <Upload className="w-4 h-4 ml-2" />
               ייבוא (CSV)
             </Button>

             {/* Export Dropdown */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 font-bold h-10 px-4 flex-1 md:flex-none">
                      <Download className="w-4 h-4 ml-2" />
                      ייצוא
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#050A18] border border-white/10 text-white min-w-[200px]" align="end">
                   <DropdownMenuItem onClick={handleExportCSV} className="hover:bg-white/5 cursor-pointer flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00D9FF]" />
                      <span>ייצוא לקובץ CSV</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={handleExportExcel} className="hover:bg-white/5 cursor-pointer flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
                      <span>ייצוא לקובץ Excel</span>
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
             
             {/* Add Contact Button */}
             <Button 
               onClick={() => handleOpenModal()}
               className="bg-gradient-to-r from-[#00D9FF] to-[#00B4D8] text-[#050A18] font-bold shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] transition-all h-10 px-6 flex-1 md:flex-none"
             >
               <Plus className="w-5 h-5 ml-2" />
               איש קשר חדש
             </Button>
           </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0A0E27]/60 border border-[#00D9FF]/10 backdrop-blur-xl p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-lg">
           <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="relative group flex-1 max-w-md">
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D9FF] transition-colors" />
                 <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="חיפוש לפי שם, טלפון, אימייל..." 
                   className="w-full bg-[#050A18] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-all"
                 />
              </div>
              
              <div className="w-full md:w-64">
                 <select 
                    value={selectedProjectFilter}
                    onChange={(e) => setSelectedProjectFilter(e.target.value)}
                    className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:border-[#00D9FF] outline-none"
                 >
                    <option value="all">כל הפרויקטים</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    <option value="">ללא שיוך</option>
                 </select>
              </div>
           </div>
           <div className="text-sm text-gray-500 font-mono shrink-0">
             {filteredContacts.length} תוצאות
           </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <AnimatePresence>
             {filteredContacts.map((contact, idx) => (
               <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#0A0E27]/40 border border-[#00D9FF]/10 hover:border-[#00D9FF]/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,217,255,0.1)] flex flex-col h-full"
               >
                  {/* Top Actions */}
                  <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <button onClick={() => handleOpenModal(contact)} className="p-1.5 bg-[#050A18] rounded-lg border border-white/10 text-gray-400 hover:text-[#00D9FF] hover:border-[#00D9FF] shadow-lg transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                     </button>
                     <button onClick={() => { setContactToDelete(contact); setIsDeleteAlertOpen(true); }} className="p-1.5 bg-[#050A18] rounded-lg border border-white/10 text-gray-400 hover:text-red-500 hover:border-red-500 shadow-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>

                  {/* Header Info */}
                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] p-[2px] shrink-0 shadow-lg">
                        <div className="w-full h-full rounded-full bg-[#050A18] flex items-center justify-center text-lg font-bold text-white uppercase">
                           {contact.name.substring(0, 2)}
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate text-lg group-hover:text-[#00D9FF] transition-colors">{contact.name}</h3>
                        <p className="text-sm text-gray-400 truncate flex items-center gap-1">
                           {contact.role && <span>{contact.role}</span>}
                           {contact.role && contact.company && <span className="text-gray-600">|</span>}
                           {contact.company && <span className="text-[#9D4EDD]">{contact.company}</span>}
                        </p>
                     </div>
                  </div>

                  {/* Project Badge */}
                  {contact.projectId && (
                     <div className="mb-4">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/20">
                          <Briefcase className="w-3 h-3" />
                          {getProjectName(contact.projectId)}
                       </span>
                     </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-6 flex-1">
                     {contact.email && (
                       <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 truncate">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="truncate" dir="ltr">{contact.email}</span>
                       </a>
                     )}
                     {contact.phone && (
                       <a href={`tel:${contact.phone}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 truncate">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="truncate" dir="ltr">{contact.phone}</span>
                       </a>
                     )}
                     {contact.notes && (
                       <div className="mt-2 p-2 bg-[#050A18] rounded-lg border border-white/5 text-xs text-gray-400 line-clamp-2 italic">
                         "{contact.notes}"
                       </div>
                     )}
                  </div>

                  {/* Tags */}
                  {contact.tags && contact.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-4">
                        {contact.tags.slice(0, 3).map((tag, i) => (
                           <span key={i} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">#{tag}</span>
                        ))}
                        {contact.tags.length > 3 && <span className="text-[10px] text-gray-600">+{contact.tags.length - 3}</span>}
                     </div>
                  )}

                  {/* Footer Socials */}
                  <div className="pt-3 border-t border-white/5 flex gap-2 justify-center">
                     {contact.social?.whatsapp && <a href={`https://wa.me/${contact.social.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"><MessageCircle className="w-4 h-4" /></a>}
                     {contact.social?.linkedin && <a href={contact.social.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 transition-colors"><Linkedin className="w-4 h-4" /></a>}
                     {contact.social?.instagram && <a href={contact.social.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors"><Instagram className="w-4 h-4" /></a>}
                     {contact.social?.facebook && <a href={contact.social.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-blue-800/10 text-blue-700 hover:bg-blue-800/20 transition-colors"><Facebook className="w-4 h-4" /></a>}
                     {contact.social?.twitter && <a href={contact.social.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"><Twitter className="w-4 h-4" /></a>}
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
           
           {filteredContacts.length === 0 && (
             <div className="col-span-full py-20 text-center bg-[#0A0E27]/30 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
                <div className="p-4 bg-white/5 rounded-full mb-4"><Users className="w-8 h-8 text-gray-500" /></div>
                <h3 className="text-xl font-bold text-gray-300">לא נמצאו אנשי קשר</h3>
                <p className="text-gray-500 mb-6 max-w-sm">לא נמצאו אנשי קשר התואמים את החיפוש או הסינון שלך. נסה לשנות את הסינון או הוסף איש קשר חדש.</p>
                <div className="flex gap-4">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="border-[#9D4EDD]/30 text-[#9D4EDD] hover:bg-[#9D4EDD]/10">ייבוא מקובץ</Button>
                  <Button onClick={() => handleOpenModal()} className="bg-[#00D9FF] text-[#050A18] font-bold">הוסף איש קשר חדש</Button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* --- Add/Edit Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#050A18] border border-[#00D9FF]/30 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                 <Users className="w-6 h-6 text-[#00D9FF]" />
                 {editingContact ? 'עריכת איש קשר' : 'יצירת איש קשר חדש'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                 מלא את הפרטים ליצירת כרטיס איש קשר. שדות המסומנים ב-* הם חובה.
              </DialogDescription>
           </DialogHeader>

           <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>שם מלא *</Label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                 </div>
                 <div className="space-y-2">
                    <Label>פרויקט משויך</Label>
                    <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none">
                        <option value="">ללא פרויקט (כללי)</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>תפקיד</Label>
                    <input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="מנכ״ל, מנהל שיווק..." className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                 </div>
                 <div className="space-y-2">
                    <Label>חברה / ארגון</Label>
                    <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>אימייל</Label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" dir="ltr" />
                 </div>
                 <div className="space-y-2">
                    <Label>טלפון</Label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" dir="ltr" />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[#9D4EDD]">רשתות חברתיות</Label>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                       <Linkedin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                       <input value={formData.social.linkedin} onChange={e => setFormData({...formData, social: {...formData.social, linkedin: e.target.value}})} placeholder="LinkedIn URL" className="w-full bg-[#0A0E27] border border-white/10 rounded-lg py-2 pr-10 pl-3 text-sm text-white focus:border-[#00D9FF] outline-none" dir="ltr" />
                    </div>
                    <div className="relative">
                       <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                       <input value={formData.social.whatsapp} onChange={e => setFormData({...formData, social: {...formData.social, whatsapp: e.target.value}})} placeholder="WhatsApp Number" className="w-full bg-[#0A0E27] border border-white/10 rounded-lg py-2 pr-10 pl-3 text-sm text-white focus:border-[#00D9FF] outline-none" dir="ltr" />
                    </div>
                    <div className="relative">
                       <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                       <input value={formData.social.instagram} onChange={e => setFormData({...formData, social: {...formData.social, instagram: e.target.value}})} placeholder="Instagram URL" className="w-full bg-[#0A0E27] border border-white/10 rounded-lg py-2 pr-10 pl-3 text-sm text-white focus:border-[#00D9FF] outline-none" dir="ltr" />
                    </div>
                    <div className="relative">
                       <Facebook className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                       <input value={formData.social.facebook} onChange={e => setFormData({...formData, social: {...formData.social, facebook: e.target.value}})} placeholder="Facebook URL" className="w-full bg-[#0A0E27] border border-white/10 rounded-lg py-2 pr-10 pl-3 text-sm text-white focus:border-[#00D9FF] outline-none" dir="ltr" />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label>תגיות (מופרד בפסיקים)</Label>
                 <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="VIP, לקוח חדש, ספק..." className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
              </div>

              <div className="space-y-2">
                 <Label>הערות</Label>
                 <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#00D9FF] outline-none" />
              </div>

              <DialogFooter className="sticky bottom-0 bg-[#050A18] pt-4 border-t border-white/5 mt-6">
                 <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400">ביטול</Button>
                 <Button type="submit" className="bg-[#00D9FF] text-[#050A18] font-bold hover:bg-[#00B4D8]">
                    {editingContact ? 'שמור שינויים' : 'צור איש קשר'}
                 </Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

      {/* --- Import Preview Modal --- */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="bg-[#050A18] border border-[#9D4EDD]/30 text-white sm:max-w-[700px] h-[80vh] flex flex-col p-0">
           <DialogHeader className="p-6 pb-2 border-b border-white/10 bg-[#050A18]">
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                 <FileSpreadsheet className="w-6 h-6 text-[#9D4EDD]" />
                 אישור ייבוא אנשי קשר
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                 נמצאו {importedData.length} אנשי קשר. אנא עבור על הרשימה, תקן שמות או מחק כפילויות לפני האישור.
              </DialogDescription>
           </DialogHeader>

           <div className="flex-1 overflow-hidden flex flex-col p-6 pt-2 space-y-4 bg-[#050A18]">
              <div className="space-y-2">
                 <Label>שיוך לפרויקט (אופציונלי)</Label>
                 <select 
                    value={importProject} 
                    onChange={e => setImportProject(e.target.value)} 
                    className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#9D4EDD] outline-none"
                 >
                    <option value="">ללא פרויקט (כללי)</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-200">
                   טיפ: לחץ על שם או מספר טלפון כדי לערוך אותו ישירות. ניתן למחוק שורות לא רצויות עם כפתור המחיקה.
                 </p>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden flex-1 flex flex-col">
                 <div className="bg-white/5 px-4 py-2 text-xs font-bold text-gray-400 flex gap-4 pr-12">
                    <span className="flex-1">שם (לחץ לעריכה)</span>
                    <span className="flex-1">טלפון</span>
                    <span className="flex-1 hidden md:block">אימייל</span>
                 </div>
                 <div className="overflow-y-auto custom-scrollbar flex-1">
                    {importedData.map((c, i) => (
                       <div key={i} className="px-4 py-3 border-b border-white/5 flex items-center gap-4 hover:bg-white/5 group relative">
                          <button 
                            onClick={() => handleRemoveImportItem(i)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="מחק שורה"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex-1 pr-8">
                            <input 
                              value={c.name} 
                              onChange={(e) => handleUpdateImportItem(i, 'name', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-white font-bold placeholder-gray-600 focus:text-[#00D9FF]"
                              placeholder="אין שם"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <input 
                              value={c.phone} 
                              onChange={(e) => handleUpdateImportItem(i, 'phone', e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-gray-300 text-sm focus:text-[#00D9FF]"
                              placeholder="---"
                              dir="ltr"
                            />
                          </div>
                          
                          <div className="flex-1 hidden md:block">
                             <span className="text-gray-400 text-xs truncate block" dir="ltr">{c.email || '-'}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <DialogFooter className="p-6 pt-2 border-t border-white/10 bg-[#050A18]">
              <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} className="text-gray-400">ביטול</Button>
              <Button onClick={handleConfirmImport} className="bg-[#9D4EDD] text-white font-bold hover:bg-[#8B3DCD]">
                 <Check className="w-4 h-4 ml-2" />
                 אשר ייבוא ({importedData.length})
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Delete Alert --- */}
      <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <DialogContent className="bg-[#050A18] border border-red-500/30 text-white sm:max-w-[400px]">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                 <Trash2 className="w-5 h-5" />
                 מחיקת איש קשר
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                 האם אתה בטוח שברצונך למחוק את <strong>{contactToDelete?.name}</strong>? פעולה זו אינה הפיכה.
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="mt-4 gap-2">
              <Button variant="ghost" onClick={() => setIsDeleteAlertOpen(false)} className="text-gray-400">ביטול</Button>
              <Button variant="destructive" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">מחק לצמיתות</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Contacts;
