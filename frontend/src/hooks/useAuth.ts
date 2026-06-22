import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import { parseAccessToken } from "../services/auth.ts";
import type { AuthFormMode, AuthFormState } from "../components/AuthModal.tsx";
import type { User } from "../types.ts";

function readCachedUser(): User | null {
  const cachedUser = localStorage.getItem("ebay_clone_user");
  if (!cachedUser) return null;

  try {
    return JSON.parse(cachedUser);
  } catch (err) {
    console.error("Session recovery broken, deleting cache reference:", err);
    localStorage.removeItem("ebay_clone_user");
    return null;
  }
}

function getAuthMode(formData: FormData): AuthFormMode {
  return formData.get("mode") === "signup" ? "signup" : "login";
}

function getStringFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function useAuth(onLoggedIn: () => void) {
  const {
    login: loginWithContext,
    logout: logoutContext,
    register: registerWithContext,
  } = useAuthContext();
  const [currentUser, setCurrentUser] = useState<User | null>(readCachedUser);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);

  const syncUserProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch("/api/profile", {
        headers: { "Authorization": `Bearer ${userId}` },
      });
      if (res.ok) {
        const fullProfRef = await res.json();
        setCurrentUser(fullProfRef);
        localStorage.setItem("ebay_clone_user", JSON.stringify(fullProfRef));
      }
    } catch (e) {
      console.error("Profile synchronization discrepancies:", e);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      syncUserProfile(currentUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAuthModal = useCallback(() => {
    setIsSignUpMode(false);
    setShowAuthModal(true);
  }, []);

  const handleAuthAction = useCallback(
    async (_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> => {
      const mode = getAuthMode(formData);
      const email = getStringFormValue(formData, "email");
      const password = getStringFormValue(formData, "password");

      if (!email || !password) {
        return {
          mode,
          error: "Email and password are required.",
          message: null,
        };
      }

      if (mode === "signup") {
        const fullName = getStringFormValue(formData, "fullName");
        const confirmPassword = getStringFormValue(formData, "confirmPassword");

        if (!fullName) {
          return {
            mode,
            error: "Full name is required.",
            message: null,
          };
        }

        if (password !== confirmPassword) {
          return {
            mode,
            error: "Passwords do not match.",
            message: null,
          };
        }

        try {
          await registerWithContext({
            fullName,
            email,
            password,
          });

          setTimeout(() => {
            setIsSignUpMode(false);
          }, 2000);

          return {
            mode,
            error: null,
            message: "Successful! Redirecting to login context...",
          };
        } catch (err) {
          console.error(err);

          return {
            mode,
            error: err instanceof Error ? err.message : "Auth server timed out or failed.",
            message: null,
          };
        }
      }

      try {
        const session = await loginWithContext({ email, password });
        const claims = parseAccessToken(session.AccessToken);
        const nextUser: User = {
          id: String(claims?.sub ?? email),
          email: claims?.email ?? email,
          fullName: claims?.fullName ?? email,
        };

        setCurrentUser(nextUser);
        localStorage.setItem("ebay_clone_user", JSON.stringify(nextUser));
        setShowAuthModal(false);
        onLoggedIn();

        return {
          mode,
          error: null,
          message: "Login successful.",
        };
      } catch (err) {
        console.error(err);

        return {
          mode,
          error: err instanceof Error ? err.message : "Connection refused by Auth provider.",
          message: null,
        };
      }
    },
    [loginWithContext, onLoggedIn, registerWithContext],
  );

  const updateProfile = useCallback(
    async (updatedData: { fullName: string; address: string; paymentDetails: User["paymentDetails"] }) => {
      if (!currentUser) return;

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Update operation failed.");
      }

      setCurrentUser(data.user);
      localStorage.setItem("ebay_clone_user", JSON.stringify(data.user));
    },
    [currentUser],
  );

  const logout = useCallback(() => {
    logoutContext();
    setCurrentUser(null);
    localStorage.removeItem("ebay_clone_user");
  }, [logoutContext]);

  return {
    currentUser,
    authModal: {
      showAuthModal,
      setShowAuthModal,
      isSignUpMode,
      setIsSignUpMode,
      handleAuthAction,
    },
    openAuthModal,
    syncUserProfile,
    updateProfile,
    logout,
  };
}
