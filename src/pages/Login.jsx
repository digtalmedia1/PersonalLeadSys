import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Fingerprint, Shield, Cpu, Activity } from 'lucide-react';

// Moved outside component to prevent re-renders stealing focus or causing lag
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-[#00D9FF] rounded-full opacity-20"
        initial={{ 
          x: Math.random() * window.innerWidth, 
          y: Math.random() * window.innerHeight,
          scale: Math.random() * 0.5 + 0.5
        }}
        animate={{ 
          y: [null, Math.random() * window.innerHeight],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: Math.random() * 10 + 10, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        style={{
          width: Math.random() * 4 + 1 + 'px',
          height: Math.random() * 4 + 1 + 'px',
        }}
      />
    ))}
  </div>
);

const GridLines = () => (
  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
    style={{
      backgroundImage: `linear-gradient(#00D9FF 1px, transparent 1px), linear-gradient(90deg, #00D9FF 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      perspective: '1000px',
      transform: 'translateZ(-100px)'
    }}
  />
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard...");
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleUsernameChange = (e) => {
    // Debug log to ensure input is receiving events
    // console.log("Username input:", e.target.value);
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission triggered");
    
    // Basic Validation
    if (!username || !password) {
        console.warn("Validation failed: Missing username or password");
        toast({
            title: "Access Denied",
            description: "Credentials Required for Authorization.",
            variant: "destructive"
        });
        return;
    }

    console.log("Attempting login with:", { username, password: '***' });
    setLoading(true);
    setScanStatus('scanning');

    try {
      // Simulate biometric scan & network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = login(username, password);
      console.log("Login result:", result);
      
      if (result.success) {
        setScanStatus('success');
        // Short delay to show success state before redirect
        await new Promise(resolve => setTimeout(resolve, 500));
        toast({
          title: 'Access Granted',
          description: 'Welcome back, Commander.',
        });
        // Navigation will happen via useEffect
      } else {
        setScanStatus('idle');
        toast({
          title: 'Access Denied',
          description: result.error || 'Invalid credentials. Security protocols active.',
          variant: "destructive"
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login critical error:", error);
      setScanStatus('idle');
      toast({
        title: 'System Error',
        description: 'Connection interrupted. Retrying protocols...',
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>SECURE LOGIN - EMPIRE SYSTEM</title>
        <meta name="description" content="Secure Access Portal" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-[#050A18] relative overflow-hidden font-mono text-[#00D9FF]">
        {/* Ambient Background Glows - Fixed z-index */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#9D4EDD] opacity-10 blur-[100px] z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D9FF] opacity-10 blur-[100px] z-0" />
        
        <GridLines />
        <Particles />

        {/* Central Card Container - High Z-Index to ensure interactivity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-4xl flex flex-col md:flex-row z-50 p-4 md:p-0 gap-8 items-center"
        >
          
          {/* Left Panel: Biometric Visualization */}
          <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/2 h-[400px] relative pointer-events-none">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Rotating outer rings */}
              <motion.div 
                className="absolute inset-0 border-2 border-[#00D9FF] rounded-full border-t-transparent border-l-transparent opacity-50"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 border border-[#9D4EDD] rounded-full border-b-transparent border-r-transparent opacity-60"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Fingerprint Icon with Scan Effect */}
              <div className="relative overflow-hidden rounded-full p-8 bg-[#0A0E27]/80 backdrop-blur-sm border border-[#00D9FF]/30">
                <Fingerprint className={`w-24 h-24 ${scanStatus === 'success' ? 'text-green-400' : 'text-[#00D9FF]'}`} />
                {scanStatus === 'scanning' && (
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-white shadow-[0_0_15px_#fff]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center space-y-2">
              <h3 className="text-xl font-bold tracking-[0.2em] text-white">SYSTEM SECURITY</h3>
              <div className="flex items-center justify-center gap-2 text-xs text-[#00D9FF]/70">
                <Shield className="w-3 h-3" />
                <span>ENCRYPTION: AES-256</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[#00D9FF]/70">
                <Cpu className="w-3 h-3" />
                <span>STATUS: {scanStatus === 'scanning' ? 'AUTHENTICATING...' : scanStatus === 'success' ? 'GRANTED' : 'WAITING'}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="w-full md:w-1/2 relative z-50">
             {/* Tech Border Decorations */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] opacity-30 blur-sm rounded-xl -z-10"></div>
            
            {/* Form Container */}
            <div className="relative bg-[#0A0E27]/90 backdrop-blur-md border border-[#00D9FF]/30 p-8 rounded-xl shadow-2xl z-10">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00D9FF]"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00D9FF]"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00D9FF]"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00D9FF]"></div>

              <div className="text-center mb-8">
                <div className="flex justify-center mb-2">
                  <Activity className="w-8 h-8 text-[#9D4EDD] animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wider">LOGIN PORTAL</h2>
                <p className="text-[#00D9FF]/60 text-xs tracking-widest mt-1">EMPIRE LEADS HUB v2.0</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
                <div className="space-y-2">
                  <label className="text-xs text-[#00D9FF]/80 uppercase tracking-widest pl-1">Identify User</label>
                  <div className="relative group z-30">
                    <div className="absolute inset-0 bg-[#00D9FF]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md blur-md pointer-events-none"></div>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00D9FF]/70 z-40 pointer-events-none" />
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={handleUsernameChange}
                      className="w-full bg-[#050A18] border border-[#00D9FF]/30 text-white pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-[#00D9FF] focus:shadow-[0_0_10px_rgba(0,217,255,0.3)] transition-all placeholder:text-gray-700 font-mono relative z-30"
                      placeholder="USERNAME"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#00D9FF]/80 uppercase tracking-widest pl-1">Access Code</label>
                  <div className="relative group z-30">
                    <div className="absolute inset-0 bg-[#9D4EDD]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md blur-md pointer-events-none"></div>
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#00D9FF]/70 z-40 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full bg-[#050A18] border border-[#00D9FF]/30 text-white pl-10 pr-12 py-3 rounded-md focus:outline-none focus:border-[#9D4EDD] focus:shadow-[0_0_10px_rgba(157,78,221,0.3)] transition-all placeholder:text-gray-700 font-mono relative z-30"
                      placeholder="PASSWORD"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00D9FF]/50 hover:text-[#00D9FF] transition-colors z-40 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00D9FF]/80 to-[#9D4EDD]/80 hover:from-[#00D9FF] hover:to-[#9D4EDD] text-white font-bold py-6 rounded-md shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] border border-white/10 transition-all duration-300 relative overflow-hidden group z-30 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  {loading ? (
                      <span className="flex items-center justify-center gap-2 tracking-widest animate-pulse">
                        <Cpu className="w-4 h-4 animate-spin" /> PROCESSING...
                      </span>
                  ) : (
                      <span className="tracking-[0.2em]">INITIALIZE LINK</span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#00D9FF]/20 text-center relative z-20">
                 <div className="inline-block px-3 py-1 bg-[#050A18]/80 border border-[#00D9FF]/20 rounded text-[10px] text-[#00D9FF]/50 font-mono">
                    <p className="mb-1">SYSTEM CREDENTIALS</p>
                    <div className="flex gap-4 opacity-70">
                      <span>ID: admin</span>
                      <span>KEY: empire2025</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;