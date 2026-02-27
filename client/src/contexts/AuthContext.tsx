import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import type { User, Session, Subscription } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    let mounted = true;

    getSupabaseClient()
      .then(async (supabase) => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
        });

        subscriptionRef.current = subscription;
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    const supabase = await getSupabaseClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
