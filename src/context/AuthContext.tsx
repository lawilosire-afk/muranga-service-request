import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';
import { AuthContext } from './AuthContextValue';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!active) return;

        if (error) {
          console.error('Error fetching profile:', error.message);
          setProfile(null);
        } else {
          setProfile(data as Profile | null);
        }
      } catch (error: unknown) {
        if (!active) return;

        console.error('Unexpected error fetching profile:', error);
        setProfile(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error retrieving session:', error.message);
        }

        if (!active) return;

        const currentUser = data.session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (error: unknown) {
        if (!active) return;

        console.error('Error initializing authentication:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      void loadProfile(currentUser.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}