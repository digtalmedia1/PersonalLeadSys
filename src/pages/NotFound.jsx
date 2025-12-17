import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Home, Compass } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050A18] text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <Helmet>
        <title>הדף לא נמצא | Empire Leads Hub</title>
        <meta name="description" content="הדף שחיפשת לא קיים במערכת. חזור ללוח הבקרה או לנווט מחדש." />
      </Helmet>

      <div className="max-w-xl w-full bg-[#0A0E27]/80 border border-[#00D9FF]/30 rounded-3xl shadow-2xl p-10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-56 h-56 bg-[#00D9FF]/10 rounded-full blur-3xl" />
        <div className="absolute -right-10 -bottom-16 w-60 h-60 bg-[#9D4EDD]/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-[#00D9FF]">
            <Compass className="w-8 h-8" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">Navigation Error</span>
          </div>

          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] drop-shadow-[0_0_12px_rgba(0,217,255,0.35)]">
            404
          </h1>

          <p className="text-lg text-white/80 leading-relaxed">
            מצטערים, לא מצאנו את הדף שחיפשת. ייתכן שהקישור שגוי או שהדף הועבר למיקום אחר.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00D9FF] hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              חזרה אחורה
            </button>

            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] hover:from-[#4be5ff] hover:to-[#b46bff] text-white font-semibold shadow-[0_8px_30px_rgba(0,217,255,0.35)]"
            >
              <Home className="w-4 h-4" />
              חזרה ללוח הבקרה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
