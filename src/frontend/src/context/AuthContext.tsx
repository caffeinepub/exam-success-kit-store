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
  name: "auth_name",
  loggedIn: "auth_logged_in",
} as const;

// Registered customer accounts stored in localStorage
const ACCOUNTS_KEY = "examkit_accounts";

interface Account {
  name: string;
  email: string;
  phone: string;
  password: string;
}

function getAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccount(account: Account) {
  const accounts = getAccounts();
  const existing = accounts.findIndex(
    (a) =>
      (account.email && a.email === account.email) ||
      (account.phone && a.phone === account.phone),
  );
  if (existing >= 0) {
    accounts[existing] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAccount(identifier: string, password: string): Account | null {
  const accounts = getAccounts();
  return (
    accounts.find(
      (a) =>
        (a.email === identifier || a.phone === identifier) &&
        a.password === password,
    ) || null
  );
}

function accountExists(email: string, phone: string): boolean {
  const accounts = getAccounts();
  return accounts.some(
    (a) => (email && a.email === email) || (phone && a.phone === phone),
  );
}

interface AuthState {
  isLoggedIn: boolean;
  userEmail: string | null;
  userPhone: string | null;
  userName: string | null;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, phone: string | null, name?: string) => void;
  signOut: () => void;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => { success: boolean; error?: string };
  loginWithCredentials: (
    identifier: string,
    password: string,
  ) => { success: boolean; error?: string };
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
        userName: null,
        isAdmin: false,
      };
    const email = sessionStorage.getItem(SESSION_KEYS.email) || null;
    const phone = sessionStorage.getItem(SESSION_KEYS.phone) || null;
    const name = sessionStorage.getItem(SESSION_KEYS.name) || null;
    return {
      isLoggedIn: true,
      userEmail: email || null,
      userPhone: phone || null,
      userName: name || null,
      isAdmin: email === ADMIN_EMAIL,
    };
  } catch {
    return {
      isLoggedIn: false,
      userEmail: null,
      userPhone: null,
      userName: null,
      isAdmin: false,
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(readSession);

  useEffect(() => {
    setState(readSession());
  }, []);

  const signIn = useCallback(
    (email: string, phone: string | null, name?: string) => {
      try {
        sessionStorage.setItem(SESSION_KEYS.loggedIn, "1");
        sessionStorage.setItem(SESSION_KEYS.email, email || "");
        sessionStorage.setItem(SESSION_KEYS.phone, phone || "");
        sessionStorage.setItem(SESSION_KEYS.name, name || "");
      } catch {
        // sessionStorage unavailable
      }
      setState({
        isLoggedIn: true,
        userEmail: email || null,
        userPhone: phone || null,
        userName: name || null,
        isAdmin: email === ADMIN_EMAIL,
      });
    },
    [],
  );

  const register = useCallback(
    (
      name: string,
      email: string,
      phone: string,
      password: string,
    ): { success: boolean; error?: string } => {
      if (!name.trim()) return { success: false, error: "Name is required" };
      if (!email.trim() && !phone.trim())
        return { success: false, error: "Email or phone is required" };
      if (!password.trim())
        return { success: false, error: "Password is required" };
      if (password.length < 6)
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };

      // Block admin email from registering as a customer
      if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return { success: false, error: "This email is not available" };
      }

      if (accountExists(email.trim().toLowerCase(), phone.trim())) {
        return {
          success: false,
          error: "An account with this email or phone already exists",
        };
      }

      const account: Account = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      };
      saveAccount(account);

      // Auto sign-in after registration
      signIn(account.email || "", account.phone || null, account.name);
      return { success: true };
    },
    [signIn],
  );

  const loginWithCredentials = useCallback(
    (
      identifier: string,
      password: string,
    ): { success: boolean; error?: string } => {
      const trimmed = identifier.trim().toLowerCase();

      // Admin login
      if (trimmed === ADMIN_EMAIL.toLowerCase()) {
        if (password === "RDS@2012") {
          signIn(ADMIN_EMAIL, null, "Admin");
          return { success: true };
        }
        return { success: false, error: "Invalid email or password" };
      }

      // Customer login
      const account = findAccount(trimmed, password);
      if (account) {
        signIn(account.email, account.phone || null, account.name);
        return { success: true };
      }
      return { success: false, error: "Invalid email/phone or password" };
    },
    [signIn],
  );

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEYS.loggedIn);
      sessionStorage.removeItem(SESSION_KEYS.email);
      sessionStorage.removeItem(SESSION_KEYS.phone);
      sessionStorage.removeItem(SESSION_KEYS.name);
      sessionStorage.removeItem("adminUnlocked");
    } catch {
      // sessionStorage unavailable
    }
    setState({
      isLoggedIn: false,
      userEmail: null,
      userPhone: null,
      userName: null,
      isAdmin: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signOut, register, loginWithCredentials }}
    >
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
