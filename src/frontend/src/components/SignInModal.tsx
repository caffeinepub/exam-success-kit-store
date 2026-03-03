import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ADMIN_EMAIL, useAuth } from "../context/AuthContext";

const RECOVERY_CODE = "Inanis";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Forgot / Recovery (admin only) ─────────────────────────────────────────
function ForgotPasswordForm({
  onBack,
  onSuccess,
}: { onBack: () => void; onSuccess: () => void }) {
  const { signIn } = useAuth();
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryCode === RECOVERY_CODE) {
      signIn(ADMIN_EMAIL, null, "Admin");
      toast.success("Recovery successful. Welcome back, Admin!");
      onSuccess();
    } else {
      setError("Incorrect recovery code");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
        }}
      >
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm font-body text-amber-800">
          Enter your recovery code to regain access.
        </p>
      </div>
      <div>
        <Label
          htmlFor="recovery-code"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Recovery Code
        </Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="recovery-code"
            type="password"
            value={recoveryCode}
            onChange={(e) => {
              setRecoveryCode(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter recovery code"
            className="pl-9 bg-white/70"
            data-ocid="signin.recovery_input"
            autoComplete="off"
          />
        </div>
        {error && (
          <p
            className="text-destructive text-xs mt-1 font-body"
            data-ocid="signin.recovery_error"
          >
            {error}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl font-sans-display"
          onClick={onBack}
          data-ocid="signin.recovery_cancel_button"
        >
          Back to Sign In
        </Button>
        <Button
          type="submit"
          className="flex-1 rounded-xl font-sans-display font-bold"
          style={{
            background: "oklch(0.78 0.12 72)",
            color: "oklch(0.19 0.035 155)",
          }}
          data-ocid="signin.recovery_submit_button"
        >
          Recover Access
        </Button>
      </div>
    </form>
  );
}

// ── Sign In with Email ──────────────────────────────────────────────────────
function SignInEmailTab({
  onSuccess,
  onClose,
}: { onSuccess?: () => void; onClose: () => void }) {
  const { loginWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(email)) newErrors.email = "Enter a valid email";
    if (!password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    const result = loginWithCredentials(email.trim(), password);
    if (result.success) {
      toast.success("Welcome back!");
      onClose();
      onSuccess?.();
    } else {
      setErrors({ password: result.error || "Invalid credentials" });
    }
  };

  if (forgotMode) {
    return (
      <ForgotPasswordForm
        onBack={() => {
          setForgotMode(false);
          setErrors({});
        }}
        onSuccess={() => {
          onClose();
          onSuccess?.();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <Label
          htmlFor="signin-email"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: "" }));
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className="pl-9 bg-white/70"
            data-ocid="signin.email_input"
          />
        </div>
        {errors.email && (
          <p
            className="text-destructive text-xs mt-1 font-body"
            data-ocid="signin.email_error"
          >
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <Label
          htmlFor="signin-password"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pl-9 pr-10 bg-white/70"
            data-ocid="signin.password_input"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            className="text-destructive text-xs mt-1 font-body"
            data-ocid="signin.password_error"
          >
            {errors.password}
          </p>
        )}
      </div>
      {/* Forgot password only for admin account */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => {
            setForgotMode(true);
            setErrors({});
          }}
          className="text-xs text-muted-foreground hover:text-foreground font-body underline underline-offset-2 transition-colors"
          data-ocid="signin.forgot_password_button"
        >
          Forgot Password?
        </button>
      )}
      <Button
        type="submit"
        className="w-full font-sans-display font-bold py-3 text-base rounded-xl"
        style={{ background: "oklch(0.34 0.095 155)", color: "white" }}
        data-ocid="signin.email_submit_button"
      >
        Sign In
      </Button>
    </form>
  );
}

// ── Sign In with Phone ──────────────────────────────────────────────────────
function SignInPhoneTab({
  onSuccess,
  onClose,
}: { onSuccess?: () => void; onClose: () => void }) {
  const { loginWithCredentials } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!/^\d{10}$/.test(phone))
      newErrors.phone = "Enter a valid 10-digit number";
    if (!password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    const result = loginWithCredentials(phone, password);
    if (result.success) {
      toast.success("Welcome back!");
      onClose();
      onSuccess?.();
    } else {
      setErrors({ password: result.error || "Invalid credentials" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label
          htmlFor="signin-phone"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signin-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
              if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
            }}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            autoComplete="tel"
            className="pl-9 bg-white/70"
            data-ocid="signin.phone_input"
          />
        </div>
        {errors.phone && (
          <p
            className="text-destructive text-xs mt-1 font-body"
            data-ocid="signin.phone_error"
          >
            {errors.phone}
          </p>
        )}
      </div>
      <div>
        <Label
          htmlFor="signin-phone-password"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="signin-phone-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="pl-9 pr-10 bg-white/70"
            data-ocid="signin.phone_password_input"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            className="text-destructive text-xs mt-1 font-body"
            data-ocid="signin.phone_password_error"
          >
            {errors.password}
          </p>
        )}
      </div>
      {/* No forgot password for customers signing in by phone */}
      <Button
        type="submit"
        className="w-full font-sans-display font-bold py-3 text-base rounded-xl"
        style={{ background: "oklch(0.34 0.095 155)", color: "white" }}
        data-ocid="signin.phone_submit_button"
      >
        Sign In with Phone
      </Button>
    </form>
  );
}

// ── Create Account ──────────────────────────────────────────────────────────
function CreateAccountTab({
  onSuccess,
  onClose,
}: { onSuccess?: () => void; onClose: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim() && !phone.trim())
      newErrors.email = "Email or phone is required";
    if (email.trim() && !isValidEmail(email))
      newErrors.email = "Enter a valid email address";
    if (phone.trim() && !/^\d{10}$/.test(phone))
      newErrors.phone = "Enter a valid 10-digit number";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    const result = register(name, email, phone, password);
    if (result.success) {
      toast.success(`Welcome, ${name.split(" ")[0]}! Account created.`);
      onClose();
      onSuccess?.();
    } else {
      setErrors({ general: result.error || "Could not create account" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {errors.general && (
        <div
          className="p-3 rounded-xl text-xs font-body text-red-700 bg-red-50 border border-red-200"
          data-ocid="register.general_error"
        >
          {errors.general}
        </div>
      )}
      <div>
        <Label
          htmlFor="reg-name"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Full Name
        </Label>
        <Input
          id="reg-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: "" }));
          }}
          placeholder="Your full name"
          autoComplete="name"
          className="bg-white/70"
          data-ocid="register.name_input"
        />
        {errors.name && (
          <p className="text-destructive text-xs mt-1 font-body">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <Label
          htmlFor="reg-email"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Email{" "}
          <span className="text-muted-foreground font-normal">
            (or use phone)
          </span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: "" }));
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className="pl-9 bg-white/70"
            data-ocid="register.email_input"
          />
        </div>
        {errors.email && (
          <p className="text-destructive text-xs mt-1 font-body">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <Label
          htmlFor="reg-phone"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Phone{" "}
          <span className="text-muted-foreground font-normal">
            (optional if email given)
          </span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
              if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
            }}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            autoComplete="tel"
            className="pl-9 bg-white/70"
            data-ocid="register.phone_input"
          />
        </div>
        {errors.phone && (
          <p className="text-destructive text-xs mt-1 font-body">
            {errors.phone}
          </p>
        )}
      </div>
      <div>
        <Label
          htmlFor="reg-password"
          className="font-sans-display font-semibold text-sm mb-1.5 block text-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: "" }));
            }}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className="pl-9 pr-10 bg-white/70"
            data-ocid="register.password_input"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-xs mt-1 font-body">
            {errors.password}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full font-sans-display font-bold py-3 text-base rounded-xl mt-1"
        style={{ background: "oklch(0.34 0.095 155)", color: "white" }}
        data-ocid="register.submit_button"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Create Account
      </Button>
    </form>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────
export default function SignInModal({
  open,
  onClose,
  onSuccess,
}: SignInModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent
        className="max-w-sm w-full p-0 border-0 bg-transparent shadow-none"
        data-ocid="signin.modal"
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow:
              "0 32px 64px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.34 0.095 155), oklch(0.42 0.1 155))",
            }}
          />
          <div className="p-6 pt-7">
            <DialogHeader className="mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.34 0.095 155 / 0.12), oklch(0.42 0.1 155 / 0.06))",
                  border: "1px solid oklch(0.34 0.095 155 / 0.25)",
                }}
              >
                <Lock className="w-6 h-6 text-forest" />
              </div>
              <DialogTitle className="font-display text-2xl text-foreground">
                Welcome
              </DialogTitle>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Sign in or create a free account to place and track orders.
              </p>
            </DialogHeader>

            <Tabs defaultValue="signin-email">
              <TabsList
                className="grid grid-cols-3 w-full mb-5 bg-muted/50 rounded-xl"
                data-ocid="signin.tab_list"
              >
                <TabsTrigger
                  value="signin-email"
                  className="rounded-lg font-sans-display text-xs"
                  data-ocid="signin.email_tab"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </TabsTrigger>
                <TabsTrigger
                  value="signin-phone"
                  className="rounded-lg font-sans-display text-xs"
                  data-ocid="signin.phone_tab"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Phone
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg font-sans-display text-xs"
                  data-ocid="signin.register_tab"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Register
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin-email">
                <SignInEmailTab onSuccess={onSuccess} onClose={onClose} />
              </TabsContent>
              <TabsContent value="signin-phone">
                <SignInPhoneTab onSuccess={onSuccess} onClose={onClose} />
              </TabsContent>
              <TabsContent value="register">
                <CreateAccountTab onSuccess={onSuccess} onClose={onClose} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
