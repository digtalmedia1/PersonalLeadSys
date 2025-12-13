import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('empire_user');
      if (storedUser) {
        // Handle potential invalid JSON in local storage to prevent app crash
        try {
            const parsedUser = JSON.parse(storedUser);
            // Verify structure is somewhat correct
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.username) {
                console.log("Restoring session for user:", parsedUser.username);
                setUser(parsedUser);
            } else {
                // Invalid user object, clear it
                console.warn("Invalid user data found in storage, clearing.");
                localStorage.removeItem('empire_user');
            }
        } catch (e) {
            console.error("Failed to parse user data from local storage", e);
            localStorage.removeItem('empire_user');
        }
      }
    } catch (error) {
        console.error("Auth initialization error", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (username, password) => {
    try {
        console.log(`AuthContext: Attempting login for ${username}`);
        
        // Simple password check - in production this would authenticate against Supabase
        const defaultUsername = 'admin';
        const defaultPassword = 'empire2025';
        
        if (username === defaultUsername && password === defaultPassword) {
          const userData = {
            id: '1',
            username: username,
            email: 'admin@empireleads.com',
            role: 'admin',
            created_at: new Date().toISOString()
          };
          localStorage.setItem('empire_user', JSON.stringify(userData));
          setUser(userData);
          console.log("AuthContext: Login successful");
          return { success: true };
        }
        
        console.warn("AuthContext: Login failed - Invalid credentials");
        return { success: false, error: 'Invalid credentials' };
    } catch (error) {
        console.error("AuthContext: Login unexpected error", error);
        return { success: false, error: 'An unexpected error occurred during login' };
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    localStorage.removeItem('empire_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};