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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ADMIN_EMAIL, useAuth } from "../context/AuthContext";

const ADMIN_PASSWORD = "RDS@2012";
const RECOVERY_CODE = "Inanis";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function EmailTab({
  onSuccess,
  onClose,
}: { onSuccess?: () => void; onClose: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(email))
      newErrors.email = "Enter a valid email address";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    const trimmedEmail = email.trim().toLowerCase();
    if (
      trimmedEmail === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      signIn(ADMIN_EMAIL, null);
      toast.success("Welcome back, Admin! 👋");
      onClose();
      onSuccess?.();
    } else if (isValidEmail(email) && password.trim()) {
      // Guest sign-in — any valid email + non-empty password
      signIn(trimmedEmail, null);
      toast.success("Welcome back!");
      onClose();
      onSuccess?.();
    } else {
      setErrors({ password: "Invalid email or password" });
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryCode === RECOVERY_CODE) {
      signIn(ADMIN_EMAIL, null);
      toast.success("Recovery successful. Welcome back, Admin!");
      onClose();
      onSuccess?.();
    } else {
      setErrors({ recovery: "Incorrect recovery code" });
    }
  };

  if (forgotMode) {
    return (
      <form onSubmit={handleRecovery} className="space-y-4">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
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
                if (errors.recovery) setErrors({});
              }}
              placeholder="Enter recovery code"
              className="pl-9 bg-white/70"
              data-ocid="signin.recovery_input"
              autoComplete="off"
            />
          </div>
          {errors.recovery && (
            <p
              className="text-destructive text-xs mt-1 font-body"
              data-ocid="signin.recovery_error"
            >
              {errors.recovery}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl font-sans-display"
            onClick={() => {
              setForgotMode(false);
              setRecoveryCode("");
              setErrors({});
            }}
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

  return (
    <form onSubmit={handleEmailSignIn} className="space-y-4">
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
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
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
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
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

function PhoneTab({
  onSuccess,
  onClose,
}: { onSuccess?: () => void; onClose: () => void }) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    signIn("", phone);
    toast.success("Signed in!");
    onClose();
    onSuccess?.();
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
              if (error) setError("");
            }}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            autoComplete="tel"
            className="pl-9 bg-white/70"
            data-ocid="signin.phone_input"
          />
        </div>
        {error && (
          <p
            className="text-destructive text-xs mt-1 font-body"
            data-ocid="signin.phone_error"
          >
            {error}
          </p>
        )}
      </div>
      <div
        className="flex items-start gap-2 p-3 rounded-xl text-xs font-body"
        style={{
          background: "rgba(16, 185, 129, 0.06)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        }}
      >
        <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-emerald-800">
          Enter your phone number to sign in as a guest and place orders.
        </p>
      </div>
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
        {/* Glass morphism wrapper */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.85)",
            boxShadow:
              "0 32px 64px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          {/* Forest green accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.34 0.095 155), oklch(0.42 0.1 155))",
            }}
          />

          <div className="p-6 pt-7">
            <DialogHeader className="mb-6">
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
                Sign In to Order
              </DialogTitle>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Create a free account to place and track your orders.
              </p>
            </DialogHeader>

            <Tabs defaultValue="email">
              <TabsList
                className="grid grid-cols-2 w-full mb-6 bg-muted/50 rounded-xl"
                data-ocid="signin.tab_list"
              >
                <TabsTrigger
                  value="email"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="signin.email_tab"
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  Email
                </TabsTrigger>
                <TabsTrigger
                  value="phone"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="signin.phone_tab"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Phone Number
                </TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <EmailTab onSuccess={onSuccess} onClose={onClose} />
              </TabsContent>
              <TabsContent value="phone">
                <PhoneTab onSuccess={onSuccess} onClose={onClose} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
