import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const DEFAULT_SETTINGS = {
  general: { appName: 'Empire Systems', language: 'he', timezone: 'Asia/Jerusalem', dateFormat: 'DD/MM/YYYY' },
  theme: { mode: 'cyberpunk', neonIntensity: 80, glassmorphism: 60, accentColor: '#00D9FF' },
  interface: { sidebarPos: 'right', layout: 'normal', fontSize: 16, animSpeed: 1 },
  notifications: { enabled: true, sound: true, email: false, frequency: 'instant' },
  privacy: { analytics: true, cookies: true, thirdParty: false },
  performance: { cache: true, autoSave: 30, sync: true },
  advanced: { devMode: false, debugLogs: false, apiEndpoint: 'https://api.empire.com/v1' }
};

export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('empire_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('empire_settings', JSON.stringify(settings));
    applyTheme(settings.theme);
  }, [settings]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    // 1. Handle Mode (Light/Dark/Cyberpunk)
    root.classList.remove('light', 'dark', 'cyberpunk');
    root.classList.add(theme.mode);
    
    // Set base background based on mode
    if (theme.mode === 'light') {
       root.style.setProperty('--bg-primary', '#f3f4f6');
       root.style.setProperty('--text-primary', '#111827');
    } else if (theme.mode === 'dark') {
       root.style.setProperty('--bg-primary', '#0f172a');
       root.style.setProperty('--text-primary', '#f8fafc');
    } else { // Cyberpunk default
       root.style.setProperty('--bg-primary', '#0A0E27');
       root.style.setProperty('--text-primary', '#ffffff');
    }

    // 2. Handle Accent Color
    root.style.setProperty('--accent-color', theme.accentColor);
    
    // 3. Handle Neon Intensity (Affects box-shadows and borders)
    const intensity = theme.neonIntensity / 100;
    root.style.setProperty('--neon-glow', `0 0 ${10 * intensity}px ${theme.accentColor}`);
    root.style.setProperty('--neon-border-opacity', `${0.2 + (0.8 * intensity)}`);
    
    // 4. Handle Glassmorphism (Backdrop blur)
    const blurAmount = (theme.glassmorphism / 100) * 20; // Max 20px blur
    root.style.setProperty('--glass-blur', `${blurAmount}px`);
    root.style.setProperty('--glass-opacity', `${0.4 + (theme.glassmorphism / 200)}`);
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};