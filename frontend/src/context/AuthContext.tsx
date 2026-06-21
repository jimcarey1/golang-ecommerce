import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { AuthUser, LoginResponse } from '../services/auth';

type AuthSession = AuthUser | LoginResponse | null;

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUserSession: (session: AuthSession) => void;
  logout: () => void;
};

const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function isLoginResponse(session: AuthSession): session is LoginResponse {
  return Boolean(session && 'AccessToken' in session);
}

function isAuthUser(session: AuthSession): session is AuthUser {
  return Boolean(session && 'Email' in session);
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );

  const setUserSession = useCallback((session: AuthSession) => {
    if (isLoginResponse(session)) {
      localStorage.setItem(ACCESS_TOKEN_KEY, session.AccessToken);
      api.defaults.headers.common.Authorization = `Bearer ${session.AccessToken}`;
      setAccessToken(session.AccessToken);
      return;
    }

    if (isAuthUser(session)) {
      localStorage.setItem(USER_KEY, JSON.stringify(session));
      setUser(session);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken || user),
      setUserSession,
      logout,
    }),
    [accessToken, logout, setUserSession, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
