import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { pullCloudData, setUserId, flushSyncQueueForUser } from './studyStore';
import { setActiveUser, getActiveUserId, isGuest, migrateGuestToUser, getExistingGuestId } from './identityManager';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // ── Xử lý session (không reload trang) ──
  const handleSession = useCallback(async (session) => {
    const u = session?.user || null;
    setUser(u);
    
    // Chuyển namespace sang user mới (hoặc guest nếu logout)
    setActiveUser(u ? u.id : null);
    setUserId(u ? u.id : null);
    
    if (session) {
      setSyncing(true);
      try {
        await pullCloudData(); // Ưu tiên cloud (ghi đè local)
      } catch (e) {
        console.warn('[Auth] Pull cloud data error:', e);
      }
      setSyncing(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  // ── Đăng nhập ──
  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  // ── Đăng ký (có Atomic Migration từ Guest) ──
  const signUp = useCallback(async ({ email, password }) => {
    const hadGuestData = !!getExistingGuestId();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    // Atomic Migration: chuyển dữ liệu Guest → tài khoản mới
    if (hadGuestData && data?.user?.id) {
      const result = migrateGuestToUser(data.user.id);
      console.log(`✨ [Auth] Migrated guest data:`, result);
    }
    
    return data;
  }, []);

  // ── Đăng xuất an toàn (flush sync queue trước) ──
  const signOut = useCallback(async () => {
    const currentId = getActiveUserId();
    
    // Flush sync queue của user hiện tại trước khi đăng xuất
    if (!isGuest()) {
      try {
        await flushSyncQueueForUser(currentId);
      } catch (e) {
        console.warn('[Auth] Flush sync queue error:', e);
      }
    }
    
    await supabase.auth.signOut();
    // handleSession sẽ được gọi tự động qua onAuthStateChange
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, syncing, signIn, signUp, signOut, isGuest: isGuest() }}>
      {children}
    </AuthContext.Provider>
  );
};
