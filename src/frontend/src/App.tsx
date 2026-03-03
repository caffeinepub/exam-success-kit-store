import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import OrderModal from "./components/OrderModal";
import AdminPage from "./pages/AdminPage";
import LandingPage from "./pages/LandingPage";
import TrackOrderPage from "./pages/TrackOrderPage";

type Page = "home" | "track" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [defaultEdition, setDefaultEdition] = useState<
    "base" | "premium" | "elite"
  >("base");

  const openOrderModal = (edition: "base" | "premium" | "elite" = "base") => {
    setDefaultEdition(edition);
    setOrderModalOpen(true);
  };

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
          <div className="flex items-center gap-2 sm:gap-4">
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
              onClick={() => setCurrentPage("admin")}
              className="text-white/70 hover:text-white text-sm font-body transition-colors px-2 py-1"
              data-ocid="nav.admin_link"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => openOrderModal("base")}
              className="bg-gold text-foreground text-sm font-semibold font-sans-display px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              data-ocid="nav.order_button"
            >
              Order Now
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-14">
        {currentPage === "home" && (
          <LandingPage onOpenOrderModal={openOrderModal} />
        )}
        {currentPage === "track" && <TrackOrderPage />}
        {currentPage === "admin" && <AdminPage />}
      </main>

      <OrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        defaultEdition={defaultEdition}
      />
    </>
  );
}
