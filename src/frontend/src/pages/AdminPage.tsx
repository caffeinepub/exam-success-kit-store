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
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Crown,
  DollarSign,
  Edit2,
  Inbox,
  Lock,
  LogOut,
  Package,
  Save,
  Search,
  ShieldAlert,
  ShoppingBag,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { CancelRequest, Order } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useEditableContentAdmin } from "../hooks/useEditableContent";
import {
  useClearOrders,
  useGetAllCancelRequests,
  useGetAllOrders,
  useGetStats,
  useUpdateCancelRequest,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const ADMIN_PASSCODE = "RDS@2012";
const ADMIN_RECOVERY_CODE = "Inanis";
const ADMIN_EDIT_PASSWORD = "RDS@EDIT";
const CLEAR_PASSCODE = "Inanis";
const OVERRIDE_PASSWORD = "RDS@2012";

// ── Status config ──────────────────────────────────────────────────────────
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
};

const ALL_STATUSES = [
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
  "Cancelled",
];

const statusIcons: Record<string, typeof Package> = {
  Pending: Package,
  "Order Accepted": CheckCircle2,
  "Payment Received": CheckCircle2,
  Processing: Package,
  Printing: Package,
  "Printing Custom": Package,
  Packing: Package,
  Dispatched: Truck,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
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

// ── Override Modal ────────────────────────────────────────────────────────
function OverrideModal({
  order,
  onClose,
  onConfirm,
}: {
  order: Order;
  onClose: () => void;
  onConfirm: (orderId: string, action: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== OVERRIDE_PASSWORD) {
      setError("Incorrect password");
      return;
    }
    onConfirm(order.id, "Cancelled");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        className="relative rounded-3xl overflow-hidden border border-white/20 w-full max-w-sm"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        data-ocid="admin.override_modal"
      >
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, #ef4444, #f87171)" }}
        />
        <div className="p-6 pt-7">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Admin Override
            </h2>
          </div>
          <p className="text-muted-foreground font-body text-sm mb-4">
            Force cancel order{" "}
            <span className="font-mono text-xs">#{order.id.slice(0, 8)}…</span>{" "}
            for <strong>{order.customerName}</strong>. This bypasses the normal
            cancellation window.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="font-sans-display font-semibold text-sm mb-1.5 block">
                Admin Password
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter admin password"
                className="font-mono"
                data-ocid="admin.override_password_input"
              />
              {error && (
                <p className="text-destructive text-xs mt-1 font-body">
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl font-sans-display"
                onClick={onClose}
                data-ocid="admin.override_cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!password.trim()}
                className="flex-1 rounded-xl font-sans-display font-bold bg-red-600 hover:bg-red-700 text-white"
                data-ocid="admin.override_confirm_button"
              >
                Force Cancel
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── OrderRow ───────────────────────────────────────────────────────────────
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
  const isPending = order.status === "Pending";
  const [showOverride, setShowOverride] = useState(false);

  return (
    <>
      <TableRow data-ocid={`admin.order_row.${index + 1}`}>
        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {order.id}
        </TableCell>
        <TableCell className="font-sans-display font-semibold text-foreground text-sm">
          {order.customerName}
          {order.customName && (
            <span className="text-xs text-amber-600 block font-body">
              Cover: {order.customName}
            </span>
          )}
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
        <TableCell>
          <Select
            value={order.status}
            onValueChange={(val) => onStatusUpdate(order.id, val)}
          >
            <SelectTrigger
              className={`w-36 h-7 text-xs border ${statusStyle}`}
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
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground font-body">
          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPending && (
              <Button
                size="sm"
                className="h-7 text-xs px-2 bg-blue-600 hover:bg-blue-700 text-white font-sans-display"
                onClick={() => onStatusUpdate(order.id, "Order Accepted")}
                data-ocid={`admin.accept_order_button.${index + 1}`}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Accept
              </Button>
            )}
            {order.status !== "Cancelled" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2 border-red-200 text-red-600 hover:bg-red-50 font-sans-display"
                onClick={() => setShowOverride(true)}
                data-ocid={`admin.override_button.${index + 1}`}
              >
                Override
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {showOverride && (
        <OverrideModal
          order={order}
          onClose={() => setShowOverride(false)}
          onConfirm={(orderId, _action) => onStatusUpdate(orderId, "Cancelled")}
        />
      )}
    </>
  );
}

// ── Cancel Requests Panel ──────────────────────────────────────────────────
function CancelRequestsPanel() {
  const { data: requests, isLoading } = useGetAllCancelRequests();
  const { mutate: updateRequest } = useUpdateCancelRequest();
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const [confirmModal, setConfirmModal] = useState<{
    requestId: string;
    orderId: string;
    action: "Accepted" | "Declined";
  } | null>(null);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const handleConfirm = () => {
    if (password !== OVERRIDE_PASSWORD) {
      setPwError("Incorrect password");
      return;
    }
    if (!confirmModal) return;
    updateRequest(
      { requestId: confirmModal.requestId, newStatus: confirmModal.action },
      {
        onSuccess: () => {
          if (confirmModal.action === "Accepted") {
            updateStatus({
              orderId: confirmModal.orderId,
              newStatus: "Cancelled",
            });
            toast.success("Request accepted — order cancelled");
          } else {
            toast.success("Request declined");
          }
          setConfirmModal(null);
          setPassword("");
          setPwError("");
        },
        onError: () => toast.error("Failed to update request"),
      },
    );
  };

  const pending = requests?.filter((r) => r.status === "Pending") ?? [];
  const resolved = requests?.filter((r) => r.status !== "Pending") ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pending.length === 0 && (
        <div
          className="text-center py-14 glass-light rounded-2xl"
          data-ocid="admin.requests_empty_state"
        >
          <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-sans-display font-semibold text-foreground">
            No pending requests
          </p>
          <p className="text-muted-foreground text-sm font-body mt-1">
            All cancel/refund requests will appear here
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h3 className="font-sans-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((req, idx) => (
              <RequestCard
                key={req.id}
                req={req}
                index={idx}
                onAccept={() =>
                  setConfirmModal({
                    requestId: req.id,
                    orderId: req.orderId,
                    action: "Accepted",
                  })
                }
                onDecline={() =>
                  setConfirmModal({
                    requestId: req.id,
                    orderId: req.orderId,
                    action: "Declined",
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="font-sans-display font-bold text-sm text-muted-foreground mb-3">
            Resolved ({resolved.length})
          </h3>
          <div className="space-y-3">
            {resolved.map((req, idx) => (
              <RequestCard
                key={req.id}
                req={req}
                index={idx + pending.length}
                readonly
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            className="relative rounded-3xl overflow-hidden w-full max-w-sm bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            data-ocid="admin.request_confirm_modal"
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Confirm{" "}
                  {confirmModal.action === "Accepted" ? "Accept" : "Decline"}
                </h3>
              </div>
              <p className="text-muted-foreground font-body text-sm mb-4">
                {confirmModal.action === "Accepted"
                  ? "This will accept the request and cancel the related order."
                  : "This will decline the request. Customer will be notified."}
              </p>
              <div className="space-y-3">
                <div>
                  <Label className="font-sans-display font-semibold text-sm mb-1.5 block">
                    Admin Password
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPwError("");
                    }}
                    placeholder="Enter admin password"
                    className="font-mono"
                    data-ocid="admin.request_confirm_password_input"
                  />
                  {pwError && (
                    <p className="text-destructive text-xs mt-1 font-body">
                      {pwError}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl font-sans-display"
                    onClick={() => {
                      setConfirmModal(null);
                      setPassword("");
                      setPwError("");
                    }}
                    data-ocid="admin.request_confirm_cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!password.trim()}
                    onClick={handleConfirm}
                    className={`flex-1 rounded-xl font-sans-display font-bold ${
                      confirmModal.action === "Accepted"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                    data-ocid="admin.request_confirm_submit_button"
                  >
                    {confirmModal.action === "Accepted" ? "Accept" : "Decline"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function RequestCard({
  req,
  index,
  readonly = false,
  onAccept,
  onDecline,
}: {
  req: CancelRequest;
  index: number;
  readonly?: boolean;
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
            Order:{" "}
            <span className="font-mono">{req.orderId.slice(0, 10)}…</span>
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
      {!readonly && req.status === "Pending" && (
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

// ── Clear History Dialog ───────────────────────────────────────────────────
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
            This will permanently delete selected orders. Choose what to clear
            and enter your confirmation code.
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

// ── Floating Edit Bar ──────────────────────────────────────────────────────
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

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordError, setEditPasswordError] = useState("");

  const { content: editableContent, save: saveContent } =
    useEditableContentAdmin();
  const [editDraft, setEditDraft] = useState(editableContent);

  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  const { data: orders, isLoading: isLoadingOrders } = useGetAllOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const [orderSearchId, setOrderSearchId] = useState("");

  const filteredOrders = orders
    ? orderSearchId.trim()
      ? orders.filter((o) =>
          o.id.toLowerCase().includes(orderSearchId.trim().toLowerCase()),
        )
      : orders
    : [];

  const pendingCancelRequests = stats ? Number(stats.pendingCancelRequests) : 0;

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatus(
      { orderId, newStatus },
      {
        onSuccess: () => toast.success(`Order updated to ${newStatus}`),
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
      toast.success("Edit mode enabled — changes apply site-wide");
    } else {
      setEditPasswordError("Incorrect password");
    }
  };

  const handleSaveEdit = () => {
    saveContent(editDraft);
    setEditMode(false);
    toast.success("Changes saved — will reflect site-wide on next reload");
  };

  const handleCancelEdit = () => {
    setEditDraft(editableContent);
    setEditMode(false);
    toast.info("Edit cancelled");
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

  // STEP 2: Passcode gate
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
                    <Lock className="w-4 h-4 mr-2" />
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

  const totalOrders = stats ? Number(stats.totalOrders) : 0;
  const totalRevenue = stats ? Number(stats.totalRevenue) : 0;
  const totalProfit = stats ? Number(stats.totalProfit) : 0;
  const earlyBirdUsed = stats ? Number(stats.earlyBirdUsed) : 0;
  const baseOrders = stats ? Number(stats.baseOrders) : 0;
  const premiumOrders = stats ? Number(stats.premiumOrders) : 0;
  const eliteOrders = stats ? Number(stats.eliteOrders) : 0;
  const breakEvenProgress = Math.min((totalOrders / 33) * 100, 100);

  return (
    <>
      <div
        className={`min-h-[calc(100vh-56px)] bg-background py-8 px-4 ${editMode ? "pb-24" : ""}`}
      >
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
            <div className="flex items-center gap-2 flex-wrap">
              {!editMode && (
                <Button
                  onClick={handleEditButtonClick}
                  variant="outline"
                  size="sm"
                  className="font-sans-display text-sm border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
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
                className="font-sans-display text-sm border-border hover:bg-muted"
                data-ocid="admin.logout_button"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            </div>

            {/* Edit Password Modal */}
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
                    boxShadow:
                      "0 25px 50px -12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
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
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}
                    >
                      <Edit2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-1 text-center">
                      Edit Mode
                    </h2>
                    <p className="text-white/60 font-body text-sm mb-6 text-center">
                      Enter the edit password to make changes to site content.
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
                        className="bg-white/10 border-white/25 text-white placeholder:text-white/35 focus-visible:ring-white/30 text-center text-lg tracking-widest"
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
                        <Edit2 className="w-4 h-4 mr-2" />
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
          </motion.div>

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
                    <div className="font-display text-3xl font-bold text-forest">
                      ₹{totalProfit.toLocaleString("en-IN")}
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
                        ? "✓ Reached!"
                        : `${Math.max(0, 33 - totalOrders)} to go`}
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`glass-light glass-hover rounded-2xl ${pendingCancelRequests > 0 ? "ring-2 ring-amber-300" : ""}`}
                  data-ocid="admin.stats_card.5"
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-sans-display text-muted-foreground">
                        Cancel Reqs
                      </CardTitle>
                      <AlertTriangle
                        className={`w-4 h-4 ${pendingCancelRequests > 0 ? "text-amber-500" : "text-muted-foreground"}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div
                      className={`font-display text-3xl font-bold ${pendingCancelRequests > 0 ? "text-amber-600" : "text-foreground"}`}
                    >
                      {pendingCancelRequests}
                    </div>
                    <div className="text-xs text-muted-foreground font-body mt-1">
                      Pending review
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>

          {/* Edit Mode Panel */}
          {editMode && (
            <motion.div
              className="mb-8 glass-light rounded-2xl overflow-hidden"
              style={{ border: "1.5px solid oklch(0.62 0.18 200 / 0.4)" }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="admin.edit_panel"
            >
              <div
                className="px-6 py-4 border-b border-border/40 flex items-center gap-3"
                style={{ background: "oklch(0.62 0.18 200 / 0.07)" }}
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-sans-display font-bold text-foreground">
                  Edit Site Content
                </h3>
                <span className="text-xs text-blue-600 font-body bg-blue-50 px-2 py-0.5 rounded-full">
                  Edit Mode Active
                </span>
              </div>
              <p className="px-6 pt-4 pb-0 text-xs text-muted-foreground font-body">
                Edit site text — hero, footer info, early bird badge, and nudge
                copy. Only text can be changed; prices and layout are not
                affected.
              </p>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: "heroTitle", label: "Hero Heading" },
                  { key: "heroSubtitle", label: "Hero Subtext" },
                  { key: "earlyBirdText", label: "Early Bird Badge" },
                  { key: "upgradeNudge", label: "Upgrade Nudge Text" },
                  { key: "footerPhone", label: "WhatsApp / Contact Number" },
                  { key: "footerShipping", label: "Shipping Info Text" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    {(editDraft as unknown as Record<string, string>)[key]
                      .length > 60 ? (
                      <label className="block space-y-1.5">
                        <span className="text-xs font-sans-display font-semibold text-muted-foreground uppercase tracking-wide">
                          {label}
                        </span>
                        <textarea
                          value={
                            (editDraft as unknown as Record<string, string>)[
                              key
                            ]
                          }
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              [key]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                          rows={3}
                          data-ocid={`admin.edit_field_${key}`}
                        />
                      </label>
                    ) : (
                      <label className="block space-y-1.5">
                        <span className="text-xs font-sans-display font-semibold text-muted-foreground uppercase tracking-wide">
                          {label}
                        </span>
                        <input
                          type="text"
                          value={
                            (editDraft as unknown as Record<string, string>)[
                              key
                            ]
                          }
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              [key]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-blue-400"
                          data-ocid={`admin.edit_field_${key}`}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

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
                Base:
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
                Premium:
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
                Elite:
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
                Early Bird:
              </span>
              <span className="font-sans-display font-bold text-yellow-900">
                {earlyBirdUsed}/20
              </span>
            </div>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Tabs defaultValue="orders">
              <TabsList
                className="flex flex-wrap h-auto gap-1 glass-light p-1 rounded-xl mb-6"
                data-ocid="admin.main_tab_list"
              >
                <TabsTrigger
                  value="orders"
                  className="text-xs rounded-lg"
                  data-ocid="admin.orders_tab"
                >
                  Orders
                  {orders && orders.length > 0 && (
                    <span className="ml-1.5 bg-forest/20 text-forest text-[10px] px-1.5 py-0.5 rounded-full font-sans-display font-bold">
                      {orders.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="text-xs rounded-lg"
                  data-ocid="admin.requests_tab"
                >
                  Requests
                  {pendingCancelRequests > 0 && (
                    <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-sans-display font-bold">
                      {pendingCancelRequests}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="toolkit"
                  className="text-xs rounded-lg"
                  data-ocid="admin.toolkit_tab"
                >
                  Toolkit
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <div
                  className="glass-light rounded-2xl overflow-hidden"
                  data-ocid="admin.orders_table"
                >
                  {/* Search bar */}
                  <div className="p-4 border-b border-border/30">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={orderSearchId}
                        onChange={(e) => setOrderSearchId(e.target.value)}
                        placeholder="Search by Order ID (e.g. ORD-1)"
                        className="pl-9 h-9 text-sm font-mono"
                        data-ocid="admin.order_search_input"
                      />
                    </div>
                  </div>

                  {isLoadingOrders ? (
                    <div className="p-6 space-y-3">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <Skeleton
                          key={idx.toString()}
                          className="h-12 rounded-lg"
                        />
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
                  ) : filteredOrders.length === 0 ? (
                    <div
                      className="text-center py-16"
                      data-ocid="admin.orders_search_empty_state"
                    >
                      <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-sans-display font-semibold text-foreground">
                        No orders match "{orderSearchId}"
                      </p>
                      <p className="text-muted-foreground text-sm font-body mt-1">
                        Try a different Order ID
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
                              Status
                            </TableHead>
                            <TableHead className="font-sans-display text-xs">
                              Date
                            </TableHead>
                            <TableHead className="font-sans-display text-xs">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order, idx) => (
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
              </TabsContent>

              {/* Cancel Requests Tab */}
              <TabsContent value="requests">
                <div className="mb-4">
                  <h2 className="font-sans-display font-bold text-xl text-foreground">
                    Cancel & Refund Requests
                  </h2>
                  <p className="text-muted-foreground font-body text-sm mt-0.5">
                    Review and action customer cancellation and refund requests
                  </p>
                </div>
                <CancelRequestsPanel />
              </TabsContent>

              {/* Business Toolkit Tab */}
              <TabsContent value="toolkit">
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
                      Ambassador
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
                          style={{
                            background: "oklch(0.82 0.07 60 / 0.12)",
                          }}
                        >
                          <h3 className="font-sans-display font-bold text-foreground">
                            Base Eco — ₹499
                          </h3>
                        </div>
                        <Table>
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
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-sans-display font-bold">
                                Total Cost
                              </TableCell>
                              <TableCell className="font-sans-display font-bold text-right">
                                ₹{baseCosts.reduce((s, r) => s + r.cost, 0)}
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-forest/5">
                              <TableCell className="font-sans-display font-bold text-forest">
                                Profit/Unit
                              </TableCell>
                              <TableCell className="font-sans-display font-bold text-forest text-right">
                                ₹
                                {499 -
                                  baseCosts.reduce((s, r) => s + r.cost, 0)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Premium */}
                      <div
                        className="glass-light rounded-2xl overflow-hidden"
                        style={{
                          border: "1px solid oklch(0.62 0.18 30 / 0.3)",
                        }}
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
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-sans-display font-bold">
                                Total Cost
                              </TableCell>
                              <TableCell className="font-sans-display font-bold text-right">
                                ₹{premiumCosts.reduce((s, r) => s + r.cost, 0)}
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-forest/5">
                              <TableCell className="font-sans-display font-bold text-forest">
                                Profit/Unit
                              </TableCell>
                              <TableCell className="font-sans-display font-bold text-forest text-right">
                                ₹
                                {599 -
                                  premiumCosts.reduce((s, r) => s + r.cost, 0)}
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
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-sans-display font-bold">
                                Total Cost
                              </TableCell>
                              <TableCell className="font-sans-display font-bold text-right">
                                ₹{eliteCosts.reduce((s, r) => s + r.cost, 0)}
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-forest/5">
                              <TableCell className="font-sans-display font-bold text-forest">
                                Profit/Unit
                              </TableCell>
                              <TableCell className="font-sans-display font-bold text-forest text-right">
                                ₹
                                {799 -
                                  eliteCosts.reduce((s, r) => s + r.cost, 0)}
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
                            style={{
                              background: "oklch(0.34 0.095 155 / 0.06)",
                            }}
                          >
                            <h3 className="font-sans-display font-bold text-forest">
                              {month.month}
                            </h3>
                          </div>
                          <Table>
                            <TableBody>
                              {month.weeks.map((w) => (
                                <TableRow key={w.week}>
                                  <TableCell className="font-sans-display font-semibold text-sm w-20">
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
                          Offer: Free digital kit + 20% commission
                        </p>
                      </div>
                      <div className="text-center py-12 text-muted-foreground font-body">
                        <div className="flex flex-col items-center gap-2">
                          <Star className="w-8 h-8 text-muted-foreground/40" />
                          <p className="font-sans-display font-semibold text-foreground">
                            No ambassadors yet
                          </p>
                          <p className="text-sm">
                            Reach out to student creators with 1K–10K followers
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Floating Edit Bar */}
      {editMode && (
        <FloatingEditBar onSave={handleSaveEdit} onCancel={handleCancelEdit} />
      )}
    </>
  );
}
