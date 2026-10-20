import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  passwordRecovery: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);