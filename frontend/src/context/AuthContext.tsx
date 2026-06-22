/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AxiosError } from "axios";
import { loginUser, parseAccessToken, registerUser } from "../services/auth.ts";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "../services/auth.ts";
import { setAuthHeader } from "../services/api.ts";

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

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

function readStoredAccessToken() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  setAuthHeader(token);
  return token;
}

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    if (typeof responseData === "string") {
      return responseData.trim() || "Authentication request failed.";
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      "error" in responseData &&
      typeof responseData.error === "string"
    ) {
      return responseData.error;
    }

    return error.message || "Authentication request failed.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Authentication request failed.";
}

function userFromLoginResponse(session: LoginResponse): AuthUser | null {
  const claims = parseAccessToken(session.AccessToken);
  if (!claims?.email || !claims.fullName) return null;

  return {
    ID: Number(claims.sub ?? 0),
    Email: claims.email,
    FullName: claims.fullName,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [accessToken, setAccessToken] = useState<string | null>(readStoredAccessToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }

    setUser(nextUser);
  }, []);

  const persistAccessToken = useCallback((nextAccessToken: string | null) => {
    if (nextAccessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    setAuthHeader(nextAccessToken);
    setAccessToken(nextAccessToken);
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true);
      clearError();

      try {
        const registeredUser = await registerUser(payload);
        persistUser(registeredUser);
        return registeredUser;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message, { cause: err });
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, persistUser],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      clearError();

      try {
        const session = await loginUser(payload);
        persistAccessToken(session.AccessToken);

        const sessionUser = userFromLoginResponse(session);
        if (sessionUser) {
          persistUser(sessionUser);
        }

        return session;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message, { cause: err });
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, persistAccessToken, persistUser],
  );

  const logout = useCallback(() => {
    persistAccessToken(null);
    persistUser(null);
    clearError();
  }, [clearError, persistAccessToken, persistUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      error,
      register,
      login,
      logout,
      clearError,
    }),
    [accessToken, clearError, error, isLoading, login, logout, register, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
