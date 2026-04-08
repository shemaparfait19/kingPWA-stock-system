'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleClearSession = useCallback(() => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    setUser(null);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Hydrate from localStorage immediately for a fast UI
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const cached = JSON.parse(storedUserData);
            setUser(cached);
          } catch {
            localStorage.removeItem('userData');
          }
        }

        // 2. ALWAYS verify with the server — this is the source of truth.
        //    It checks the real NextAuth JWT cookie against the DB.
        const res = await fetch('/api/auth/me');

        if (res.ok) {
          const { user: freshUser } = await res.json();
          // Merge server fields (id, role, branchId) with any extra local fields.
          // Also patch localStorage so the cache stays fresh.
          setUser((prev) => {
            const merged = { ...(prev || {}), ...freshUser };
            localStorage.setItem('userData', JSON.stringify(merged));
            if (freshUser.email) localStorage.setItem('userEmail', freshUser.email);
            return merged as User;
          });
        } else {
          // Session is invalid (cookie expired, user deactivated, etc.)
          handleClearSession();
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Network error — fall back to cache so the app still works offline-ish.
        // We do NOT clear localStorage on network failure.
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [handleClearSession]);

  // Redirect logic — runs whenever user/loading/pathname change
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const handleSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('userEmail', newUser.email);
      localStorage.setItem('userData', JSON.stringify(newUser));
    } else {
      handleClearSession();
    }
  }, [handleClearSession]);

  const handleSignOut = useCallback(async () => {
    // Clear NextAuth session cookie
    await nextAuthSignOut({ redirect: false });
    // Clear local state & storage
    handleClearSession();
    router.push('/login');
  }, [handleClearSession, router]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}
