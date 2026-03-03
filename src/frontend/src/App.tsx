import { Toaster } from "@/components/ui/sonner";
import { FileText, LogOut, User } from "lucide-react";
import { useState } from "react";
import OrderModal from "./components/OrderModal";
import SignInModal from "./components/SignInModal";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminPage from "./pages/AdminPage";
import LandingPage from "./pages/LandingPage";
import PoliciesPage from "./pages/PoliciesPage";
import TrackOrderPage from "./pages/TrackOrderPage";

type Page = "home" | "track" | "admin" | "policies";

function AppShell() {
  const { isLoggedIn, isAdmin, userEmail, userPhone, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [defaultEdition, setDefaultEdition] = useState<
    "base" | "premium" | "elite"
  >("base");
  const [signInOpen, setSignInOpen] = useState(false);
  // Pending order edition to open after sign-in
  const [pendingEdition, setPendingEdition] = useState<
    "base" | "premium" | "elite" | null
  >(null);

  const openOrderModal = (edition: "base" | "premium" | "elite" = "base") => {
    if (!isLoggedIn) {
      setPendingEdition(edition);
      setSignInOpen(true);
      return;
    }
    setDefaultEdition(edition);
    setOrderModalOpen(true);
  };

  const handleSignInSuccess = () => {
    if (pendingEdition !== null) {
      setDefaultEdition(pendingEdition);
      setOrderModalOpen(true);
      setPendingEdition(null);
    }
  };

  const displayName = userEmail
    ? userEmail.split("@")[0]
    : userPhone
      ? userPhone.slice(-4)
      : null;

  const avatarLetter = userEmail
    ? userEmail[0].toUpperCase()
    : userPhone
      ? userPhone[0]
      : "?";

  return (
    <>
      <Toaster position="top-center" richColors />
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
        style={{
          background: "oklch(0.19 0.035 155 / 0.88)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentPage("home")}
            className="font-display text-xl font-bold text-white tracking-tight"
            data-ocid="nav.home_link"
          >
            Exam<span className="text-gold">Kit</span>
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage("track")}
              className="text-white/70 hover:text-white text-sm font-body transition-colors px-2 py-1"
              data-ocid="nav.track_link"
            >
              Track Order
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage("policies")}
              className="text-white/70 hover:text-white text-sm font-body transition-colors px-2 py-1 flex items-center gap-1"
              data-ocid="nav.policies_link"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Policies</span>
            </button>
            {/* Admin link — only visible when logged in as admin */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCurrentPage("admin")}
                className="text-white/70 hover:text-white text-sm font-body transition-colors px-2 py-1"
                data-ocid="nav.admin_link"
              >
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={() => openOrderModal("base")}
              className="bg-gold text-foreground text-sm font-semibold font-sans-display px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              data-ocid="nav.order_button"
            >
              Order Now
            </button>
            {/* Auth area */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 ml-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans-display text-white flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.34 0.095 155), oklch(0.42 0.1 155))",
                    border: "2px solid rgba(255,255,255,0.25)",
                  }}
                  title={displayName ?? ""}
                  data-ocid="nav.user_avatar"
                >
                  {avatarLetter}
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-white/60 hover:text-white text-xs font-body transition-colors flex items-center gap-1"
                  data-ocid="nav.signout_button"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingEdition(null);
                  setSignInOpen(true);
                }}
                className="text-white/70 hover:text-white text-sm font-body transition-colors px-2 py-1 flex items-center gap-1.5"
                data-ocid="nav.signin_button"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-14">
        {currentPage === "home" && (
          <LandingPage
            onOpenOrderModal={openOrderModal}
            onNavigatePolicies={() => setCurrentPage("policies")}
          />
        )}
        {currentPage === "track" && <TrackOrderPage />}
        {currentPage === "policies" && <PoliciesPage />}
        {currentPage === "admin" && (
          <AdminPage onOpenSignIn={() => setSignInOpen(true)} />
        )}
      </main>

      <OrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        defaultEdition={defaultEdition}
        onNavigatePolicies={() => {
          setOrderModalOpen(false);
          setCurrentPage("policies");
        }}
      />

      <SignInModal
        open={signInOpen}
        onClose={() => {
          setSignInOpen(false);
          setPendingEdition(null);
        }}
        onSuccess={handleSignInSuccess}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
