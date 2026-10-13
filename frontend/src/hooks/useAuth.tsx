import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { AuthUser } from "../lib/api";
import { isTokenExpired, setUnauthorizedHandler } from "../lib/api";

type AuthenticationContextValue = {
  authenticatedUser: AuthUser | null;
  authenticationToken: string | null;
  setAuthentication: (
    authenticationToken: string,
    authenticatedUser: AuthUser,
  ) => void;
  logout: () => void;
};

const AuthenticationContext = createContext<AuthenticationContextValue>({
  authenticatedUser: null,
  authenticationToken: null,
  setAuthentication: () => {},
  logout: () => {},
});

function decodeTokenExpiry(authenticationToken: string): number | null {
  try {
    const payloadSegment = authenticationToken.split(".")[1];
    if (!payloadSegment) return null;
    const decodedPayload = JSON.parse(
      atob(payloadSegment.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof decodedPayload.exp === "number"
      ? decodedPayload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(
    () => {
      try {
        return JSON.parse(localStorage.getItem("user") ?? "null");
      } catch {
        return null;
      }
    },
  );
  const [authenticationToken, setAuthenticationToken] = useState<string | null>(
    () => localStorage.getItem("token"),
  );
  const hasShownExpiredToastRef = useRef(false);

  const clearAuthenticationState = useCallback(() => {
    const currentUserRaw = localStorage.getItem("user");
    if (currentUserRaw)
      try {
        const parsedUser = JSON.parse(currentUserRaw) as AuthUser;
        localStorage.removeItem(`my-perms:${parsedUser.id}`);
      } catch {}
    if (authenticatedUser)
      try {
        localStorage.removeItem(`my-perms:${authenticatedUser.id}`);
      } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthenticationToken(null);
    setAuthenticatedUser(null);
  }, [authenticatedUser]);

  const logout = useCallback(() => {
    clearAuthenticationState();
  }, [clearAuthenticationState]);

  const handleUnauthorized = useCallback(() => {
    if (hasShownExpiredToastRef.current) return;
    hasShownExpiredToastRef.current = true;
    toast.error("Sesi habis, silakan login kembali");
    clearAuthenticationState();
    setTimeout(() => {
      hasShownExpiredToastRef.current = false;
    }, 2000);
  }, [clearAuthenticationState]);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  useEffect(() => {
    if (!authenticationToken) return;
    if (isTokenExpired(authenticationToken)) {
      handleUnauthorized();
      return;
    }
    const expiryTimestamp = decodeTokenExpiry(authenticationToken);
    if (expiryTimestamp === null) return;
    const delayUntilExpiry = expiryTimestamp - Date.now();
    if (delayUntilExpiry <= 0) {
      handleUnauthorized();
      return;
    }
    const expiryTimerId = window.setTimeout(
      () => handleUnauthorized(),
      delayUntilExpiry,
    );
    return () => window.clearTimeout(expiryTimerId);
  }, [authenticationToken, handleUnauthorized]);

  const contextValue = useMemo<AuthenticationContextValue>(
    () => ({
      authenticatedUser,
      authenticationToken,
      setAuthentication: (nextToken, nextUser) => {
        localStorage.setItem("token", nextToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
        setAuthenticationToken(nextToken);
        setAuthenticatedUser(nextUser);
        hasShownExpiredToastRef.current = false;
      },
      logout,
    }),
    [authenticatedUser, authenticationToken, logout],
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuth() {
  const authenticationContext = useContext(AuthenticationContext);
  return {
    authenticatedUser: authenticationContext.authenticatedUser,
    authenticationToken: authenticationContext.authenticationToken,
    setAuthentication: authenticationContext.setAuthentication,
    logout: authenticationContext.logout,
  };
}
