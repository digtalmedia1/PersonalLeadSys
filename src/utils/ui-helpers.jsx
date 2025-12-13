import React from 'react';
import { 
  MessageCircle, Send, Facebook, Instagram, Video, Linkedin, 
  Mail, MessageSquare, Globe, FileInput, Laptop, Briefcase, 
  Heart, Dumbbell, ShieldAlert, Sparkles, Building2, User
} from 'lucide-react';

export const getChannelIcon = (type) => {
  switch (type) {
    case 'whatsapp': return <MessageCircle className="w-5 h-5 text-green-500" />;
    case 'telegram': return <Send className="w-5 h-5 text-blue-400" />;
    case 'facebook_messenger': return <Facebook className="w-5 h-5 text-blue-600" />;
    case 'instagram_dm': return <Instagram className="w-5 h-5 text-pink-500" />;
    case 'tiktok_dm': return <Video className="w-5 h-5 text-black" />;
    case 'linkedin_msg': return <Linkedin className="w-5 h-5 text-blue-700" />;
    case 'email': return <Mail className="w-5 h-5 text-orange-500" />;
    case 'sms': return <MessageSquare className="w-5 h-5 text-green-600" />;
    case 'site_form': return <FileInput className="w-5 h-5 text-purple-600" />;
    default: return <Globe className="w-5 h-5 text-gray-500" />;
  }
};

export const getChannelLabel = (type) => {
  const labels = {
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    facebook_messenger: 'Facebook Messenger',
    instagram_dm: 'Instagram DM',
    tiktok_dm: 'TikTok DM',
    linkedin_msg: 'LinkedIn',
    email: 'Email',
    sms: 'SMS',
    site_form: 'Website Form',
    manual_test: 'Manual Test',
    other: 'Other'
  };
  return labels[type] || type;
};

export const getCategoryIcon = (category) => {
  switch (category) {
    case 'erotic_services': return <Heart className="w-4 h-4" />;
    case 'dating_site': return <Sparkles className="w-4 h-4" />;
    case 'kink_community': return <ShieldAlert className="w-4 h-4" />;
    case 'nlp_coaching': return <User className="w-4 h-4" />;
    case 'lifestyle_fitness': return <Dumbbell className="w-4 h-4" />;
    case 'business_services': return <Briefcase className="w-4 h-4" />;
    default: return <Laptop className="w-4 h-4" />;
  }
};

export const getCategoryColor = (category) => {
  switch (category) {
    case 'erotic_services': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'dating_site': return 'bg-pink-100 text-pink-700 border-pink-200';
    case 'kink_community': return 'bg-slate-800 text-slate-100 border-slate-700';
    case 'nlp_coaching': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'lifestyle_fitness': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'business_services': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 border-green-200';
    case 'paused': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};