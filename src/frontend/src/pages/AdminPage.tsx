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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Edit2,
  Flag,
  Inbox,
  ListTodo,
  Lock,
  LogOut,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShoppingBag,
  Star,
  StickyNote,
  Target,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CancelRequest, Order } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useEditableContentAdmin } from "../hooks/useEditableContent";
import {
  useClearOrders,
  useGetAllCancelRequests,
  useGetAllOrders,
  useGetStats,
  useSetOrderPriority,
  useUpdateCancelRequest,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

// ── Constants ──────────────────────────────────────────────────────────────
const ADMIN_PASSCODE = "RDS@2012";
const ADMIN_RECOVERY_CODE = "Inanis";
const ADMIN_EDIT_PASSWORD = "RDS@EDIT";
const ADMIN_INFO_PASSWORD = "RDS@INFO";
const CLEAR_PASSCODE = "Inanis";
const OVERRIDE_PASSWORD = "RDS@2012";
const INVESTMENT_AMOUNT = 6000; // ₹5-6k investment
const AUTO_LOGOUT_MS = 10 * 60 * 1000; // 10 minutes

// ── Local storage helpers ──────────────────────────────────────────────────
interface BudgetEntry {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  auto: boolean; // auto-generated from orders
}

interface StatsOverride {
  enabled: boolean;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  baseOrders: number;
  premiumOrders: number;
  eliteOrders: number;
}

function loadBudget(): BudgetEntry[] {
  try {
    return JSON.parse(localStorage.getItem("examkit_budget") ?? "[]");
  } catch {
    return [];
  }
}

function saveBudget(entries: BudgetEntry[]) {
  localStorage.setItem("examkit_budget", JSON.stringify(entries));
}

function loadTodos(): TodoItem[] {
  try {
    return JSON.parse(localStorage.getItem("examkit_todos") ?? "[]");
  } catch {
    return [];
  }
}

function saveTodos(items: TodoItem[]) {
  localStorage.setItem("examkit_todos", JSON.stringify(items));
}

function loadStatsOverride(): StatsOverride {
  try {
    const raw = localStorage.getItem("examkit_stats_override");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    enabled: false,
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    baseOrders: 0,
    premiumOrders: 0,
    eliteOrders: 0,
  };
}

function saveStatsOverride(o: StatsOverride) {
  localStorage.setItem("examkit_stats_override", JSON.stringify(o));
}

function getOrderDueDate(orderId: string): string | null {
  try {
    const data = JSON.parse(
      localStorage.getItem("examkit_order_duedates") ?? "{}",
    );
    return data[orderId] ?? null;
  } catch {
    return null;
  }
}

// ── Status helpers ─────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  "Order Accepted": "bg-blue-50 text-blue-800 border-blue-200",
  "Payment Received": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Printing: "bg-violet-50 text-violet-700 border-violet-200",
  "Printing Custom": "bg-purple-50 text-purple-700 border-purple-200",
  Packing: "bg-orange-50 text-orange-700 border-orange-200",
  Dispatched: "bg-purple-50 text-purple-700 border-purple-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Declined: "bg-red-50 text-red-800 border-red-300",
};

const ADMIN_STATUS_OPTIONS = [
  "Pending",
  "Order Accepted",
  "Payment Received",
  "Processing",
  "Printing",
  "Printing Custom",
  "Packing",
  "Dispatched",
  "Shipped",
  "Delivered",
];

function statusToTab(status: string): string {
  if (status === "Pending") return "pending";
  if (status === "Order Accepted") return "accepted";
  if (
    [
      "Payment Received",
      "Processing",
      "Printing",
      "Printing Custom",
      "Packing",
    ].includes(status)
  )
    return "processing";
  if (["Dispatched", "Shipped"].includes(status)) return "dispatched";
  if (status === "Delivered") return "delivered";
  if (status === "Declined") return "declined";
  if (status === "Cancelled") return "cancelled";
  return "pending";
}

// ── Cost data ──────────────────────────────────────────────────────────────
const baseCosts = [
  { component: "B/W print 110 pages", cost: 110 },
  { component: "Kraft cover", cost: 30 },
  { component: "Perfect binding", cost: 25 },
  { component: "Stickers (3 minimal)", cost: 15 },
  { component: "Eco wrap packaging", cost: 25 },
  { component: "Shipping", cost: 60 },
];

const premiumCosts = [
  { component: "Full color print 110 pages", cost: 220 },
  { component: "Bold color cover", cost: 40 },
  { component: "Perfect binding", cost: 25 },
  { component: "Vibrant sticker pack (8)", cost: 25 },
  { component: "Ribbon + section tabs", cost: 10 },
  { component: "Premium eco box", cost: 30 },
  { component: "Shipping", cost: 60 },
];

const eliteCosts = [
  { component: "Full color print 140 pages", cost: 280 },
  { component: "Gold custom cover", cost: 60 },
  { component: "Perfect binding", cost: 30 },
  { component: "Foil sticker pack", cost: 35 },
  { component: "Gold foil ribbon + dividers", cost: 25 },
  { component: "Thick eco mailer box", cost: 50 },
  { component: "Shipping", cost: 70 },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function DeclineOverrideModal({
  orderId,
  onConfirm,
  onClose,
}: {
  orderId: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const handleConfirm = () => {
    if (pwd !== OVERRIDE_PASSWORD) {
      setErr("Incorrect password");
      return;
    }
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl w-full max-w-sm"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        data-ocid="admin.decline_override_modal"
      >
        <div
          className="absolute inset-0 -z-10 opacity-80"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.19 0.035 155) 0%, oklch(0.26 0.06 155) 100%)",
          }}
        />
        <div className="relative p-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-white text-center mb-1">
            Decline Order
          </h3>
          <p className="text-white/60 font-body text-xs text-center mb-5">
            Order{" "}
            <span className="font-mono font-bold text-white/80">{orderId}</span>{" "}
            will be marked as <strong className="text-red-400">Declined</strong>
            .
          </p>
          <Input
            type="password"
            value={pwd}
            onChange={(e) => {
              setPwd(e.target.value);
              setErr("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
            placeholder="Admin password..."
            className="bg-white/10 border-white/25 text-white placeholder:text-white/35 text-center mb-2"
            data-ocid="admin.decline_password_input"
          />
          {err && (
            <p className="text-red-400 text-xs text-center mb-2">{err}</p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
              data-ocid="admin.decline_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!pwd.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
              data-ocid="admin.decline_confirm_button"
            >
              Decline
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function OrderRow({
  order,
  index,
  onStatusChange,
  onDecline,
  onAccept,
}: {
  order: Order;
  index: number;
  onStatusChange: (id: string, status: string) => void;
  onDecline: (id: string) => void;
  onAccept: (id: string) => void;
}) {
  const { mutate: setPriority } = useSetOrderPriority();
  const dueDate = getOrderDueDate(order.id);
  const isElite = order.edition.toLowerCase().includes("elite");

  // Priority color based on due date
  let priorityColor = "text-muted-foreground";
  let priorityDot = "bg-muted";
  if (dueDate) {
    const d = new Date(dueDate);
    const daysUntil = Math.ceil(
      (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntil <= 2) {
      priorityColor = "text-red-600";
      priorityDot = "bg-red-500";
    } else if (daysUntil <= 5) {
      priorityColor = "text-orange-500";
      priorityDot = "bg-orange-400";
    } else {
      priorityColor = "text-green-600";
      priorityDot = "bg-green-500";
    }
  }

  return (
    <TableRow
      className="glass-light rounded-xl"
      data-ocid={`admin.order_item.${index + 1}`}
    >
      <TableCell className="font-mono text-xs font-bold">{order.id}</TableCell>
      <TableCell>
        <div>
          <p className="font-sans-display font-semibold text-sm text-foreground">
            {order.customerName}
          </p>
          <p className="text-xs text-muted-foreground font-body">
            {order.email || order.phone}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          {isElite && <span className="text-amber-500 text-xs">👑</span>}
          <span className="text-sm font-sans-display">{order.edition}</span>
          {order.isEarlyBird && (
            <span className="text-[10px] bg-gold/20 px-1 rounded font-body">
              EB
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${priorityDot}`} />
            <span className={`text-xs font-body ${priorityColor}`}>
              {dueDate ? dueDate.split(" ").slice(0, 2).join(" ") : "—"}
            </span>
          </div>
          <div className="flex gap-1">
            {(["1", "2", "3"] as const).map((p) => {
              const isActive = order.priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setPriority({ orderId: order.id, priority: p })
                  }
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                    isActive
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white/50 text-muted-foreground border border-border hover:bg-amber-50 hover:text-amber-600"
                  }`}
                  data-ocid={`admin.order_priority_${p}.${index + 1}`}
                >
                  P{p}
                </button>
              );
            })}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-sans-display ${
            statusStyles[order.status] ??
            "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {order.status}
        </span>
      </TableCell>
      <TableCell>
        <Select
          value={order.status}
          onValueChange={(v) => onStatusChange(order.id, v)}
        >
          <SelectTrigger
            className="h-8 text-xs w-36"
            data-ocid={`admin.status_select.${index + 1}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex gap-1.5 flex-wrap">
          {order.status === "Pending" && (
            <Button
              size="sm"
              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2"
              onClick={() => onAccept(order.id)}
              data-ocid={`admin.accept_button.${index + 1}`}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Accept
            </Button>
          )}
          {order.status !== "Declined" && order.status !== "Cancelled" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2"
              onClick={() => onDecline(order.id)}
              data-ocid={`admin.decline_button.${index + 1}`}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Decline
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function RequestCard({
  req,
  index,
  onAccept,
  onDecline,
}: {
  req: CancelRequest;
  index: number;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const date = new Date(Number(req.timestamp) / 1_000_000);
  const statusColor =
    req.status === "Accepted"
      ? "bg-green-50 text-green-700 border-green-200"
      : req.status === "Declined"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-yellow-50 text-yellow-800 border-yellow-200";

  return (
    <div
      className="glass-light rounded-2xl p-4"
      data-ocid={`admin.request_item.${index + 1}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-sans-display ${statusColor}`}
          >
            {req.requestType === "cancel" ? "Cancel" : "Refund"} Request
          </span>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Order: <span className="font-mono">{req.orderId}</span>
          </p>
        </div>
        <div className="text-right">
          <Badge className={`${statusColor} border font-sans-display text-xs`}>
            {req.status}
          </Badge>
          <p className="text-xs text-muted-foreground font-body mt-1">
            {date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>
      <div className="space-y-1 text-xs font-body text-muted-foreground mb-3">
        <p>
          <span className="font-semibold text-foreground">Email:</span>{" "}
          {req.customerEmail || "—"}
        </p>
        <p>
          <span className="font-semibold text-foreground">Phone:</span>{" "}
          {req.customerPhone || "—"}
        </p>
        <p>
          <span className="font-semibold text-foreground">Reason:</span>{" "}
          {req.reason}
        </p>
      </div>
      {req.status === "Pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-sans-display"
            onClick={onAccept}
            data-ocid={`admin.request_accept_button.${index + 1}`}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 font-sans-display"
            onClick={onDecline}
            data-ocid={`admin.request_decline_button.${index + 1}`}
          >
            <X className="w-3 h-3 mr-1" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}

function ClearHistoryDialog() {
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);
  const [clearAll, setClearAll] = useState(false);
  const { mutate: clearOrders, isPending } = useClearOrders();

  const handleConfirm = () => {
    if (confirmText !== CLEAR_PASSCODE) {
      toast.error("Incorrect confirmation code");
      return;
    }
    clearOrders(
      { clearAll },
      {
        onSuccess: (count) => {
          toast.success(
            `Cleared ${count.toString()} order${Number(count) !== 1 ? "s" : ""}`,
          );
          setOpen(false);
          setConfirmText("");
        },
        onError: () => toast.error("Failed to clear history"),
      },
    );
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
            Clear Order History
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body text-sm">
            Choose what to clear and enter your confirmation code.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2 space-y-4">
          <RadioGroup
            value={clearAll ? "all" : "delivered"}
            onValueChange={(v) => setClearAll(v === "all")}
            data-ocid="admin.clear_scope_radio"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
              <RadioGroupItem value="delivered" id="clear-delivered" />
              <Label
                htmlFor="clear-delivered"
                className="cursor-pointer font-sans-display text-sm text-foreground"
              >
                Clear Delivered Orders Only
              </Label>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50/40">
              <RadioGroupItem value="all" id="clear-all" />
              <Label
                htmlFor="clear-all"
                className="cursor-pointer font-sans-display text-sm text-red-700"
              >
                Clear ALL Orders (irreversible)
              </Label>
            </div>
          </RadioGroup>
          <Input
            type="password"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Enter confirmation code"
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
            disabled={confirmText !== CLEAR_PASSCODE || isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-ocid="admin.clear_history_confirm_button"
          >
            {isPending
              ? "Clearing…"
              : clearAll
                ? "Clear All"
                : "Clear Delivered"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FloatingEditBar({
  onSave,
  onCancel,
}: { onSave: () => void; onCancel: () => void }) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: "rgba(15, 23, 18, 0.88)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
      }}
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-2">
        <Edit2 className="w-4 h-4 text-blue-400" />
        <span className="text-white/80 font-sans-display text-sm font-semibold">
          Edit Mode Active
        </span>
        <span className="text-xs text-white/40 font-body hidden sm:block">
          — Changes apply across the entire site
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="font-sans-display text-sm border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
          data-ocid="admin.floating_cancel_button"
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          Cancel
        </Button>
        <Button
          onClick={onSave}
          size="sm"
          className="font-sans-display text-sm font-bold"
          style={{
            background: "oklch(0.78 0.12 72)",
            color: "oklch(0.19 0.035 155)",
          }}
          data-ocid="admin.floating_save_button"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
}

// ── Admin Notes Tab ───────────────────────────────────────────────────────
function AdminNotesTab() {
  const STORAGE_KEY = "admin_notes";
  const [notes, setNotes] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (val: string) => {
    setNotes(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, val);
      } catch {}
      setLastSaved(new Date());
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    }, 500);
  };

  const handleClear = () => {
    setNotes("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setLastSaved(new Date());
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-600" />
            <span className="font-sans-display font-semibold text-foreground text-sm">
              Admin Notes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {savedIndicator && (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-green-600 font-sans-display"
                >
                  ✓ Saved
                </motion.span>
              )}
            </AnimatePresence>
            {lastSaved && !savedIndicator && (
              <span className="text-xs text-muted-foreground font-body">
                Last saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-red-500 hover:text-red-700 font-sans-display transition-colors flex items-center gap-1"
              data-ocid="admin.notes_clear_button"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type your private notes here... ideas, reminders, order notes, supplier contacts, anything you need."
          className="w-full min-h-[400px] bg-transparent text-foreground font-body text-sm resize-none focus:outline-none placeholder:text-muted-foreground/50 leading-relaxed"
          data-ocid="admin.notes.textarea"
          style={{ scrollbarWidth: "none" }}
        />
      </div>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans-display">
              Clear all notes?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete all your notes. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.notes_clear_cancel_button"
              className="font-sans-display"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              data-ocid="admin.notes_clear_confirm_button"
              className="bg-red-500 hover:bg-red-600 font-sans-display"
            >
              Clear Notes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Budget Planner Tab ─────────────────────────────────────────────────────
function BudgetPlannerTab() {
  const [entries, setEntries] = useState<BudgetEntry[]>(loadBudget);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Investment");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [investment, setInvestment] = useState(() =>
    Number(localStorage.getItem("examkit_investment") ?? INVESTMENT_AMOUNT),
  );
  const [editingInvestment, setEditingInvestment] = useState(false);
  const [invInput, setInvInput] = useState("");

  // Stock
  const [baseStock, setBaseStock] = useState(() =>
    Number(localStorage.getItem("examkit_stock_base") ?? 0),
  );
  const [premiumStock, setPremiumStock] = useState(() =>
    Number(localStorage.getItem("examkit_stock_premium") ?? 0),
  );
  const [eliteStock, setEliteStock] = useState(() =>
    Number(localStorage.getItem("examkit_stock_elite") ?? 0),
  );

  const totalIncome = entries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);
  const balance = investment + totalIncome - totalExpense;

  const addEntry = () => {
    if (!desc.trim() || !amount || Number(amount) <= 0) return;
    const entry: BudgetEntry = {
      id: Date.now().toString(),
      description: desc.trim(),
      amount: Number(amount),
      category,
      type,
      date: new Date().toLocaleDateString("en-IN"),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveBudget(updated);
    setDesc("");
    setAmount("");
    toast.success("Entry added");
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveBudget(updated);
  };

  const saveStock = () => {
    localStorage.setItem("examkit_stock_base", baseStock.toString());
    localStorage.setItem("examkit_stock_premium", premiumStock.toString());
    localStorage.setItem("examkit_stock_elite", eliteStock.toString());
    toast.success("Stock updated");
  };

  const saveInvestment = () => {
    const val = Number(invInput);
    if (!val || val <= 0) return;
    localStorage.setItem("examkit_investment", val.toString());
    setInvestment(val);
    setEditingInvestment(false);
    toast.success("Investment updated");
  };

  return (
    <div className="space-y-6">
      {/* Investment */}
      <div
        className="glass-light rounded-2xl p-5"
        data-ocid="admin.budget_panel"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans-display font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4 text-forest" />
            Investment & Balance
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div
            className="rounded-xl p-3 text-center"
            style={{
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <p className="text-xs text-muted-foreground font-body">
              Investment
            </p>
            {editingInvestment ? (
              <div className="flex gap-1 mt-1">
                <Input
                  type="number"
                  value={invInput}
                  onChange={(e) => setInvInput(e.target.value)}
                  className="h-7 text-xs text-center"
                  placeholder={investment.toString()}
                  data-ocid="admin.investment_input"
                />
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={saveInvestment}
                >
                  <Save className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <p className="font-bold text-lg text-foreground">
                  ₹{investment.toLocaleString("en-IN")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInvInput(investment.toString());
                    setEditingInvestment(true);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  data-ocid="admin.edit_investment_button"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            <p className="text-xs text-muted-foreground font-body">
              Total Income
            </p>
            <p className="font-bold text-lg text-green-700">
              +₹{totalIncome.toLocaleString("en-IN")}
            </p>
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{
              background:
                balance >= 0 ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
              border:
                balance >= 0
                  ? "1px solid rgba(16,185,129,0.15)"
                  : "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <p className="text-xs text-muted-foreground font-body">
              Net Balance
            </p>
            <p
              className={`font-bold text-lg ${
                balance >= 0 ? "text-green-700" : "text-red-600"
              }`}
            >
              {balance >= 0 ? "+" : ""}₹{balance.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Add entry */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-2 rounded-xl text-sm font-sans-display font-semibold border transition-all ${
                type === "income"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
              data-ocid="admin.income_toggle"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2 rounded-xl text-sm font-sans-display font-semibold border transition-all ${
                type === "expense"
                  ? "bg-red-600 text-white border-red-600"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
              data-ocid="admin.expense_toggle"
            >
              <Minus className="w-3.5 h-3.5 inline mr-1" />
              Expense
            </button>
          </div>
          <div className="flex gap-2">
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              className="flex-1 bg-white/70"
              data-ocid="admin.budget_desc_input"
            />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-28 bg-white/70"
              data-ocid="admin.budget_amount_input"
            />
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className="flex-1 bg-white/70"
                data-ocid="admin.budget_category_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Investment",
                  "Stock Purchase",
                  "Marketing",
                  "Shipping",
                  "Other Income",
                  "Other Expense",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addEntry}
              className="bg-forest text-white hover:bg-forest/90"
              data-ocid="admin.budget_add_button"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="glass-light rounded-2xl p-5">
          <h3 className="font-sans-display font-bold text-foreground mb-3">
            Transaction Log
          </h3>
          <div className="space-y-2">
            {entries.map((e, i) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-2.5 rounded-xl"
                style={{
                  background:
                    e.type === "income"
                      ? "rgba(16,185,129,0.04)"
                      : "rgba(239,68,68,0.04)",
                  border:
                    e.type === "income"
                      ? "1px solid rgba(16,185,129,0.12)"
                      : "1px solid rgba(239,68,68,0.12)",
                }}
                data-ocid={`admin.budget_item.${i + 1}`}
              >
                <div>
                  <p className="font-sans-display font-semibold text-sm text-foreground">
                    {e.description}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {e.category} · {e.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm font-mono ${
                      e.type === "income" ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {e.type === "income" ? "+" : "-"}₹
                    {e.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEntry(e.id)}
                    className="text-muted-foreground hover:text-red-500"
                    data-ocid={`admin.budget_delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Tracker */}
      <div
        className="glass-light rounded-2xl p-5"
        data-ocid="admin.stock_panel"
      >
        <h3 className="font-sans-display font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-forest" />
          Stock Tracker
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            {
              label: "Base Eco",
              value: baseStock,
              set: setBaseStock,
              key: "base",
            },
            {
              label: "Premium",
              value: premiumStock,
              set: setPremiumStock,
              key: "premium",
            },
            {
              label: "Elite",
              value: eliteStock,
              set: setEliteStock,
              key: "elite",
            },
          ].map(({ label, value, set }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{
                background:
                  value < 5 ? "rgba(239,68,68,0.05)" : "rgba(16,185,129,0.05)",
                border:
                  value < 5
                    ? "1px solid rgba(239,68,68,0.15)"
                    : "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <p className="text-xs text-muted-foreground font-body mb-1">
                {label}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => set((v) => Math.max(0, v - 1))}
                  className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold hover:bg-red-200"
                >
                  -
                </button>
                <span className="font-bold text-xl text-foreground w-8 text-center">
                  {value}
                </span>
                <button
                  type="button"
                  onClick={() => set((v) => v + 1)}
                  className="w-6 h-6 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold hover:bg-green-200"
                >
                  +
                </button>
              </div>
              {value < 5 && (
                <p className="text-[10px] text-red-600 mt-1 font-body">
                  Low stock!
                </p>
              )}
            </div>
          ))}
        </div>
        <Button
          onClick={saveStock}
          size="sm"
          className="w-full bg-forest text-white hover:bg-forest/90"
          data-ocid="admin.save_stock_button"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Stock
        </Button>
      </div>
    </div>
  );
}

// ── Todo List Tab ──────────────────────────────────────────────────────────
function TodoListTab({ orders }: { orders: Order[] }) {
  const [todos, setTodos] = useState<TodoItem[]>(loadTodos);
  const [newTodo, setNewTodo] = useState("");

  // Generate auto todos from orders
  const autoTodos: TodoItem[] = [
    ...orders
      .filter((o) => o.status === "Pending")
      .map((o) => ({
        id: `auto-accept-${o.id}`,
        text: `Approve order ${o.id} (${o.edition})`,
        done: false,
        auto: true,
      })),
    ...orders
      .filter((o) => ["Order Accepted", "Payment Received"].includes(o.status))
      .map((o) => ({
        id: `auto-process-${o.id}`,
        text: `Begin processing order ${o.id} (${o.edition})`,
        done: false,
        auto: true,
      })),
    ...orders
      .filter((o) =>
        ["Processing", "Printing", "Printing Custom"].includes(o.status),
      )
      .map((o) => ({
        id: `auto-pack-${o.id}`,
        text: `Prepare packing for order ${o.id}`,
        done: false,
        auto: true,
      })),
    ...orders
      .filter((o) => o.status === "Packing")
      .map((o) => ({
        id: `auto-dispatch-${o.id}`,
        text: `Dispatch order ${o.id}`,
        done: false,
        auto: true,
      })),
  ];

  const allItems = [...autoTodos, ...todos];

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const item: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      done: false,
      auto: false,
    };
    const updated = [...todos, item];
    setTodos(updated);
    saveTodos(updated);
    setNewTodo("");
  };

  const toggleDone = (id: string, done: boolean) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, done } : t));
    setTodos(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  const pending = allItems.filter((t) => !t.done);
  const done = allItems.filter((t) => t.done);

  return (
    <div className="space-y-5" data-ocid="admin.todo_panel">
      <div className="glass-light rounded-2xl p-5">
        <h3 className="font-sans-display font-bold text-foreground mb-4 flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-forest" />
          To-Do ({pending.length} pending)
        </h3>

        {/* Add manual todo */}
        <div className="flex gap-2 mb-5">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
            placeholder="Add a task..."
            className="flex-1 bg-white/70"
            data-ocid="admin.todo_input"
          />
          <Button
            onClick={addTodo}
            disabled={!newTodo.trim()}
            className="bg-forest text-white hover:bg-forest/90"
            data-ocid="admin.todo_add_button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Pending items */}
        <div className="space-y-2">
          {pending.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: item.auto
                  ? "rgba(99,102,241,0.04)"
                  : "rgba(255,255,255,0.5)",
                border: item.auto
                  ? "1px solid rgba(99,102,241,0.12)"
                  : "1px solid rgba(0,0,0,0.06)",
              }}
              data-ocid={`admin.todo_item.${i + 1}`}
            >
              <button
                type="button"
                onClick={() => {
                  if (!item.auto) toggleDone(item.id, true);
                }}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  item.auto
                    ? "border-indigo-300 bg-indigo-50 cursor-default"
                    : "border-border hover:border-forest cursor-pointer"
                }`}
                data-ocid={`admin.todo_checkbox.${i + 1}`}
              />
              <span className="font-body text-sm text-foreground flex-1">
                {item.text}
              </span>
              {item.auto && (
                <span className="text-[10px] text-indigo-500 font-body bg-indigo-50 px-1.5 py-0.5 rounded-full">
                  auto
                </span>
              )}
              {!item.auto && (
                <button
                  type="button"
                  onClick={() => deleteTodo(item.id)}
                  className="text-muted-foreground hover:text-red-500"
                  data-ocid={`admin.todo_delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {pending.length === 0 && (
            <div
              className="text-center py-8 text-muted-foreground font-body text-sm"
              data-ocid="admin.todo_empty_state"
            >
              All caught up! No pending tasks. ✓
            </div>
          )}
        </div>
      </div>

      {/* Done items */}
      {done.length > 0 && (
        <div className="glass-light rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans-display font-semibold text-muted-foreground text-sm">
              Completed ({done.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                // Remove manual completed todos, keep auto ones out of display
                const updated = todos.filter((t) => !t.done);
                setTodos(updated);
                saveTodos(updated);
              }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-body px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              data-ocid="admin.todo_clear_completed_button"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {done.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl opacity-60"
                style={{
                  background: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
                data-ocid={`admin.todo_done_item.${i + 1}`}
              >
                <div className="w-5 h-5 rounded-md bg-forest border-2 border-forest flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="font-body text-sm text-muted-foreground flex-1 line-through">
                  {item.text}
                </span>
                {!item.auto && (
                  <button
                    type="button"
                    onClick={() => toggleDone(item.id, false)}
                    className="text-muted-foreground hover:text-foreground"
                    data-ocid={`admin.todo_undo_button.${i + 1}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────────────
export default function AdminPage({
  onOpenSignIn,
}: { onOpenSignIn?: () => void }) {
  const { isAdmin: isAuthAdmin, signOut: authSignOut } = useAuth();
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(
    () => sessionStorage.getItem("adminUnlocked") === "1",
  );
  const [passcode, setPasscode] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordError, setEditPasswordError] = useState("");
  const { content: editableContent, save: saveContent } =
    useEditableContentAdmin();
  const [editDraft, setEditDraft] = useState(editableContent);

  // Info edit mode
  const [infoEditUnlocked, setInfoEditUnlocked] = useState(false);
  const [showInfoEditModal, setShowInfoEditModal] = useState(false);
  const [infoPassword, setInfoPassword] = useState("");
  const [infoPasswordError, setInfoPasswordError] = useState("");
  const [statsOverride, setStatsOverrideState] =
    useState<StatsOverride>(loadStatsOverride);
  const [overrideDraft, setOverrideDraft] =
    useState<StatsOverride>(loadStatsOverride);

  // Decline modal
  const [declineOrderId, setDeclineOrderId] = useState<string | null>(null);

  // Queries
  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  const { data: orders, isLoading: isLoadingOrders } = useGetAllOrders();
  const { data: cancelRequests } = useGetAllCancelRequests();
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const { mutate: updateCancelRequest } = useUpdateCancelRequest();

  // Search
  const [orderSearchId, setOrderSearchId] = useState("");

  // Auto-logout after 10 minutes inactivity
  const lastActivityRef = useRef(Date.now());
  useEffect(() => {
    if (!passcodeUnlocked) return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > AUTO_LOGOUT_MS) {
        sessionStorage.removeItem("adminUnlocked");
        setPasscodeUnlocked(false);
        toast.info("Admin session expired after 10 minutes of inactivity");
      }
    }, 30_000); // check every 30s

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    // Clear on tab close
    const handleUnload = () => {
      sessionStorage.removeItem("adminUnlocked");
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [passcodeUnlocked]);

  const filteredOrders = orders
    ? orderSearchId.trim()
      ? orders.filter((o) =>
          o.id.toLowerCase().includes(orderSearchId.trim().toLowerCase()),
        )
      : orders
    : [];

  // Order tabs
  const ordersByTab = {
    toWorkOn: filteredOrders.filter(
      (o) =>
        statusToTab(o.status) === "pending" ||
        statusToTab(o.status) === "accepted",
    ),
    pending: filteredOrders.filter((o) => statusToTab(o.status) === "pending"),
    accepted: filteredOrders.filter(
      (o) => statusToTab(o.status) === "accepted",
    ),
    processing: filteredOrders.filter(
      (o) => statusToTab(o.status) === "processing",
    ),
    dispatched: filteredOrders.filter(
      (o) => statusToTab(o.status) === "dispatched",
    ),
    delivered: filteredOrders.filter(
      (o) => statusToTab(o.status) === "delivered",
    ),
    declined: filteredOrders.filter(
      (o) => statusToTab(o.status) === "declined",
    ),
    cancelled: filteredOrders.filter(
      (o) => statusToTab(o.status) === "cancelled",
    ),
  };

  // Stats values (with optional override)
  const rawStats = stats;
  const useOverride = statsOverride.enabled;
  const totalOrders = useOverride
    ? statsOverride.totalOrders
    : rawStats
      ? Number(rawStats.totalOrders)
      : 0;
  const totalRevenue = useOverride
    ? statsOverride.totalRevenue
    : rawStats
      ? Number(rawStats.totalRevenue)
      : 0;
  const totalProfit = useOverride
    ? statsOverride.totalProfit
    : rawStats
      ? Number(rawStats.totalProfit)
      : 0;
  const baseOrders = useOverride
    ? statsOverride.baseOrders
    : rawStats
      ? Number(rawStats.baseOrders)
      : 0;
  const premiumOrders = useOverride
    ? statsOverride.premiumOrders
    : rawStats
      ? Number(rawStats.premiumOrders)
      : 0;
  const eliteOrders = useOverride
    ? statsOverride.eliteOrders
    : rawStats
      ? Number(rawStats.eliteOrders)
      : 0;

  const investmentUsed = Number(
    localStorage.getItem("examkit_investment") ?? INVESTMENT_AMOUNT,
  );
  // Include budget planner income/expense in effective profit
  const budgetEntries: Array<{ type: string; amount: number }> = JSON.parse(
    localStorage.getItem("examkit_budget") ?? "[]",
  );
  const budgetIncome = budgetEntries
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + e.amount, 0);
  const budgetExpense = budgetEntries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);
  const effectiveProfit = totalProfit + budgetIncome - budgetExpense;
  const breakEvenRemaining = Math.max(0, investmentUsed - effectiveProfit);
  const breakEvenAchieved = effectiveProfit >= investmentUsed;

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatus(
      { orderId, newStatus },
      {
        onSuccess: () => toast.success(`Updated to ${newStatus}`),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const handleAcceptOrder = (orderId: string) => {
    updateStatus(
      { orderId, newStatus: "Order Accepted" },
      {
        onSuccess: () => toast.success("Order accepted!"),
        onError: () => toast.error("Failed to accept order"),
      },
    );
  };

  const handleDeclineConfirm = (orderId: string) => {
    updateStatus(
      { orderId, newStatus: "Declined" },
      {
        onSuccess: () => {
          toast.success("Order declined");
          setDeclineOrderId(null);
        },
        onError: () => toast.error("Failed to decline order"),
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

  const handleRecoveryLogin = () => {
    if (recoveryCode.trim() === ADMIN_RECOVERY_CODE) {
      sessionStorage.setItem("adminUnlocked", "1");
      setPasscodeUnlocked(true);
      toast.success("Access granted via recovery code");
    } else {
      toast.error("Incorrect recovery code");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminUnlocked");
    setPasscodeUnlocked(false);
    setPasscode("");
    authSignOut();
    toast.success("Logged out");
  };

  const handleEditButtonClick = () => {
    setEditDraft({ ...editableContent });
    setEditPassword("");
    setEditPasswordError("");
    setShowEditPasswordModal(true);
  };

  const handleEditPasswordSubmit = () => {
    if (editPassword === ADMIN_EDIT_PASSWORD) {
      setShowEditPasswordModal(false);
      setEditMode(true);
      setEditPassword("");
      toast.success("Edit mode enabled");
    } else {
      setEditPasswordError("Incorrect password");
    }
  };

  const handleSaveEdit = () => {
    saveContent(editDraft);
    setEditMode(false);
    toast.success("Changes saved site-wide");
  };

  const handleCancelEdit = () => {
    setEditDraft(editableContent);
    setEditMode(false);
    toast.info("Edit cancelled");
  };

  const handleInfoEditOpen = () => {
    setOverrideDraft({ ...statsOverride });
    setInfoPassword("");
    setInfoPasswordError("");
    setShowInfoEditModal(true);
  };

  const handleInfoPasswordSubmit = () => {
    if (infoPassword === ADMIN_INFO_PASSWORD) {
      setShowInfoEditModal(false);
      setInfoEditUnlocked(true);
      setInfoPassword("");
      toast.success("Info edit mode enabled");
    } else {
      setInfoPasswordError("Incorrect password");
    }
  };

  const handleSaveInfoOverride = () => {
    const updated = { ...overrideDraft, enabled: true };
    saveStatsOverride(updated);
    setStatsOverrideState(updated);
    setInfoEditUnlocked(false);
    toast.success("Stats overridden");
  };

  const handleCancelInfoEdit = () => {
    setOverrideDraft(statsOverride);
    setInfoEditUnlocked(false);
  };

  const handleDisableOverride = () => {
    const updated = { ...statsOverride, enabled: false };
    saveStatsOverride(updated);
    setStatsOverrideState(updated);
    setInfoEditUnlocked(false);
    toast.success("Using real stats again");
  };

  // ── Step 1: Must be signed in as admin account ──────────────────────────
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
                }}
              >
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white mb-2">
                Access Denied
              </h1>
              <p className="text-white/60 font-body text-sm mb-8">
                This page is only accessible to the store admin.
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

  // ── Step 2: Passcode gate ───────────────────────────────────────────────
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
              {!showForgot ? (
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
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="w-full text-sm text-white/50 hover:text-white/80 transition-colors font-body pt-1"
                    data-ocid="admin.forgot_password_link"
                  >
                    Forgot password?
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/60 font-body text-sm">
                    Enter your recovery code to access the dashboard.
                  </p>
                  <Input
                    type="password"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRecoveryLogin();
                    }}
                    placeholder="Enter recovery code..."
                    className="bg-white/10 border-white/25 text-white placeholder:text-white/35 focus-visible:ring-white/30 focus-visible:border-white/50 text-center text-lg tracking-widest"
                    data-ocid="admin.recovery_code_input"
                  />
                  <Button
                    onClick={handleRecoveryLogin}
                    disabled={!recoveryCode.trim()}
                    className="w-full font-sans-display font-bold py-3 text-base rounded-xl"
                    style={{
                      background: "oklch(0.78 0.12 72)",
                      color: "oklch(0.19 0.035 155)",
                      border: "none",
                    }}
                    data-ocid="admin.recovery_submit_button"
                  >
                    Recover Access
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setRecoveryCode("");
                    }}
                    className="w-full text-sm text-white/50 hover:text-white/80 transition-colors font-body pt-1"
                    data-ocid="admin.back_to_login_link"
                  >
                    Back to passcode
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────
  return (
    <>
      <div
        className={`min-h-[calc(100vh-56px)] bg-background py-8 px-4 ${
          editMode ? "pb-24" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8 flex items-start justify-between flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground font-body">
                Exam Success Kit — Business Console
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!editMode && (
                <Button
                  onClick={handleEditButtonClick}
                  variant="outline"
                  size="sm"
                  className="font-sans-display text-sm border-blue-200 text-blue-600 hover:bg-blue-50"
                  data-ocid="admin.edit_button"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit Site
                </Button>
              )}
              <ClearHistoryDialog />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="font-sans-display text-sm"
                data-ocid="admin.logout_button"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            </div>
          </motion.div>

          {/* Edit password modal */}
          {showEditPasswordModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
            >
              <motion.div
                className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl w-full max-w-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                data-ocid="admin.edit_password_modal"
              >
                <div
                  className="absolute inset-0 -z-10 opacity-80"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.19 0.035 155) 0%, oklch(0.26 0.06 155) 100%)",
                  }}
                />
                <div className="relative p-8">
                  <h2 className="font-display text-2xl font-bold text-white mb-1 text-center">
                    Edit Site Content
                  </h2>
                  <p className="text-white/60 font-body text-sm mb-6 text-center">
                    Enter the edit password to modify site content.
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      value={editPassword}
                      onChange={(e) => {
                        setEditPassword(e.target.value);
                        setEditPasswordError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditPasswordSubmit();
                      }}
                      placeholder="Edit password..."
                      className="bg-white/10 border-white/25 text-white placeholder:text-white/35 text-center text-lg tracking-widest"
                      data-ocid="admin.edit_password_input"
                    />
                    {editPasswordError && (
                      <p className="text-red-400 text-sm font-body text-center">
                        {editPasswordError}
                      </p>
                    )}
                    <Button
                      onClick={handleEditPasswordSubmit}
                      disabled={!editPassword.trim()}
                      className="w-full font-sans-display font-bold py-3 text-base rounded-xl"
                      style={{
                        background: "oklch(0.78 0.12 72)",
                        color: "oklch(0.19 0.035 155)",
                        border: "none",
                      }}
                      data-ocid="admin.edit_password_submit_button"
                    >
                      Enable Edit Mode
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditPasswordModal(false);
                        setEditPassword("");
                        setEditPasswordError("");
                      }}
                      className="w-full text-sm text-white/50 hover:text-white/80 transition-colors font-body pt-1"
                      data-ocid="admin.edit_password_cancel_button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Info edit password modal */}
          {showInfoEditModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
            >
              <motion.div
                className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl w-full max-w-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                data-ocid="admin.info_edit_modal"
              >
                <div
                  className="absolute inset-0 -z-10 opacity-80"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.19 0.035 155) 0%, oklch(0.26 0.06 155) 100%)",
                  }}
                />
                <div className="relative p-8">
                  <h2 className="font-display text-2xl font-bold text-white mb-1 text-center">
                    Edit Stats
                  </h2>
                  <p className="text-white/60 font-body text-sm mb-6 text-center">
                    Enter info edit password.
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      value={infoPassword}
                      onChange={(e) => {
                        setInfoPassword(e.target.value);
                        setInfoPasswordError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInfoPasswordSubmit();
                      }}
                      placeholder="Info edit password..."
                      className="bg-white/10 border-white/25 text-white placeholder:text-white/35 text-center text-lg tracking-widest"
                      data-ocid="admin.info_password_input"
                    />
                    {infoPasswordError && (
                      <p className="text-red-400 text-sm font-body text-center">
                        {infoPasswordError}
                      </p>
                    )}
                    <Button
                      onClick={handleInfoPasswordSubmit}
                      disabled={!infoPassword.trim()}
                      className="w-full font-sans-display font-bold py-3 text-base rounded-xl"
                      style={{
                        background: "oklch(0.78 0.12 72)",
                        color: "oklch(0.19 0.035 155)",
                        border: "none",
                      }}
                      data-ocid="admin.info_password_submit_button"
                    >
                      Unlock Stats Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInfoEditModal(false);
                        setInfoPassword("");
                        setInfoPasswordError("");
                      }}
                      className="w-full text-sm text-white/50 hover:text-white/80 transition-colors font-body pt-1"
                      data-ocid="admin.info_password_cancel_button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Decline modal */}
          {declineOrderId && (
            <DeclineOverrideModal
              orderId={declineOrderId}
              onConfirm={() => handleDeclineConfirm(declineOrderId)}
              onClose={() => setDeclineOrderId(null)}
            />
          )}

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isLoadingStats ? (
              Array.from({ length: 5 }).map((_, idx) => (
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
                      B: {baseOrders} · P: {premiumOrders} · E: {eliteOrders}
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
                    <div className="font-display text-3xl font-bold text-foreground">
                      ₹{totalProfit.toLocaleString("en-IN")}
                    </div>
                  </CardContent>
                </Card>

                {/* Break-even card — cash countdown */}
                <Card
                  className="glass-light glass-hover rounded-2xl"
                  data-ocid="admin.stats_card.4"
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-sans-display text-muted-foreground">
                        Break-Even
                      </CardTitle>
                      <Target className="w-4 h-4 text-forest" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {breakEvenAchieved ? (
                      <div>
                        <div className="font-display text-lg font-bold text-green-600">
                          ✅ Achieved!
                        </div>
                        <div className="text-xs text-green-600 font-body mt-1">
                          ₹
                          {(effectiveProfit - investmentUsed).toLocaleString(
                            "en-IN",
                          )}{" "}
                          above target
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-display text-2xl font-bold text-foreground">
                          ₹{breakEvenRemaining.toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-muted-foreground font-body mt-1">
                          more profit needed
                        </div>
                        <Progress
                          value={Math.min(
                            (effectiveProfit / investmentUsed) * 100,
                            100,
                          )}
                          className="mt-2 h-1.5"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card
                  className="glass-light glass-hover rounded-2xl"
                  data-ocid="admin.stats_card.5"
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-sans-display text-muted-foreground">
                        Cancel Requests
                      </CardTitle>
                      <Inbox className="w-4 h-4 text-forest" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="font-display text-3xl font-bold text-foreground">
                      {rawStats ? Number(rawStats.pendingCancelRequests) : 0}
                    </div>
                    <div className="text-xs text-muted-foreground font-body mt-1">
                      Pending review
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>

          {/* Info Edit controls */}
          {infoEditUnlocked ? (
            <motion.div
              className="glass-light rounded-2xl p-5 mb-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="admin.info_edit_panel"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans-display font-bold text-foreground">
                  Edit Stats Override
                </h3>
                <div className="flex items-center gap-2">
                  {statsOverride.enabled && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDisableOverride}
                      className="text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    >
                      Use Real Stats
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSaveInfoOverride}
                    className="text-xs bg-forest text-white"
                    data-ocid="admin.info_save_button"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelInfoEdit}
                    data-ocid="admin.info_cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {(
                  [
                    ["totalOrders", "Total Orders"],
                    ["totalRevenue", "Revenue (₹)"],
                    ["totalProfit", "Profit (₹)"],
                    ["baseOrders", "Base Orders"],
                    ["premiumOrders", "Premium Orders"],
                    ["eliteOrders", "Elite Orders"],
                  ] as [keyof StatsOverride, string][]
                ).map(([key, label]) => (
                  <div key={key}>
                    <Label className="text-xs font-body text-muted-foreground mb-1 block">
                      {label}
                    </Label>
                    <Input
                      type="number"
                      value={(overrideDraft[key] as number) ?? 0}
                      onChange={(e) =>
                        setOverrideDraft((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="h-8 text-sm bg-white/70"
                      data-ocid={`admin.info_${key}_input`}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleInfoEditOpen}
                className="text-xs font-sans-display border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                data-ocid="admin.info_edit_button"
              >
                <Lock className="w-3 h-3 mr-1.5" />
                Edit Stats (RDS@INFO)
              </Button>
            </div>
          )}

          {/* Main Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="orders">
              <TabsList
                className="flex flex-wrap gap-1 h-auto bg-muted/50 rounded-xl p-1 mb-6"
                data-ocid="admin.main_tabs"
              >
                <TabsTrigger
                  value="orders"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="admin.orders_tab"
                >
                  <Package className="w-3.5 h-3.5 mr-1.5" />
                  Orders ({filteredOrders.length})
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="admin.requests_tab"
                >
                  <Inbox className="w-3.5 h-3.5 mr-1.5" />
                  Requests
                  {cancelRequests &&
                    cancelRequests.filter((r) => r.status === "Pending")
                      .length > 0 && (
                      <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                        {
                          cancelRequests.filter((r) => r.status === "Pending")
                            .length
                        }
                      </span>
                    )}
                </TabsTrigger>
                <TabsTrigger
                  value="todos"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="admin.todos_tab"
                >
                  <ListTodo className="w-3.5 h-3.5 mr-1.5" />
                  To-Do
                </TabsTrigger>
                <TabsTrigger
                  value="budget"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="admin.budget_tab"
                >
                  <Wallet className="w-3.5 h-3.5 mr-1.5" />
                  Budget
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="admin.notes_tab"
                >
                  <StickyNote className="w-3.5 h-3.5 mr-1.5" />
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="toolkit"
                  className="rounded-lg font-sans-display text-sm"
                  data-ocid="admin.toolkit_tab"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Toolkit
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                {/* Search bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={orderSearchId}
                      onChange={(e) => setOrderSearchId(e.target.value)}
                      placeholder="Search by Order ID..."
                      className="pl-9 bg-white/70"
                      data-ocid="admin.order_search_input"
                    />
                  </div>
                  {orderSearchId && (
                    <Button
                      variant="outline"
                      onClick={() => setOrderSearchId("")}
                      data-ocid="admin.clear_search_button"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Status sub-tabs */}
                <Tabs defaultValue="pending">
                  <TabsList
                    className="flex flex-wrap gap-1 h-auto bg-muted/30 rounded-xl p-1"
                    data-ocid="admin.order_status_tabs"
                  >
                    {(
                      [
                        ["toWorkOn", "To Work On", ordersByTab.toWorkOn.length],
                        ["pending", "Pending", ordersByTab.pending.length],
                        ["accepted", "Accepted", ordersByTab.accepted.length],
                        [
                          "processing",
                          "Processing",
                          ordersByTab.processing.length,
                        ],
                        [
                          "dispatched",
                          "Dispatched",
                          ordersByTab.dispatched.length,
                        ],
                        [
                          "delivered",
                          "Delivered",
                          ordersByTab.delivered.length,
                        ],
                        ["declined", "Declined", ordersByTab.declined.length],
                        [
                          "cancelled",
                          "Cancelled",
                          ordersByTab.cancelled.length,
                        ],
                      ] as [string, string, number][]
                    ).map(([val, label, count]) => (
                      <TabsTrigger
                        key={val}
                        value={val}
                        className="rounded-lg font-sans-display text-xs"
                        data-ocid={`admin.order_${val}_tab`}
                      >
                        {label}
                        {count > 0 && (
                          <span
                            className={`ml-1 text-[10px] rounded-full px-1.5 py-0.5 ${
                              val === "toWorkOn"
                                ? "bg-amber-500 text-white"
                                : val === "pending"
                                  ? "bg-yellow-500 text-white"
                                  : val === "declined" || val === "cancelled"
                                    ? "bg-red-500 text-white"
                                    : "bg-forest text-white"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(ordersByTab).map(([tabKey, tabOrders]) => (
                    <TabsContent key={tabKey} value={tabKey}>
                      {isLoadingOrders ? (
                        <div
                          className="space-y-2"
                          data-ocid="admin.orders_loading_state"
                        >
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-14 rounded-xl" />
                          ))}
                        </div>
                      ) : tabOrders.length === 0 ? (
                        <div
                          className="text-center py-12 glass-light rounded-2xl"
                          data-ocid="admin.orders_empty_state"
                        >
                          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="font-sans-display text-muted-foreground text-sm">
                            No orders in this category
                          </p>
                        </div>
                      ) : (
                        <div
                          className="glass-light rounded-2xl overflow-hidden"
                          data-ocid="admin.orders_table"
                        >
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-sans-display text-xs">
                                  Order ID
                                </TableHead>
                                <TableHead className="font-sans-display text-xs">
                                  Customer
                                </TableHead>
                                <TableHead className="font-sans-display text-xs">
                                  Edition
                                </TableHead>
                                <TableHead className="font-sans-display text-xs">
                                  Due Date
                                </TableHead>
                                <TableHead className="font-sans-display text-xs">
                                  Status
                                </TableHead>
                                <TableHead className="font-sans-display text-xs">
                                  Update
                                </TableHead>
                                <TableHead className="font-sans-display text-xs">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tabOrders.map((order, idx) => (
                                <OrderRow
                                  key={order.id}
                                  order={order}
                                  index={idx}
                                  onStatusChange={handleStatusUpdate}
                                  onDecline={setDeclineOrderId}
                                  onAccept={handleAcceptOrder}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>

              {/* Cancel/Refund Requests */}
              <TabsContent value="requests">
                {!cancelRequests || cancelRequests.length === 0 ? (
                  <div
                    className="text-center py-16 glass-light rounded-2xl"
                    data-ocid="admin.requests_empty_state"
                  >
                    <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-sans-display font-semibold text-foreground">
                      No cancel requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm font-body">
                      {
                        cancelRequests.filter((r) => r.status === "Pending")
                          .length
                      }{" "}
                      pending review
                    </p>
                    {cancelRequests.map((req, idx) => (
                      <RequestCard
                        key={req.id}
                        req={req}
                        index={idx}
                        onAccept={() =>
                          updateCancelRequest(
                            { requestId: req.id, newStatus: "Accepted" },
                            {
                              onSuccess: () =>
                                toast.success("Request accepted"),
                              onError: () => toast.error("Failed to accept"),
                            },
                          )
                        }
                        onDecline={() =>
                          updateCancelRequest(
                            { requestId: req.id, newStatus: "Declined" },
                            {
                              onSuccess: () =>
                                toast.success("Request declined"),
                              onError: () => toast.error("Failed to decline"),
                            },
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* To-Do Tab */}
              <TabsContent value="todos">
                <TodoListTab orders={orders ?? []} />
              </TabsContent>

              {/* Budget Tab */}
              <TabsContent value="budget">
                <BudgetPlannerTab />
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <AdminNotesTab />
              </TabsContent>

              {/* Toolkit Tab */}
              <TabsContent value="toolkit">
                <Tabs defaultValue="cost">
                  <TabsList className="bg-muted/40 rounded-xl mb-6">
                    <TabsTrigger
                      value="cost"
                      className="font-sans-display text-sm"
                    >
                      Cost Structure
                    </TabsTrigger>
                    <TabsTrigger
                      value="plan"
                      className="font-sans-display text-sm"
                    >
                      90-Day Plan
                    </TabsTrigger>
                    <TabsTrigger
                      value="scale"
                      className="font-sans-display text-sm"
                    >
                      Scale Roadmap
                    </TabsTrigger>
                    <TabsTrigger
                      value="edit"
                      className="font-sans-display text-sm"
                    >
                      Site Content
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="cost">
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Base ₹449",
                          costs: baseCosts,
                          profit:
                            499 - baseCosts.reduce((s, c) => s + c.cost, 0),
                          color: "oklch(0.34 0.095 155)",
                        },
                        {
                          label: "Premium ₹549",
                          costs: premiumCosts,
                          profit:
                            599 - premiumCosts.reduce((s, c) => s + c.cost, 0),
                          color: "oklch(0.62 0.18 30)",
                        },
                        {
                          label: "Elite ₹850",
                          costs: eliteCosts,
                          profit:
                            850 - eliteCosts.reduce((s, c) => s + c.cost, 0),
                          color: "oklch(0.62 0.18 55)",
                        },
                      ].map(({ label, costs, profit, color }) => (
                        <div
                          key={label}
                          className="glass-light rounded-2xl p-5"
                        >
                          <h3
                            className="font-sans-display font-bold mb-3"
                            style={{ color }}
                          >
                            {label}
                          </h3>
                          <div className="space-y-1.5 mb-3">
                            {costs.map((c) => (
                              <div
                                key={c.component}
                                className="flex justify-between text-xs font-body"
                              >
                                <span className="text-muted-foreground">
                                  {c.component}
                                </span>
                                <span className="font-semibold text-foreground">
                                  ₹{c.cost}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-border/50 pt-2 flex justify-between font-sans-display font-bold text-sm">
                            <span>Profit/unit</span>
                            <span style={{ color }}>₹{profit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="plan">
                    <div className="glass-light rounded-2xl p-5 space-y-4">
                      {[
                        {
                          month: "Month 1",
                          title: "Validation",
                          items: [
                            "Design + research → Final prototype",
                            "Feedback from 10 testers",
                            "Instagram → 20 posts",
                            "Pre-orders → 20 paid",
                          ],
                        },
                        {
                          month: "Month 2",
                          title: "Launch",
                          items: [
                            "Print 50 units → Inventory ready",
                            "Deliver + collect reviews",
                            "5 testimonials",
                            "Paid ads test → Break-even",
                          ],
                        },
                        {
                          month: "Month 3",
                          title: "Scale",
                          items: [
                            "Reinvest → Print 100 units",
                            "Ambassador drive → 20 partners",
                            "Bundle marketing → Increase AOV",
                            "Target → ₹50,000 revenue month",
                          ],
                        },
                      ].map((m) => (
                        <div key={m.month}>
                          <h4 className="font-sans-display font-bold text-foreground mb-2">
                            {m.month} — {m.title}
                          </h4>
                          <ul className="space-y-1">
                            {m.items.map((item) => (
                              <li
                                key={item}
                                className="text-sm font-body text-muted-foreground flex items-start gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="scale">
                    <div className="glass-light rounded-2xl p-5 space-y-3">
                      {[
                        {
                          stage: "Stage 1",
                          revenue: "₹50K/month",
                          action: "Improve packaging",
                        },
                        {
                          stage: "Stage 2",
                          revenue: "₹1L/month",
                          action: "JEE/NEET edition",
                        },
                        {
                          stage: "Stage 3",
                          revenue: "₹3L/month",
                          action: "Coaching partnerships",
                        },
                        {
                          stage: "Stage 4",
                          revenue: "₹10L/month",
                          action: "Dropship bundles",
                        },
                        {
                          stage: "Stage 5",
                          revenue: "₹20L+/month",
                          action: "App development",
                        },
                      ].map((s, i) => (
                        <div
                          key={s.stage}
                          className="flex items-center gap-4 p-3 rounded-xl"
                          style={{
                            background: `oklch(0.34 0.095 155 / ${0.03 + i * 0.015})`,
                            border: `1px solid oklch(0.34 0.095 155 / ${0.06 + i * 0.02})`,
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-white text-sm flex-shrink-0"
                            style={{ background: "oklch(0.34 0.095 155)" }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-sans-display font-bold text-sm text-foreground">
                              {s.revenue}
                            </p>
                            <p className="text-xs text-muted-foreground font-body">
                              {s.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="edit">
                    <div className="glass-light rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-sans-display font-bold text-foreground">
                          Editable Site Content
                        </h3>
                        {!editMode && (
                          <Button
                            size="sm"
                            onClick={handleEditButtonClick}
                            className="text-xs bg-blue-600 text-white hover:bg-blue-700"
                            data-ocid="admin.toolkit_edit_button"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit (RDS@EDIT)
                          </Button>
                        )}
                      </div>
                      {editMode ? (
                        <div className="space-y-3">
                          {(
                            [
                              ["heroTitle", "Hero Title"],
                              ["heroSubtitle", "Hero Subtitle"],
                              ["earlyBirdText", "Early Bird Text"],
                              ["footerPhone", "Footer Phone"],
                              ["footerShipping", "Footer Shipping Info"],
                              ["upgradeNudge", "Upgrade Nudge Text"],
                            ] as [keyof typeof editDraft, string][]
                          ).map(([key, label]) => (
                            <div key={key}>
                              <Label className="font-sans-display text-xs font-semibold mb-1 block">
                                {label}
                              </Label>
                              <Textarea
                                value={editDraft[key]}
                                onChange={(e) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                                rows={2}
                                className="bg-white/70 resize-none text-sm"
                                data-ocid={`admin.edit_${key}_textarea`}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm font-body">
                          {(
                            [
                              ["heroTitle", "Hero Title"],
                              ["heroSubtitle", "Hero Subtitle"],
                              ["earlyBirdText", "Early Bird Text"],
                              ["footerPhone", "Footer Phone"],
                              ["footerShipping", "Footer Shipping Info"],
                              ["upgradeNudge", "Upgrade Nudge"],
                            ] as [keyof typeof editableContent, string][]
                          ).map(([key, label]) => (
                            <div
                              key={key}
                              className="p-3 rounded-xl bg-muted/30 border border-border"
                            >
                              <p className="text-xs text-muted-foreground font-sans-display font-semibold mb-1">
                                {label}
                              </p>
                              <p className="text-foreground">
                                {editableContent[key]}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Floating Edit Bar */}
      <AnimatePresence>
        {editMode && (
          <FloatingEditBar
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
      </AnimatePresence>
    </>
  );
}
