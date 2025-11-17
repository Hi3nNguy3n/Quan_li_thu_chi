import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { loginWithGoogle, fetchProfile } from '../api';
import { setAccessToken } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem('qlct_user');
    return cached ? (JSON.parse(cached) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('qlct_token');
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccessToken(token);
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await fetchProfile();
        setUser(profile);
        localStorage.setItem('qlct_user', JSON.stringify(profile));
      } catch (error) {
        console.error(error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const handleLogout = useCallback(() => {
    setToken(null);
    setAccessToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qlct_user');
      localStorage.removeItem('qlct_token');
    }
  }, []);

  const login = useCallback(
    async (idToken: string) => {
      setLoading(true);
      try {
        const { token: jwt, user: profile } = await loginWithGoogle(idToken);
        setToken(jwt);
        setAccessToken(jwt);
        setUser(profile);
        localStorage.setItem('qlct_user', JSON.stringify(profile));
        localStorage.setItem('qlct_token', jwt);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
