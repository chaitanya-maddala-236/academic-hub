import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCurrentUser, logout as authLogout, isAuthenticated } from "@/services/auth.service";

type AppRole = 'admin' | 'faculty' | 'student' | 'public';

interface User {
  id: number;
  email: string;
  name: string;
  role: AppRole;
  department?: string;
}

interface AuthContextType {
  session: { user: User } | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  loading: true,
  signOut: async () => {},
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const initAuth = () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signOut = async () => {
    await authLogout();
    setUser(null);
  };

  const hasRole = (role: AppRole) => user?.role === role;

  const session = user ? { user } : null;
  const roles = user ? [user.role] : [];

  return (
    <AuthContext.Provider value={{ session, user, roles, loading, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
