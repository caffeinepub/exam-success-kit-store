import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  CheckCircle2,
  Crown,
  DollarSign,
  Lock,
  LogOut,
  Package,
  ShieldAlert,
  ShoppingBag,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import {
  useGetAllOrders,
  useGetStats,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const ADMIN_PASSCODE = "RDS";

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Packing: "bg-orange-50 text-orange-700 border-orange-200",
  Dispatched: "bg-purple-50 text-purple-700 border-purple-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
};

const statusIcons: Record<string, typeof Package> = {
  Pending: Package,
  Packing: Package,
  Dispatched: Truck,
  Shipped: Truck,
  Delivered: CheckCircle2,
};

// ── Cost Structure Data ──
const baseCosts = [
  { component: "Printing 100 pages", cost: 90 },
  { component: "Cover thick matte (kraft)", cost: 30 },
  { component: "Spiral binding", cost: 20 },
  { component: "Sticker pack (3 minimal)", cost: 10 },
  { component: "Desk cards", cost: 15 },
  { component: "Eco wrap packaging", cost: 20 },
  { component: "Shipping", cost: 60 },
];

const premiumCosts = [
  { component: "Full color printing 100 pages", cost: 130 },
  { component: "Bold color theme cover", cost: 40 },
  { component: "Spiral binding", cost: 20 },
  { component: "Vibrant sticker pack (8)", cost: 20 },
  { component: "Colored section tabs + ribbon", cost: 15 },
  { component: "Premium eco box", cost: 35 },
  { component: "Shipping", cost: 60 },
];

const eliteCosts = [
  { component: "Full color printing 120 pages", cost: 160 },
  { component: "Gold custom cover", cost: 60 },
  { component: "Perfect binding", cost: 30 },
  { component: "Foil sticker pack (8 + foil)", cost: 35 },
  { component: "Gold foil ribbon + dividers", cost: 25 },
  { component: "Thick eco mailer box", cost: 50 },
  { component: "Custom personalisation (name/exam)", cost: 20 },
  { component: "Shipping", cost: 70 },
];

const ninetyDayPlan = [
  {
    month: "Month 1 – Validation",
    weeks: [
      { week: "Week 1", focus: "Design + research", goal: "Final prototype" },
      { week: "Week 2", focus: "Feedback", goal: "10 testers" },
      { week: "Week 3", focus: "Instagram", goal: "20 posts" },
      { week: "Week 4", focus: "Pre-orders", goal: "20 paid orders" },
    ],
  },
  {
    month: "Month 2 – Launch",
    weeks: [
      { week: "Week 5", focus: "Print 50 units", goal: "Inventory ready" },
      { week: "Week 6", focus: "Deliver + collect", goal: "Reviews in hand" },
      { week: "Week 7", focus: "Content push", goal: "5 testimonials" },
      { week: "Week 8", focus: "Paid ads test", goal: "Break-even" },
    ],
  },
  {
    month: "Month 3 – Scale",
    weeks: [
      { week: "Week 9", focus: "Reinvest profit", goal: "Print 100 units" },
      { week: "Week 10", focus: "Ambassador drive", goal: "20 partners" },
      { week: "Week 11", focus: "Bundle marketing", goal: "Increase AOV" },
      { week: "Week 12", focus: "Revenue target", goal: "₹50,000 month" },
    ],
  },
];

const scalingRoadmap = [
  {
    stage: "Stage 1",
    revenue: "₹50K/month",
    action: "Improve packaging quality",
  },
  { stage: "Stage 2", revenue: "₹1L/month", action: "Launch JEE/NEET edition" },
  { stage: "Stage 3", revenue: "₹3L/month", action: "Coaching partnerships" },
  { stage: "Stage 4", revenue: "₹10L/month", action: "Dropship bundle model" },
  { stage: "Stage 5", revenue: "₹20L+/month", action: "App development" },
];

const contentCalendar = [
  {
    day: 1,
    topic: "Why students fail",
    hook: "\"You don't fail because you're dumb…\"",
    cta: "Comment TOPPER",
  },
  {
    day: 2,
    topic: "Planner flip-through",
    hook: '"This is how serious students plan"',
    cta: "DM to order",
  },
  {
    day: 3,
    topic: "Study with me",
    hook: '"2 hrs no phone challenge"',
    cta: "Follow",
  },
  {
    day: 4,
    topic: "Parent reaction",
    hook: '"My mom loved this page"',
    cta: "Save",
  },
  {
    day: 5,
    topic: "Mock tracker demo",
    hook: '"Track scores like this"',
    cta: "Link in bio",
  },
];

const competitors = [
  {
    brand: "Odd Giraffe",
    platform: "Website",
    product: "Planner",
    price: "₹699",
    strength: "Aesthetic",
    weakness: "Not exam-focused",
    gap: "Serious exam tracking",
  },
  {
    brand: "Factor Notes",
    platform: "Website",
    product: "Planner",
    price: "₹499",
    strength: "Clean layout",
    weakness: "No parent involvement",
    gap: "Parent review system",
  },
  {
    brand: "Amazon India",
    platform: "Amazon",
    product: "Study planner",
    price: "₹399",
    strength: "Cheap",
    weakness: "Generic",
    gap: "Student-built story",
  },
  {
    brand: "Flipkart sellers",
    platform: "Flipkart",
    product: "Exam planner",
    price: "₹299–599",
    strength: "Availability",
    weakness: "Weak branding",
    gap: "Premium positioning",
  },
];

function EditionBadge({ edition }: { edition: string }) {
  if (edition.includes("Elite")) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-sans-display bg-amber-50 text-amber-700 border-amber-300">
        <Crown className="w-3 h-3" />
        Elite
      </span>
    );
  }
  if (edition.includes("Premium")) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full border font-sans-display bg-coral/10 text-coral border-coral/30">
        Premium
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-sans-display bg-muted text-muted-foreground border-border">
      Base
    </span>
  );
}

function OrderRow({
  order,
  index,
  onStatusUpdate,
}: {
  order: Order;
  index: number;
  onStatusUpdate: (orderId: string, status: string) => void;
}) {
  const statusStyle = statusStyles[order.status] || statusStyles.Pending;
  const StatusIcon = statusIcons[order.status] || Package;
  const date = new Date(Number(order.timestamp) / 1_000_000);

  return (
    <TableRow data-ocid={`admin.order_row.${index + 1}`}>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {order.id.slice(0, 10)}...
      </TableCell>
      <TableCell className="font-sans-display font-semibold text-foreground text-sm">
        {order.customerName}
      </TableCell>
      <TableCell className="text-sm font-body">{order.phone}</TableCell>
      <TableCell>
        <EditionBadge edition={order.edition} />
      </TableCell>
      <TableCell className="font-sans-display font-bold text-foreground">
        ₹{order.pricePaid.toString()}
        {order.isEarlyBird && (
          <span className="ml-1 text-xs text-muted-foreground font-body">
            (EB)
          </span>
        )}
      </TableCell>
      <TableCell className="text-sm font-body">{order.paymentMethod}</TableCell>
      <TableCell>
        <Select
          value={order.status}
          onValueChange={(val) => onStatusUpdate(order.id, val)}
        >
          <SelectTrigger
            className={`w-32 h-7 text-xs border ${statusStyle}`}
            data-ocid={`admin.status_select.${index + 1}`}
          >
            <SelectValue>
              <span className="flex items-center gap-1">
                <StatusIcon className="w-3 h-3" />
                {order.status}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Packing">Packing</SelectItem>
            <SelectItem value="Dispatched">Dispatched</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground font-body">
        {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </TableCell>
    </TableRow>
  );
}

const CLEAR_PASSCODE = "Inanis";

function ClearHistoryDialog() {
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    if (confirmText === CLEAR_PASSCODE) {
      toast.info(
        "Feature coming soon — contact support to clear order history",
      );
      setOpen(false);
      setConfirmText("");
    } else {
      toast.error("Incorrect confirmation code");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setConfirmText("");
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="font-sans-display text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          data-ocid="admin.clear_history_button"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Clear History
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent data-ocid="admin.clear_history_dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Clear All Orders
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body text-sm">
            This will permanently delete all order history. Type{" "}
            <span className="font-mono font-bold text-foreground">Inanis</span>{" "}
            to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type Inanis to confirm"
            className="font-mono"
            data-ocid="admin.clear_history_input"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setConfirmText("")}
            data-ocid="admin.clear_history_cancel_button"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmText !== CLEAR_PASSCODE}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-ocid="admin.clear_history_confirm_button"
          >
            Clear All Orders
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminPage({
  onOpenSignIn,
}: { onOpenSignIn?: () => void }) {
  const { isAdmin: isAuthAdmin, signOut: authSignOut } = useAuth();
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(
    () => sessionStorage.getItem("adminUnlocked") === "1",
  );
  const [passcode, setPasscode] = useState("");
  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  const { data: orders, isLoading: isLoadingOrders } = useGetAllOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatus(
      { orderId, newStatus },
      {
        onSuccess: () => toast.success(`Order status updated to ${newStatus}`),
        onError: () => toast.error("Failed to update order status"),
      },
    );
  };

  const handlePasscodeLogin = () => {
    if (passcode.trim() === ADMIN_PASSCODE) {
      sessionStorage.setItem("adminUnlocked", "1");
      setPasscodeUnlocked(true);
      toast.success("Welcome, Admin!");
    } else {
      toast.error("Incorrect passcode");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminUnlocked");
    setPasscodeUnlocked(false);
    setPasscode("");
    authSignOut();
    toast.success("Logged out");
  };

  // STEP 1: Must be signed in as admin account
  if (!isAuthAdmin) {
    return (
      <div
        className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4"
        data-ocid="admin.error_state"
      >
        <motion.div
          className="text-center max-w-sm w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div className="absolute inset-0 -z-10 hero-gradient" />
            <div
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.19 0.035 155) 0%, oklch(0.26 0.06 155) 100%)",
              }}
            />
            <div className="relative p-10">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white mb-2">
                Access Denied
              </h1>
              <p className="text-white/60 font-body text-sm mb-8">
                This page is only accessible to the store admin. Please sign in
                with the admin account.
              </p>
              <Button
                onClick={onOpenSignIn}
                className="w-full font-sans-display font-bold py-3 text-base rounded-xl"
                style={{
                  background: "oklch(0.78 0.12 72)",
                  color: "oklch(0.19 0.035 155)",
                  border: "none",
                }}
                data-ocid="admin.signin_button"
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign In as Admin
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 2: Signed in as admin account, now enter RDS passcode
  if (!passcodeUnlocked) {
    return (
      <div
        className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4"
        data-ocid="admin.passcode_state"
      >
        <motion.div
          className="text-center max-w-sm w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.19 0.035 155) 0%, oklch(0.26 0.06 155) 100%)",
              }}
            />
            <div className="relative p-10">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/60 font-body text-sm mb-8">
                Enter your admin passcode to access the dashboard.
              </p>
              <div className="space-y-3">
                <Input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePasscodeLogin();
                  }}
                  placeholder="Enter passcode..."
                  className="bg-white/10 border-white/25 text-white placeholder:text-white/35 focus-visible:ring-white/30 focus-visible:border-white/50 text-center text-lg tracking-widest"
                  data-ocid="admin.token_input"
                />
                <Button
                  onClick={handlePasscodeLogin}
                  disabled={!passcode.trim()}
                  className="w-full font-sans-display font-bold py-3 text-base rounded-xl"
                  style={{
                    background: "oklch(0.78 0.12 72)",
                    color: "oklch(0.19 0.035 155)",
                    border: "none",
                  }}
                  data-ocid="admin.claim_admin_button"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Enter Dashboard
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalOrders = stats ? Number(stats.totalOrders) : 0;
  const totalRevenue = stats ? Number(stats.totalRevenue) : 0;
  const totalProfit = stats ? Number(stats.totalProfit) : 0;
  const earlyBirdUsed = stats ? Number(stats.earlyBirdUsed) : 0;
  const baseOrders = stats ? Number(stats.baseOrders) : 0;
  const premiumOrders = stats ? Number(stats.premiumOrders) : 0;
  const eliteOrders = stats ? Number(stats.eliteOrders) : 0;
  const breakEvenProgress = Math.min((totalOrders / 33) * 100, 100);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8 flex items-start justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground font-body">
              Business overview for Exam Success Kit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ClearHistoryDialog />
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="font-sans-display text-sm border-border hover:bg-muted"
              data-ocid="admin.logout_button"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isLoadingStats ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx.toString()} className="h-32 rounded-2xl" />
            ))
          ) : (
            <>
              <Card
                className="glass-light glass-hover rounded-2xl"
                data-ocid="admin.stats_card.1"
              >
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-sans-display text-muted-foreground">
                      Total Orders
                    </CardTitle>
                    <ShoppingBag className="w-4 h-4 text-forest" />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="font-display text-3xl font-bold text-foreground">
                    {totalOrders}
                  </div>
                  <div className="text-xs text-muted-foreground font-body mt-1">
                    Base: {baseOrders} · Premium: {premiumOrders} · Elite:{" "}
                    {eliteOrders}
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-light glass-hover rounded-2xl"
                data-ocid="admin.stats_card.2"
              >
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-sans-display text-muted-foreground">
                      Revenue
                    </CardTitle>
                    <DollarSign className="w-4 h-4 text-forest" />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="font-display text-3xl font-bold text-foreground">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-muted-foreground font-body mt-1">
                    Total collected
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-light glass-hover rounded-2xl"
                data-ocid="admin.stats_card.3"
              >
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-sans-display text-muted-foreground">
                      Profit
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-forest" />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="font-display text-3xl font-bold text-forest">
                    ₹{totalProfit.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-muted-foreground font-body mt-1">
                    After all costs
                  </div>
                </CardContent>
              </Card>

              <Card
                className="glass-light glass-hover rounded-2xl"
                data-ocid="admin.stats_card.4"
              >
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-sans-display text-muted-foreground">
                      Break-Even
                    </CardTitle>
                    <Target className="w-4 h-4 text-coral" />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="font-display text-3xl font-bold text-foreground">
                    {totalOrders}
                    <span className="text-muted-foreground font-sans-display font-normal text-lg">
                      /33
                    </span>
                  </div>
                  <Progress value={breakEvenProgress} className="mt-2 h-2" />
                  <div className="text-xs text-muted-foreground font-body mt-1.5">
                    {breakEvenProgress >= 100
                      ? "✓ Break-even reached!"
                      : `${Math.max(0, 33 - totalOrders)} more to go`}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>

        {/* Edition + Early Bird badges */}
        <motion.div
          className="flex flex-wrap gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-light rounded-xl px-4 py-2.5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-sans-display text-muted-foreground">
              Base Edition:
            </span>
            <span className="font-sans-display font-bold text-foreground">
              {baseOrders} sold
            </span>
          </div>
          <div
            className="glass-light rounded-xl px-4 py-2.5 flex items-center gap-2"
            style={{ border: "1px solid oklch(0.62 0.18 30 / 0.3)" }}
          >
            <BarChart3 className="w-4 h-4 text-coral" />
            <span className="text-sm font-sans-display text-coral">
              Premium Edition:
            </span>
            <span className="font-sans-display font-bold text-coral">
              {premiumOrders} sold
            </span>
          </div>
          <div
            className="glass-light rounded-xl px-4 py-2.5 flex items-center gap-2"
            style={{ border: "1px solid rgba(217,119,6,0.3)" }}
          >
            <Crown className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-sans-display text-amber-700">
              Elite Edition:
            </span>
            <span className="font-sans-display font-bold text-amber-800">
              {eliteOrders} sold
            </span>
          </div>
          <div
            className="glass-light rounded-xl px-4 py-2.5 flex items-center gap-2"
            style={{ border: "1px solid oklch(0.78 0.12 72 / 0.4)" }}
          >
            <Star className="w-4 h-4 text-yellow-700" />
            <span className="text-sm font-sans-display text-yellow-800">
              Early Bird Used:
            </span>
            <span className="font-sans-display font-bold text-yellow-900">
              {earlyBirdUsed}/20
            </span>
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-sans-display font-bold text-xl text-foreground mb-4">
            All Orders
          </h2>
          <div
            className="glass-light rounded-2xl overflow-hidden"
            data-ocid="admin.orders_table"
          >
            {isLoadingOrders ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx.toString()} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="admin.orders_empty_state"
              >
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-sans-display font-semibold text-foreground">
                  No orders yet
                </p>
                <p className="text-muted-foreground text-sm font-body mt-1">
                  Orders will appear here once placed
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-sans-display text-xs">
                        Order ID
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Customer
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Phone
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Edition
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Price
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Payment
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Status
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, idx) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        index={idx}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Business Toolkit */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-sans-display font-bold text-xl text-foreground mb-4">
            Business Toolkit
          </h2>
          <Tabs defaultValue="cost">
            <TabsList
              className="flex flex-wrap h-auto gap-1 glass-light p-1 rounded-xl mb-6"
              data-ocid="admin.toolkit.tab"
            >
              <TabsTrigger
                value="cost"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit_cost.tab"
              >
                Cost Structure
              </TabsTrigger>
              <TabsTrigger
                value="plan"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit_plan.tab"
              >
                90-Day Plan
              </TabsTrigger>
              <TabsTrigger
                value="scale"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit_scale.tab"
              >
                Scaling Roadmap
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit_content.tab"
              >
                Content Calendar
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit_market.tab"
              >
                Market Research
              </TabsTrigger>
              <TabsTrigger
                value="ambassador"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit_ambassador.tab"
              >
                Ambassador Program
              </TabsTrigger>
            </TabsList>

            {/* Cost Structure */}
            <TabsContent value="cost">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Base */}
                <div
                  className="glass-light rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(180,155,100,0.3)" }}
                >
                  <div
                    className="px-5 py-4 border-b border-border/40"
                    style={{ background: "oklch(0.82 0.07 60 / 0.12)" }}
                  >
                    <h3 className="font-sans-display font-bold text-foreground">
                      Base Eco — ₹499
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-sans-display text-xs">
                          Component
                        </TableHead>
                        <TableHead className="font-sans-display text-xs text-right">
                          Cost (₹)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {baseCosts.map((row) => (
                        <TableRow key={row.component}>
                          <TableCell className="text-sm font-body">
                            {row.component}
                          </TableCell>
                          <TableCell className="text-sm font-sans-display text-right">
                            ₹{row.cost}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell className="font-sans-display font-bold text-foreground">
                          Total Cost
                        </TableCell>
                        <TableCell className="font-sans-display font-bold text-foreground text-right">
                          ₹{baseCosts.reduce((s, r) => s + r.cost, 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-sans-display text-muted-foreground">
                          Selling Price
                        </TableCell>
                        <TableCell className="font-sans-display text-right text-muted-foreground">
                          ₹499
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-forest/5">
                        <TableCell className="font-sans-display font-bold text-forest">
                          Profit Per Unit
                        </TableCell>
                        <TableCell className="font-sans-display font-bold text-forest text-right">
                          ₹{499 - baseCosts.reduce((s, r) => s + r.cost, 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Premium */}
                <div
                  className="glass-light rounded-2xl overflow-hidden"
                  style={{ border: "1px solid oklch(0.62 0.18 30 / 0.3)" }}
                >
                  <div
                    className="px-5 py-4 border-b"
                    style={{
                      background: "oklch(0.62 0.18 30 / 0.07)",
                      borderColor: "oklch(0.62 0.18 30 / 0.18)",
                    }}
                  >
                    <h3 className="font-sans-display font-bold text-foreground">
                      Premium Color — ₹599
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-sans-display text-xs">
                          Component
                        </TableHead>
                        <TableHead className="font-sans-display text-xs text-right">
                          Cost (₹)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {premiumCosts.map((row) => (
                        <TableRow key={row.component}>
                          <TableCell className="text-sm font-body">
                            {row.component}
                          </TableCell>
                          <TableCell className="text-sm font-sans-display text-right">
                            ₹{row.cost}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell className="font-sans-display font-bold text-foreground">
                          Total Cost
                        </TableCell>
                        <TableCell className="font-sans-display font-bold text-foreground text-right">
                          ₹{premiumCosts.reduce((s, r) => s + r.cost, 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-sans-display text-muted-foreground">
                          Selling Price
                        </TableCell>
                        <TableCell className="font-sans-display text-right text-muted-foreground">
                          ₹599
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-forest/5">
                        <TableCell className="font-sans-display font-bold text-forest">
                          Profit Per Unit
                        </TableCell>
                        <TableCell className="font-sans-display font-bold text-forest text-right">
                          ₹{599 - premiumCosts.reduce((s, r) => s + r.cost, 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Elite */}
                <div
                  className="glass-light rounded-2xl overflow-hidden"
                  style={{ border: "1px solid rgba(217,119,6,0.3)" }}
                >
                  <div
                    className="px-5 py-4 border-b flex items-center gap-2"
                    style={{
                      background: "oklch(0.78 0.12 72 / 0.08)",
                      borderColor: "rgba(217,119,6,0.2)",
                    }}
                  >
                    <Crown className="w-4 h-4 text-amber-600" />
                    <h3 className="font-sans-display font-bold text-foreground">
                      Elite Custom — ₹799
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-sans-display text-xs">
                          Component
                        </TableHead>
                        <TableHead className="font-sans-display text-xs text-right">
                          Cost (₹)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eliteCosts.map((row) => (
                        <TableRow key={row.component}>
                          <TableCell className="text-sm font-body">
                            {row.component}
                          </TableCell>
                          <TableCell className="text-sm font-sans-display text-right">
                            ₹{row.cost}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell className="font-sans-display font-bold text-foreground">
                          Total Cost
                        </TableCell>
                        <TableCell className="font-sans-display font-bold text-foreground text-right">
                          ₹{eliteCosts.reduce((s, r) => s + r.cost, 0)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-sans-display text-muted-foreground">
                          Selling Price
                        </TableCell>
                        <TableCell className="font-sans-display text-right text-muted-foreground">
                          ₹799
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-forest/5">
                        <TableCell className="font-sans-display font-bold text-forest">
                          Profit Per Unit
                        </TableCell>
                        <TableCell className="font-sans-display font-bold text-forest text-right">
                          ₹{799 - eliteCosts.reduce((s, r) => s + r.cost, 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* 90-Day Plan */}
            <TabsContent value="plan">
              <div className="space-y-6">
                {ninetyDayPlan.map((month) => (
                  <div
                    key={month.month}
                    className="glass-light rounded-2xl overflow-hidden"
                  >
                    <div
                      className="px-5 py-3 border-b border-border/40"
                      style={{ background: "oklch(0.34 0.095 155 / 0.06)" }}
                    >
                      <h3 className="font-sans-display font-bold text-forest">
                        {month.month}
                      </h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-sans-display text-xs">
                            Week
                          </TableHead>
                          <TableHead className="font-sans-display text-xs">
                            Focus
                          </TableHead>
                          <TableHead className="font-sans-display text-xs">
                            Goal
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {month.weeks.map((w) => (
                          <TableRow key={w.week}>
                            <TableCell className="font-sans-display font-semibold text-sm">
                              {w.week}
                            </TableCell>
                            <TableCell className="text-sm font-body">
                              {w.focus}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-forest/10 text-forest border-0 font-sans-display text-xs">
                                {w.goal}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Scaling Roadmap */}
            <TabsContent value="scale">
              <div className="glass-light rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-sans-display text-xs">
                        Stage
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Revenue Level
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scalingRoadmap.map((row) => (
                      <TableRow key={row.stage}>
                        <TableCell>
                          <span className="font-sans-display font-bold text-forest">
                            {row.stage}
                          </span>
                        </TableCell>
                        <TableCell className="font-sans-display font-semibold text-foreground">
                          {row.revenue}
                        </TableCell>
                        <TableCell className="text-sm font-body text-muted-foreground">
                          {row.action}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div
                className="mt-4 p-4 glass-light rounded-xl text-sm font-body text-foreground"
                style={{ border: "1px solid oklch(0.78 0.12 72 / 0.3)" }}
              >
                <strong className="font-sans-display">Strategy Summary:</strong>{" "}
                First 3 months: ₹30K–₹60K possible. 1 year: ₹3–5 lakh realistic.
                With proper scaling → multi-lakh/month.
              </div>
            </TabsContent>

            {/* Content Calendar */}
            <TabsContent value="content">
              <div className="glass-light rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-sans-display text-xs w-16">
                        Day
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Reel Topic
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Hook
                      </TableHead>
                      <TableHead className="font-sans-display text-xs w-32">
                        CTA
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentCalendar.map((row) => (
                      <TableRow key={row.day}>
                        <TableCell className="font-sans-display font-bold text-forest">
                          Day {row.day}
                        </TableCell>
                        <TableCell className="font-sans-display font-semibold text-sm text-foreground">
                          {row.topic}
                        </TableCell>
                        <TableCell className="text-sm font-body text-muted-foreground italic">
                          {row.hook}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-coral/10 text-coral border-0 font-sans-display text-xs">
                            {row.cta}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 glass-light rounded-xl text-sm font-body text-muted-foreground">
                <strong className="font-sans-display text-foreground">
                  Pattern (Days 6–30):
                </strong>{" "}
                Repeat cycle — flip-through, transformation story, study tip,
                testimonial, order CTA. Post every day for 30 days consistently.
              </div>
            </TabsContent>

            {/* Market Research */}
            <TabsContent value="market">
              <div className="glass-light rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-sans-display text-xs">
                        Brand
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Platform
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Price
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Strength
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Weakness
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Gap We Fill
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitors.map((row) => (
                      <TableRow key={row.brand}>
                        <TableCell className="font-sans-display font-bold text-foreground text-sm">
                          {row.brand}
                        </TableCell>
                        <TableCell className="text-sm font-body">
                          {row.platform}
                        </TableCell>
                        <TableCell className="font-sans-display font-semibold text-sm">
                          {row.price}
                        </TableCell>
                        <TableCell className="text-sm font-body text-green-700">
                          {row.strength}
                        </TableCell>
                        <TableCell className="text-sm font-body text-red-600">
                          {row.weakness}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-forest/10 text-forest border-0 font-sans-display text-xs">
                            {row.gap}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Ambassador Program */}
            <TabsContent value="ambassador">
              <div className="glass-light rounded-2xl overflow-hidden">
                <div
                  className="px-5 py-4 border-b border-border/40"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  <p className="font-sans-display font-bold text-foreground text-sm">
                    Student Ambassador Tracker
                  </p>
                  <p className="text-muted-foreground font-body text-xs mt-0.5">
                    Offer: Free digital kit + 20% commission on every sale they
                    generate
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-sans-display text-xs">
                        Name
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        School
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Followers
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Free Kit Given
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Post Done
                      </TableHead>
                      <TableHead className="font-sans-display text-xs">
                        Sales
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground font-body"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Star className="w-8 h-8 text-muted-foreground/40" />
                          <p className="font-sans-display font-semibold text-foreground">
                            No ambassadors yet
                          </p>
                          <p className="text-sm">
                            Reach out to student creators with 1K–10K followers
                            in your city
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
