import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { pullCloudData, setUserId } from './studyStore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async (session) => {
      const u = session?.user || null;
      setUser(u);
      setUserId(u ? u.id : null); // Switch local storage context dynamically
      
      if (session) {
        const hasUpdates = await pullCloudData();
        if (hasUpdates) {
          window.location.reload(); // Reload to rehydrate the app with cloud data
        }
      }

      setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If user logs in (transition from null to user) or session refreshes
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
