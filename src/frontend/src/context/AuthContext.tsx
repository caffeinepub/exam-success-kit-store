import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ADMIN_EMAIL = "rudraansh.dev.singh@gmail.com";

const SESSION_KEYS = {
  email: "auth_email",
  phone: "auth_phone",
  loggedIn: "auth_logged_in",
} as const;

interface AuthState {
  isLoggedIn: boolean;
  userEmail: string | null;
  userPhone: string | null;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, phone: string | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthState {
  try {
    const loggedIn = sessionStorage.getItem(SESSION_KEYS.loggedIn) === "1";
    if (!loggedIn)
      return {
        isLoggedIn: false,
        userEmail: null,
        userPhone: null,
        isAdmin: false,
      };
    const email = sessionStorage.getItem(SESSION_KEYS.email) || null;
    const phone = sessionStorage.getItem(SESSION_KEYS.phone) || null;
    return {
      isLoggedIn: true,
      userEmail: email || null,
      userPhone: phone || null,
      isAdmin: email === ADMIN_EMAIL,
    };
  } catch {
    return {
      isLoggedIn: false,
      userEmail: null,
      userPhone: null,
      isAdmin: false,
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(readSession);

  // Restore from sessionStorage on mount (handles page refreshes)
  useEffect(() => {
    setState(readSession());
  }, []);

  const signIn = useCallback((email: string, phone: string | null) => {
    try {
      sessionStorage.setItem(SESSION_KEYS.loggedIn, "1");
      sessionStorage.setItem(SESSION_KEYS.email, email || "");
      sessionStorage.setItem(SESSION_KEYS.phone, phone || "");
    } catch {
      // sessionStorage unavailable
    }
    setState({
      isLoggedIn: true,
      userEmail: email || null,
      userPhone: phone || null,
      isAdmin: email === ADMIN_EMAIL,
    });
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEYS.loggedIn);
      sessionStorage.removeItem(SESSION_KEYS.email);
      sessionStorage.removeItem(SESSION_KEYS.phone);
      // Also clear admin passcode session
      sessionStorage.removeItem("adminUnlocked");
    } catch {
      // sessionStorage unavailable
    }
    setState({
      isLoggedIn: false,
      userEmail: null,
      userPhone: null,
      isAdmin: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { ADMIN_EMAIL };
