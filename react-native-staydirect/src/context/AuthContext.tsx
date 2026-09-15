import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types/database.types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    phone?: string,
    collegeOrCompany?: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  switchDevRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: 'student',
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  resetPassword: async () => ({ error: null }),
  switchDevRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
        setRole(data.role as UserRole);
      } else {
        // Fallback default profile
        setProfile({
          id: userId,
          role: 'student',
          full_name: 'StayDirect Student',
          city: 'Pune',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Error fetching profile from Supabase:', e);
    }
  };

  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userRole: UserRole,
    phone?: string,
    collegeOrCompany?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: userRole,
            phone: phone || '',
            college_or_company: collegeOrCompany || '',
          },
        },
      });

      if (error) return { error: new Error(error.message) };

      if (data.user) {
        // Explicit profile creation in case trigger delay
        await supabase.from('profiles').upsert({
          id: data.user.id,
          role: userRole,
          full_name: fullName,
          phone: phone || null,
          college_or_company: collegeOrCompany || null,
          city: 'Pune',
          is_verified: userRole === 'student',
        });
      }

      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole('student');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const switchDevRole = (newRole: UserRole) => {
    setRole(newRole);
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        resetPassword,
        switchDevRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
