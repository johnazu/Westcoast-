import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // merged { id, email, firstName, lastName, role }
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    try {
      const profile = await authService.getProfile(authUser.id);
      if (profile && profile.is_active) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session?.user).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { user: authUser, profile } = await authService.login(email, password);
    const merged = {
      id: authUser.id,
      email: authUser.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.role
    };
    setUser(merged);
    return merged;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
