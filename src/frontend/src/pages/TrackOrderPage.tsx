import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Package,
  Phone,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import {
  useGetOrderById,
  useGetOrdersByEmail,
  useGetOrdersByPhone,
  useSubmitCancelRequest,
} from "../hooks/useQueries";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
];

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof Package }
> = {
  Pending: {
    label: "Pending Acceptance",
    color: "bg-yellow-50 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  "Order Accepted": {
    label: "Order Accepted",
    color: "bg-blue-50 text-blue-800 border-blue-200",
    icon: CheckCircle2,
  },
  "Payment Received": {
    label: "Payment Received",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Processing: {
    label: "Processing",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: Package,
  },
  Printing: {
    label: "Printing",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Package,
  },
  "Printing Custom": {
    label: "Custom Printing",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Package,
  },
  Packing: {
    label: "Packing",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Package,
  },
  Dispatched: {
    label: "Dispatched",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Truck,
  },
  Shipped: {
    label: "Shipped",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
  },
  Delivered: {
    label: "Delivered",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  Declined: {
    label: "Declined",
    color: "bg-red-50 text-red-800 border-red-300",
    icon: XCircle,
  },
};

// Steps that appear BEFORE payment received (so we don't show it unless admin marks it)
const PRE_PAYMENT_STATUSES = ["Pending", "Order Accepted"];

const STATUS_STEPS = [
  "Pending",
  "Order Accepted",
  "Payment Received",
  "Processing",
  "Packing",
  "Dispatched",
  "Shipped",
  "Delivered",
];

const CANCELLABLE_STATUSES = ["Pending", "Order Accepted"];

function isCancelEligible(order: Order): boolean {
  if (!CANCELLABLE_STATUSES.includes(order.status)) return false;
  const orderTime = Number(order.timestamp) / 1_000_000;
  const twelveHours = 12 * 60 * 60 * 1000;
  return Date.now() - orderTime < twelveHours;
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

function StatusStepper({
  current,
  isElite,
}: { current: string; isElite: boolean }) {
  // Filter steps: only show Payment Received if the order has reached that stage
  const allSteps = isElite
    ? STATUS_STEPS.map((s) => (s === "Printing" ? "Printing Custom" : s))
    : STATUS_STEPS;

  // If status is still pre-payment, hide Payment Received step from the stepper
  const steps = PRE_PAYMENT_STATUSES.includes(current)
    ? allSteps.filter((s) => s !== "Payment Received")
    : allSteps;

  const idx = steps.indexOf(current);

  if (current === "Cancelled" || current === "Declined") {
    return (
      <div className="mt-4 mb-1 px-3 py-2 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="text-red-700 text-xs font-sans-display font-semibold">
          Order {current}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 mt-4 mb-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const done = i <= idx;
        const cfg = statusConfig[step] || statusConfig.Pending;
        const StepIcon = cfg.icon;
        const shortLabel = step
          .replace("Order Accepted", "Accepted")
          .replace("Payment Received", "Paid")
          .replace("Printing Custom", "Printing")
          .replace("Dispatched", "Dispatch");
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  done
                    ? "bg-forest border-forest text-white"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                <StepIcon className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-[8px] font-sans-display font-semibold leading-tight text-center whitespace-nowrap ${
                  done ? "text-forest" : "text-muted-foreground"
                }`}
              >
                {shortLabel}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-4 mx-0.5 rounded-full transition-all ${
                  i < idx ? "bg-forest" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CancelRequestModal({
  order,
  onClose,
}: { order: Order; onClose: () => void }) {
  const { userEmail, userPhone } = useAuth();
  const { mutate: submitCancel, isPending } = useSubmitCancelRequest();
  const [reason, setReason] = useState("");
  const [requestType, setRequestType] = useState("cancel");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    submitCancel(
      {
        orderId: order.id,
        customerEmail: userEmail ?? order.email ?? "",
        customerPhone: userPhone ?? order.phone ?? "",
        reason: reason.trim(),
        requestType,
      },
      {
        onSuccess: () => {
          toast.success(
            "Cancellation request submitted. We'll review it soon.",
          );
          onClose();
        },
        onError: () => {
          toast.error("Failed to submit request. Please try again.");
        },
      },
    );
  };

  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="max-w-sm w-full p-0 border-0 bg-transparent shadow-none"
        data-ocid="track.cancel_dialog"
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow:
              "0 32px 64px -12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: "linear-gradient(90deg, #ef4444, #f87171)" }}
          />
          <div className="p-6 pt-7">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-xl text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Cancel / Refund Request
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                className="p-3 rounded-xl text-xs font-body"
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <p className="text-red-700">
                  Order #{order.id} · {order.edition}
                </p>
              </div>
              <div>
                <Label className="font-sans-display font-semibold text-sm mb-2 block">
                  Request Type
                </Label>
                <RadioGroup
                  value={requestType}
                  onValueChange={setRequestType}
                  className="flex gap-4"
                  data-ocid="track.cancel_type_radio"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cancel" id="req-cancel" />
                    <Label
                      htmlFor="req-cancel"
                      className="font-body text-sm cursor-pointer"
                    >
                      Cancel Order
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="refund" id="req-refund" />
                    <Label
                      htmlFor="req-refund"
                      className="font-body text-sm cursor-pointer"
                    >
                      Request Refund
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label
                  htmlFor="cancel-reason"
                  className="font-sans-display font-semibold text-sm mb-1.5 block"
                >
                  Reason
                </Label>
                <Textarea
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your reason..."
                  rows={3}
                  className="bg-white/70 resize-none"
                  data-ocid="track.cancel_reason_textarea"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl font-sans-display"
                  onClick={onClose}
                  data-ocid="track.cancel_dialog_cancel_button"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !reason.trim()}
                  className="flex-1 rounded-xl font-sans-display font-bold bg-red-600 hover:bg-red-700 text-white"
                  data-ocid="track.cancel_dialog_submit_button"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : null}
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PrivateField({
  children,
  isVisible,
}: { children: React.ReactNode; isVisible: boolean }) {
  if (isVisible) return <>{children}</>;
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-body italic">
      <Lock className="w-3 h-3" />
      Sign in to view
    </span>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const { isLoggedIn, userEmail, userPhone } = useAuth();
  const status = statusConfig[order.status] || statusConfig.Pending;
  const Icon = status.icon;
  const date = new Date(Number(order.timestamp) / 1_000_000);
  const isElite = order.edition.toLowerCase().includes("elite");
  const dueDate = getOrderDueDate(order.id);

  // Determine if the current user is the owner of this order
  const isOwner =
    isLoggedIn &&
    ((userEmail &&
      order.email &&
      userEmail.toLowerCase() === order.email.toLowerCase()) ||
      (userPhone && order.phone && userPhone === order.phone));

  const canCancel = isOwner ? isCancelEligible(order) : false;
  const [showCancelModal, setShowCancelModal] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className="glass-light glass-hover rounded-2xl p-5"
        data-ocid={`track.order_item.${index + 1}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-sans-display font-semibold ${
                  status.color
                }`}
              >
                <Icon className="w-3 h-3" />
                {status.label}
              </span>
              {order.isEarlyBird && (
                <span className="text-[10px] bg-gold/20 text-foreground px-2 py-0.5 rounded-full font-body">
                  🐦 Early Bird
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Order ID: <strong>{order.id}</strong>
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-sans-display shrink-0"
          >
            {order.edition}
          </Badge>
        </div>

        {/* Pending notice */}
        {order.status === "Pending" && (
          <div
            className="mb-3 px-3 py-2.5 rounded-xl flex items-start gap-2"
            style={{
              background: "oklch(0.97 0.02 75 / 0.8)",
              border: "1px solid oklch(0.85 0.06 75 / 0.6)",
            }}
          >
            <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-xs font-body leading-relaxed">
              <span className="font-semibold">
                Your order is being reviewed.
              </span>{" "}
              You'll receive confirmation shortly.
            </p>
          </div>
        )}

        <StatusStepper current={order.status} isElite={isElite} />

        <div className="grid grid-cols-2 gap-3 text-sm mt-4">
          <div>
            <p className="text-muted-foreground font-body text-xs mb-0.5">
              Edition
            </p>
            <p className="font-sans-display font-semibold text-foreground">
              {order.edition}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-body text-xs mb-0.5">
              Price Paid
            </p>
            <p className="font-sans-display font-semibold text-foreground">
              ₹{order.pricePaid.toString()}
              {order.isEarlyBird && (
                <span className="ml-1.5 text-xs bg-gold/20 text-foreground px-1.5 py-0.5 rounded-full font-body">
                  EB
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-body text-xs mb-0.5">
              Payment
            </p>
            <p className="font-sans-display font-semibold text-foreground">
              {order.paymentMethod}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-body text-xs mb-0.5">
              Order Date
            </p>
            <p className="font-sans-display font-semibold text-foreground">
              {date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          {dueDate && (
            <div className="col-span-2">
              <p className="text-muted-foreground font-body text-xs mb-0.5 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                Preferred Delivery Date
              </p>
              <p className="font-sans-display font-semibold text-forest">
                {dueDate}
              </p>
            </div>
          )}

          {/* Private fields — only visible to owner */}
          <div className="col-span-2">
            <p className="text-muted-foreground font-body text-xs mb-0.5">
              Customer Name
            </p>
            <p className="font-body text-foreground text-sm">
              <PrivateField isVisible={!!isOwner}>
                {order.customerName}
              </PrivateField>
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-muted-foreground font-body text-xs mb-0.5 flex items-center gap-1">
              {isOwner ? null : <EyeOff className="w-3 h-3" />}
              Delivery Address
            </p>
            <p className="font-body text-foreground text-sm leading-relaxed">
              <PrivateField isVisible={!!isOwner}>
                {order.address}, {order.pincode}
              </PrivateField>
            </p>
          </div>

          <div>
            <p className="text-muted-foreground font-body text-xs mb-0.5 flex items-center gap-1">
              {isOwner ? null : <EyeOff className="w-3 h-3" />}
              Phone
            </p>
            <p className="font-sans-display font-semibold text-foreground">
              <PrivateField isVisible={!!isOwner}>{order.phone}</PrivateField>
            </p>
          </div>
        </div>

        {/* Sign in prompt for private details */}
        {!isOwner && (
          <div
            className="mt-3 px-3 py-2 rounded-xl flex items-center gap-2 text-xs"
            style={{
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <p className="text-indigo-700 font-body">
              <span className="font-semibold">Sign in</span> with the account
              used to place this order to view full details.
            </p>
          </div>
        )}

        {/* Cancel button — only if owner, eligible, and correct status */}
        {isOwner && canCancel && order.status !== "Cancelled" && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-sans-display text-xs"
              data-ocid={`track.cancel_button.${index + 1}`}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Request Cancellation / Refund
            </Button>
            <p className="text-muted-foreground text-[10px] font-body mt-1 text-center">
              Eligible within 12 hours of placing if not processed
            </p>
          </div>
        )}
      </motion.div>

      {showCancelModal && (
        <CancelRequestModal
          order={order}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </>
  );
}

export default function TrackOrderPage() {
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [activeTab, setActiveTab] = useState("phone");
  const [countrySearch, setCountrySearch] = useState("");

  const {
    data: phoneOrders,
    isLoading: isLoadingPhone,
    isFetched: isFetchedPhone,
  } = useGetOrdersByPhone(searchPhone);

  const {
    data: emailOrders,
    isLoading: isLoadingEmail,
    isFetched: isFetchedEmail,
  } = useGetOrdersByEmail(searchEmail);

  const {
    data: orderByIdData,
    isLoading: isLoadingOrderById,
    isFetched: isFetchedOrderById,
  } = useGetOrderById(searchOrderId);

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneInput.replace(/\D/g, "");
    if (digits.length >= 7) {
      setSearchPhone(digits);
    }
  };

  const handleEmailSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && emailInput.includes("@")) {
      setSearchEmail(emailInput.trim().toLowerCase());
    }
  };

  const handleOrderIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim().length > 0) {
      setSearchOrderId(orderIdInput.trim());
    }
  };

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch),
  );

  const isLoading =
    activeTab === "phone"
      ? isLoadingPhone
      : activeTab === "email"
        ? isLoadingEmail
        : isLoadingOrderById;
  const isFetched =
    activeTab === "phone"
      ? isFetchedPhone
      : activeTab === "email"
        ? isFetchedEmail
        : isFetchedOrderById;
  const orders: Order[] | undefined =
    activeTab === "phone"
      ? phoneOrders
      : activeTab === "email"
        ? emailOrders
        : orderByIdData
          ? [orderByIdData]
          : searchOrderId
            ? []
            : undefined;
  const hasSearched =
    activeTab === "phone"
      ? !!searchPhone
      : activeTab === "email"
        ? !!searchEmail
        : !!searchOrderId;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "oklch(0.34 0.095 155 / 0.12)",
              border: "1px solid oklch(0.34 0.095 155 / 0.2)",
            }}
          >
            <Package className="w-7 h-7 text-forest" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Track Your Order
          </h1>
          <p className="text-muted-foreground font-body">
            Enter your details to view your orders. Full details visible after
            sign-in.
          </p>
        </motion.div>

        <motion.div
          className="glass-light rounded-2xl p-5 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              setSearchPhone("");
              setSearchEmail("");
              setSearchOrderId("");
            }}
          >
            <TabsList
              className="grid grid-cols-3 w-full mb-5 bg-muted/50 rounded-xl"
              data-ocid="track.tab_list"
            >
              <TabsTrigger
                value="phone"
                className="rounded-lg font-sans-display text-sm"
                data-ocid="track.phone_tab"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Phone
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="rounded-lg font-sans-display text-sm"
                data-ocid="track.email_tab"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Email
              </TabsTrigger>
              <TabsTrigger
                value="orderid"
                className="rounded-lg font-sans-display text-sm"
                data-ocid="track.orderid_tab"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Order ID
              </TabsTrigger>
            </TabsList>

            {/* Phone tab */}
            <TabsContent value="phone">
              <form onSubmit={handlePhoneSearch} className="space-y-3">
                <Label
                  htmlFor="track-phone"
                  className="font-sans-display font-semibold text-sm text-foreground"
                >
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCountryPicker((v) => !v);
                        setCountrySearch("");
                      }}
                      className="h-11 px-3 rounded-xl border border-border bg-white/70 font-sans-display text-sm flex items-center gap-1.5 hover:bg-muted/50 transition-colors whitespace-nowrap"
                      data-ocid="track.country_button"
                    >
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{selectedCountry.flag}</span>
                      <span className="text-muted-foreground">
                        {selectedCountry.code}
                      </span>
                    </button>
                    {showCountryPicker && (
                      <div
                        className="absolute top-full left-0 mt-1 z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/60 w-56"
                        style={{
                          background: "rgba(255,255,255,0.97)",
                          backdropFilter: "blur(16px)",
                        }}
                      >
                        <div className="p-2 border-b border-border">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-white/70 focus:outline-none focus:ring-1 focus:ring-forest/40 font-body"
                            data-ocid="track.country_search_input"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <button
                              key={`${c.code}-${c.name}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowCountryPicker(false);
                              }}
                              className={`w-full px-3 py-2 text-sm font-body flex items-center gap-2 hover:bg-muted/60 transition-colors text-left ${
                                selectedCountry.name === c.name
                                  ? "bg-forest/8 font-semibold text-forest"
                                  : "text-foreground"
                              }`}
                            >
                              <span>{c.flag}</span>
                              <span className="flex-1">{c.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {c.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    id="track-phone"
                    value={phoneInput}
                    onChange={(e) =>
                      setPhoneInput(
                        e.target.value.replace(/\D/g, "").slice(0, 15),
                      )
                    }
                    placeholder={
                      selectedCountry.code === "+91"
                        ? "10-digit number"
                        : "Phone number"
                    }
                    type="tel"
                    inputMode="numeric"
                    className="flex-1 h-11 bg-white/70"
                    data-ocid="track.phone_input"
                  />
                  <Button
                    type="submit"
                    disabled={phoneInput.replace(/\D/g, "").length < 7}
                    className="bg-forest text-white hover:bg-forest/90 px-5 h-11"
                    data-ocid="track.search_button"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Email tab */}
            <TabsContent value="email">
              <form onSubmit={handleEmailSearch} className="space-y-3">
                <Label
                  htmlFor="track-email"
                  className="font-sans-display font-semibold text-sm text-foreground"
                >
                  Email Address
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="track-email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      className="pl-9 h-11 bg-white/70"
                      data-ocid="track.email_input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!emailInput.trim() || !emailInput.includes("@")}
                    className="bg-forest text-white hover:bg-forest/90 px-5 h-11"
                    data-ocid="track.email_search_button"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Order ID tab */}
            <TabsContent value="orderid">
              <form onSubmit={handleOrderIdSearch} className="space-y-3">
                <Label
                  htmlFor="track-orderid"
                  className="font-sans-display font-semibold text-sm text-foreground"
                >
                  Order ID
                </Label>
                <p className="text-muted-foreground text-xs font-body -mt-1">
                  Enter the Order ID shown after placing your order.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="track-orderid"
                      value={orderIdInput}
                      onChange={(e) => setOrderIdInput(e.target.value)}
                      placeholder="e.g. ORD-1"
                      className="pl-9 h-11 bg-white/70 font-mono"
                      data-ocid="track.orderid_input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!orderIdInput.trim()}
                    className="bg-forest text-white hover:bg-forest/90 px-5 h-11"
                    data-ocid="track.orderid_search_button"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Results */}
        {isLoading && (
          <div className="space-y-4" data-ocid="track.loading_state">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && isFetched && hasSearched && (
          <div data-ocid="track.order_list">
            {!orders || orders.length === 0 ? (
              <motion.div
                className="text-center py-16 glass-light rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="track.empty_state"
              >
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-sans-display font-semibold text-foreground text-lg">
                  No orders found
                </p>
                <p className="text-muted-foreground font-body text-sm mt-1">
                  No orders found with this{" "}
                  {activeTab === "phone"
                    ? "phone number"
                    : activeTab === "email"
                      ? "email address"
                      : "Order ID"}
                  .
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm font-body">
                  Found {orders.length} order{orders.length > 1 ? "s" : ""}
                </p>
                {orders.map((order, idx) => (
                  <OrderCard key={order.id} order={order} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
