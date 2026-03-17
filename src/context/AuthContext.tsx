"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: any | null; // This will be the DB user profile
  supabaseUser: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const dbUser = await res.json();
        setUser(dbUser);
        return dbUser;
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile();
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile();
      } else {
        setUser(null);
      }
      
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        router.push('/login');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, router, supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      isLoading, 
      signOut,
      refreshProfile: fetchProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
