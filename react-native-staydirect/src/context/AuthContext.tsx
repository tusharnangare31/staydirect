import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types/database.types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isSuspended: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInAsAdminDemo: () => Promise<void>;
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
  isAdmin: false,
  isSuspended: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signInAsAdminDemo: async () => {},
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Check server-controlled admin access
      let serverIsAdmin = false;
      try {
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (adminRow && (adminRow.role === 'admin' || adminRow.role === 'super_admin')) {
          serverIsAdmin = true;
        }
      } catch (err) {
        // Handled silently
      }

      // Check JWT custom claims as well
      const userMeta = (session?.user?.app_metadata as any)?.role;
      if (userMeta === 'admin' || userMeta === 'super_admin') {
        serverIsAdmin = true;
      }

      if (data && !error) {
        const p = data as Profile;
        setProfile(p);
        setIsSuspended(!!p.is_suspended);
        setIsAdmin(serverIsAdmin);
        if (serverIsAdmin) {
          setRole('admin');
        } else {
          setRole(p.role as UserRole);
        }
      } else {
        // Fallback default profile
        setProfile({
          id: userId,
          role: 'student',
          full_name: 'StayDirect Student',
          city: 'Pune',
          is_verified: true,
          is_suspended: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsSuspended(false);
        setIsAdmin(serverIsAdmin);
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

  const signInAsAdminDemo = async () => {
    // Authenticate / set verified demo admin profile matching seed admin
    const adminId = '00000000-0000-0000-0000-000000000099';
    setIsAdmin(true);
    setIsSuspended(false);
    setRole('admin');
    setProfile({
      id: adminId,
      role: 'admin',
      full_name: 'StayDirect Super Admin',
      phone: '+919800000000',
      city: 'Pune',
      is_verified: true,
      is_suspended: false,
      college_or_company: 'StayDirect HQ Operations',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const switchDevRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setIsAdmin(true);
    }
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
        isAdmin,
        isSuspended,
        isLoading,
        signIn,
        signInAsAdminDemo,
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
