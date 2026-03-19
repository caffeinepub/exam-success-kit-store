import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Crown,
  ExternalLink,
  FileText,
  Loader2,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { usePlaceOrder } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultEdition: "base" | "premium" | "elite";
  onNavigatePolicies?: () => void;
}

const COUNTRIES = [
  "India",
  "USA",
  "UK",
  "Australia",
  "UAE",
  "Canada",
  "Singapore",
  "Malaysia",
  "Germany",
  "France",
  "Japan",
  "Other",
];

function getDueDateOptions(): string[] {
  const options: string[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 3; i < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    options.push(
      d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    );
  }
  return options;
}

export default function OrderModal({
  open,
  onClose,
  defaultEdition,
  onNavigatePolicies,
}: Props) {
  const { userEmail } = useAuth();

  const [edition, setEdition] = useState<"base" | "premium" | "elite">(
    defaultEdition,
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [selectedDate, setSelectedDate] = useState("");
  // Elite-specific fields
  const [coverName, setCoverName] = useState("");
  const [examType, setExamType] = useState("");
  const [bonusPages, setBonusPages] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [policyChecked, setPolicyChecked] = useState(false);

  const { mutate: placeOrder, isPending } = usePlaceOrder();

  const dateOptions = useMemo(() => getDueDateOptions(), []);

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
      setTimeout(() => {
        setOrderId(null);
        setName("");
        setPhone("");
        setAddress("");
        setPincode("");
        setCountry("India");
        setSelectedDate("");
        setCoverName("");
        setExamType("");
        setBonusPages("");
        setErrors({});
        setPolicyChecked(false);
        setEdition(defaultEdition);
      }, 300);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!/^\d{10}$/.test(phone))
      newErrors.phone = "Enter a valid 10-digit phone number";
    if (!address.trim() || address.trim().length < 10)
      newErrors.address = "Please enter your full delivery address";
    if (!/^\d{6}$/.test(pincode))
      newErrors.pincode = "Enter a valid 6-digit pincode";
    if (!selectedDate)
      newErrors.dueDate = "Please select a preferred delivery date";
    if (edition === "elite") {
      if (!coverName.trim())
        newErrors.coverName = "Enter your name for the cover";
      if (!examType) newErrors.examType = "Select your exam";
      if (!bonusPages) newErrors.bonusPages = "Choose your bonus 20 pages";
    }
    if (!policyChecked)
      newErrors.policy = "Please accept the store policies to continue";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const editionString =
      edition === "base" ? "Base" : edition === "premium" ? "Premium" : "Elite";

    placeOrder(
      {
        customerName: name.trim(),
        phone,
        email: userEmail ?? "",
        address: address.trim(),
        pincode,
        country,
        paymentMethod: "UPI",
        edition: editionString,
        customName: edition === "elite" ? coverName.trim() : "",
        examType: edition === "elite" ? examType : "",
        bonusPages: edition === "elite" ? bonusPages : "",
        dueDate: selectedDate,
      },
      {
        onSuccess: (id) => {
          setOrderId(id);
          try {
            const existing = JSON.parse(
              localStorage.getItem("examkit_order_duedates") ?? "{}",
            );
            existing[id] = selectedDate;
            localStorage.setItem(
              "examkit_order_duedates",
              JSON.stringify(existing),
            );
          } catch {
            // ignore
          }
          toast.success("Order placed successfully!");
        },
        onError: (error) => {
          const msg =
            error instanceof Error ? error.message : "Please try again.";
          toast.error(`Failed to place order: ${msg}`);
        },
      },
    );
  };

  const isEarlyBird = true;
  const basePrice = isEarlyBird ? 449 : 499;
  const premiumPrice = isEarlyBird ? 549 : 599;
  const elitePrice = 850;
  const currentPrice =
    edition === "base"
      ? basePrice
      : edition === "premium"
        ? premiumPrice
        : elitePrice;
  const originalPrice =
    edition === "base" ? 499 : edition === "premium" ? 599 : 850;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow:
              "0 32px 64px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{
              background:
                edition === "elite"
                  ? "linear-gradient(90deg, #d97706, #f59e0b, #d97706)"
                  : edition === "premium"
                    ? "linear-gradient(90deg, oklch(0.62 0.18 30), oklch(0.7 0.2 30))"
                    : "linear-gradient(90deg, oklch(0.34 0.095 155), oklch(0.42 0.1 155))",
            }}
          />

          <div className="p-6 pt-7">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-display text-2xl text-foreground flex items-center gap-2">
                {orderId ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-forest" />
                    Order Confirmed!
                  </>
                ) : edition === "elite" ? (
                  <>
                    <Crown className="w-6 h-6 text-amber-600" />
                    Place Elite Order
                  </>
                ) : (
                  "Place Your Order"
                )}
              </DialogTitle>
            </DialogHeader>

            {orderId ? (
              <div
                className="py-4 text-center space-y-5"
                data-ocid="order.success_state"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.34 0.095 155 / 0.15), oklch(0.42 0.1 155 / 0.1))",
                    border: "2px solid oklch(0.34 0.095 155 / 0.3)",
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 text-forest" />
                </div>
                <div>
                  <p className="font-sans-display font-bold text-foreground text-xl mb-2">
                    Your order is confirmed!
                  </p>
                  <p className="text-muted-foreground font-body text-sm">
                    Your order is pending acceptance. We'll review and confirm
                    it shortly.
                  </p>
                </div>

                {/* Order ID — prominent */}
                <div
                  className="rounded-2xl p-4 text-sm font-body"
                  style={{
                    background: "oklch(0.97 0.008 85)",
                    border: "1px solid oklch(0.88 0.018 75)",
                  }}
                >
                  <p className="text-muted-foreground text-xs mb-2 font-sans-display font-semibold uppercase tracking-wide">
                    Your Order ID — save this!
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-foreground font-mono text-lg tracking-wider">
                      {orderId}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(orderId ?? "");
                        toast.success("Order ID copied!");
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg font-sans-display font-semibold border border-border hover:bg-muted transition-colors flex-shrink-0"
                      data-ocid="order.copy_id_button"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-muted-foreground text-xs mt-2 font-body">
                    Use this ID to track your order on the Track Order page
                  </p>
                </div>

                {selectedDate && (
                  <div
                    className="rounded-2xl p-3 text-sm flex items-center gap-2"
                    style={{
                      background: "oklch(0.34 0.095 155 / 0.06)",
                      border: "1px solid oklch(0.34 0.095 155 / 0.18)",
                    }}
                  >
                    <CalendarDays className="w-4 h-4 text-forest flex-shrink-0" />
                    <p className="font-body text-sm text-forest font-semibold">
                      Preferred delivery: {selectedDate}
                    </p>
                  </div>
                )}

                <div
                  className="rounded-2xl p-4 text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.04))",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <p className="font-sans-display font-semibold text-emerald-800 text-sm mb-1">
                    Payment Instructions
                  </p>
                  <p className="text-emerald-700 font-body text-xs">
                    You'll receive UPI payment details shortly. Pay ₹
                    {currentPrice} to complete your order.
                  </p>
                </div>

                <Button
                  onClick={() => handleOpenChange(false)}
                  className="w-full bg-forest text-white hover:bg-forest/90 rounded-xl font-sans-display font-semibold"
                  data-ocid="order.close_button"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Edition Toggle */}
                <div>
                  <Label className="font-sans-display font-semibold text-sm mb-3 block text-foreground">
                    Choose Edition
                  </Label>
                  <div
                    className="grid grid-cols-3 gap-2"
                    data-ocid="order.edition_toggle"
                  >
                    {/* Base */}
                    <button
                      type="button"
                      onClick={() => setEdition("base")}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        edition === "base"
                          ? "border-forest bg-forest/5 shadow-sm"
                          : "border-border hover:border-forest/50 bg-white/60"
                      }`}
                      data-ocid="order.base_tab"
                    >
                      <div className="font-sans-display font-bold text-xs text-foreground">
                        Base Eco
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="text-muted-foreground line-through text-xs">
                          ₹499
                        </span>
                        <span className="font-bold text-forest text-sm">
                          ₹{basePrice}
                        </span>
                      </div>
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-body mt-1"
                        style={{
                          background: "oklch(0.78 0.12 72 / 0.25)",
                          color: "oklch(0.3 0.05 72)",
                        }}
                      >
                        Best Value
                      </span>
                    </button>

                    {/* Premium */}
                    <button
                      type="button"
                      onClick={() => setEdition("premium")}
                      className={`p-3 rounded-xl border-2 text-left transition-all relative ${
                        edition === "premium"
                          ? "border-amber-500 bg-amber-50/50 shadow-sm"
                          : "border-border hover:border-amber-400/50 bg-white/60"
                      }`}
                      data-ocid="order.premium_tab"
                    >
                      <div className="font-sans-display font-bold text-xs text-foreground">
                        Premium
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="text-muted-foreground line-through text-xs">
                          ₹599
                        </span>
                        <span className="font-bold text-amber-700 text-sm">
                          ₹{premiumPrice}
                        </span>
                      </div>
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-body mt-1"
                        style={{
                          background: "oklch(0.75 0.15 55 / 0.2)",
                          color: "oklch(0.35 0.08 55)",
                        }}
                      >
                        <Star className="w-2.5 h-2.5" />
                        All Rounder
                      </span>
                    </button>

                    {/* Elite */}
                    <button
                      type="button"
                      onClick={() => setEdition("elite")}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        edition === "elite"
                          ? "border-amber-600 bg-amber-50/60 shadow-sm"
                          : "border-border hover:border-amber-500/50 bg-white/60"
                      }`}
                      data-ocid="order.elite_tab"
                    >
                      <div className="font-sans-display font-bold text-xs text-foreground flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-600" />
                        Elite
                      </div>
                      <div className="font-bold text-amber-700 text-sm mt-1">
                        ₹{elitePrice}
                      </div>
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-body mt-1"
                        style={{
                          background: "oklch(0.78 0.12 72 / 0.3)",
                          color: "oklch(0.28 0.06 72)",
                        }}
                      >
                        Custom
                      </span>
                    </button>
                  </div>
                </div>

                {/* Elite no-returns warning */}
                {edition === "elite" && (
                  <div
                    className="p-3 rounded-xl text-xs font-body flex items-start gap-2"
                    style={{
                      background: "rgba(217,119,6,0.06)",
                      border: "1px solid rgba(217,119,6,0.2)",
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800">
                      <strong>No Returns Policy:</strong> Elite planners are
                      personalised and cannot be returned or exchanged once
                      processing starts.
                    </p>
                  </div>
                )}

                {/* Customer Details */}
                <div className="space-y-3">
                  <Label className="font-sans-display font-semibold text-sm block text-foreground">
                    Your Details
                  </Label>

                  <div>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="bg-white/70"
                      data-ocid="order.name_input"
                    />
                    {errors.name && (
                      <p
                        className="text-red-500 text-xs mt-1 font-body"
                        data-ocid="order.name_error"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="10-digit Phone Number"
                      type="tel"
                      inputMode="numeric"
                      className="bg-white/70"
                      data-ocid="order.phone_input"
                    />
                    {errors.phone && (
                      <p
                        className="text-red-500 text-xs mt-1 font-body"
                        data-ocid="order.phone_error"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full Delivery Address (House No, Street, Area, City)"
                      rows={2}
                      className="bg-white/70 resize-none"
                      data-ocid="order.address_input"
                    />
                    {errors.address && (
                      <p
                        className="text-red-500 text-xs mt-1 font-body"
                        data-ocid="order.address_error"
                      >
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        value={pincode}
                        onChange={(e) =>
                          setPincode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="Pincode"
                        type="tel"
                        inputMode="numeric"
                        className="bg-white/70"
                        data-ocid="order.pincode_input"
                      />
                      {errors.pincode && (
                        <p
                          className="text-red-500 text-xs mt-1 font-body"
                          data-ocid="order.pincode_error"
                        >
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                    <div>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger
                          className="bg-white/70"
                          data-ocid="order.country_select"
                        >
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {country !== "India" && (
                    <p className="text-xs text-amber-700 font-body bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      Note: We currently ship within India only. International
                      orders may not be fulfilled.
                    </p>
                  )}
                </div>

                {/* ── Preferred Delivery Date ── */}
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.96 0.025 145 / 0.9), oklch(0.94 0.03 145 / 0.7))",
                    border: "2px solid oklch(0.55 0.13 145 / 0.45)",
                    boxShadow: "0 2px 12px oklch(0.55 0.13 145 / 0.12)",
                  }}
                  data-ocid="order.date_picker"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="w-5 h-5 text-forest" />
                    <Label className="font-sans-display font-bold text-base text-forest block">
                      Preferred Delivery Date
                    </Label>
                    <span
                      className="ml-auto text-[10px] font-sans-display font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{
                        background: "oklch(0.34 0.095 155)",
                        color: "white",
                      }}
                    >
                      Required
                    </span>
                  </div>
                  <p className="text-forest/70 text-xs font-body mb-3">
                    Choose your preferred delivery date (minimum 3 days from
                    today):
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {dateOptions.map((dateStr) => {
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className="p-4 rounded-xl border-2 text-center transition-all"
                          style={{
                            background: isSelected
                              ? "oklch(0.34 0.095 155)"
                              : "rgba(255,255,255,0.85)",
                            borderColor: isSelected
                              ? "oklch(0.34 0.095 155)"
                              : "oklch(0.55 0.13 145 / 0.3)",
                            boxShadow: isSelected
                              ? "0 4px 16px oklch(0.34 0.095 155 / 0.35)"
                              : "none",
                            color: isSelected ? "white" : "inherit",
                          }}
                          data-ocid="order.date_button"
                        >
                          <CalendarDays
                            className="w-4 h-4 mx-auto mb-1.5"
                            style={{
                              color: isSelected
                                ? "rgba(255,255,255,0.85)"
                                : "oklch(0.34 0.095 155)",
                            }}
                          />
                          <p
                            className="font-sans-display font-bold text-sm"
                            style={{
                              color: isSelected ? "white" : "inherit",
                            }}
                          >
                            {dateStr.split(" ").slice(0, 2).join(" ")}
                          </p>
                          <p
                            className="text-xs font-body mt-0.5"
                            style={{
                              color: isSelected
                                ? "rgba(255,255,255,0.75)"
                                : "oklch(0.55 0.05 150)",
                            }}
                          >
                            {dateStr.split(" ")[2]}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.dueDate && (
                    <p
                      className="text-red-600 text-xs mt-2 font-body font-semibold"
                      data-ocid="order.date_error"
                    >
                      ⚠ {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Elite-specific fields */}
                {edition === "elite" && (
                  <div className="space-y-3">
                    <Label className="font-sans-display font-semibold text-sm block text-foreground">
                      Personalisation
                    </Label>

                    <div>
                      <Input
                        value={coverName}
                        onChange={(e) => setCoverName(e.target.value)}
                        placeholder="Name for cover (e.g. Aarav JEE 2026 Planner)"
                        className="bg-white/70"
                        data-ocid="order.cover_name_input"
                      />
                      {errors.coverName && (
                        <p className="text-red-500 text-xs mt-1 font-body">
                          {errors.coverName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger
                          className="bg-white/70"
                          data-ocid="order.exam_select"
                        >
                          <SelectValue placeholder="Which exam are you preparing for?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JEE">
                            JEE (Mains + Advanced)
                          </SelectItem>
                          <SelectItem value="NEET">NEET</SelectItem>
                          <SelectItem value="CUET">CUET</SelectItem>
                          <SelectItem value="Board">
                            Board Exams (Class 10/12)
                          </SelectItem>
                          <SelectItem value="Other">
                            Other Competitive Exam
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.examType && (
                        <p className="text-red-500 text-xs mt-1 font-body">
                          {errors.examType}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="font-body text-xs text-muted-foreground mb-1.5 block">
                        Choose your bonus 20 pages:
                      </Label>
                      <RadioGroup
                        value={bonusPages}
                        onValueChange={setBonusPages}
                        className="grid grid-cols-2 gap-2"
                        data-ocid="order.bonus_pages_radio"
                      >
                        {[
                          { value: "mock", label: "Mock Test Pages" },
                          { value: "subject", label: "Subject Tracker" },
                          { value: "habit", label: "Habit Tracker" },
                          { value: "wellness", label: "Wellness Tracker" },
                        ].map(({ value, label }) => (
                          <div
                            key={value}
                            onClick={() => setBonusPages(value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setBonusPages(value);
                            }}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              bonusPages === value
                                ? "border-amber-500 bg-amber-50/50"
                                : "border-border bg-white/60"
                            }`}
                          >
                            <RadioGroupItem value={value} />
                            <span className="font-body text-xs text-foreground">
                              {label}
                            </span>
                          </div>
                        ))}
                      </RadioGroup>
                      {errors.bonusPages && (
                        <p className="text-red-500 text-xs mt-1 font-body">
                          {errors.bonusPages}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Store Policies Summary Card ── */}
                <div
                  className="rounded-2xl p-4 space-y-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(240,253,244,0.9))",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid oklch(0.75 0.1 145 / 0.4)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px oklch(0.55 0.1 145 / 0.08)",
                  }}
                  data-ocid="order.policy_card"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0" />
                    <p className="font-sans-display font-bold text-sm text-forest">
                      Store Policies
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      "Orders processed in 2–4 business days; Elite in 5–7 days",
                      "Cancel within 12 hours only if processing hasn't started",
                      "Damaged/wrong items eligible for replacement (report within 48 hrs with unboxing video)",
                      "Change of mind returns: ₹200 deduction applies",
                      "Refunds processed in 5–7 business days after approval",
                    ].map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-xs font-body text-foreground/80"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => onNavigatePolicies?.()}
                    className="flex items-center gap-1 text-xs font-sans-display font-semibold text-forest hover:text-forest/80 transition-colors mt-1"
                    data-ocid="order.policy_link"
                  >
                    See full policies
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Policy checkbox */}
                <div
                  className="p-3 rounded-xl border"
                  style={{
                    background: "oklch(0.97 0.008 155 / 0.7)",
                    borderColor: "oklch(0.85 0.02 155 / 0.5)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="policy-check"
                      checked={policyChecked}
                      onCheckedChange={(v) => setPolicyChecked(!!v)}
                      className="mt-0.5"
                      data-ocid="order.policy_checkbox"
                    />
                    <Label
                      htmlFor="policy-check"
                      className="font-body text-xs text-foreground cursor-pointer leading-relaxed"
                    >
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigatePolicies?.();
                        }}
                        className="underline text-forest font-semibold hover:text-forest/80 inline-flex items-center gap-0.5"
                      >
                        Store Policies
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>{" "}
                      including cancellation, refund, and return policy.
                      {edition === "elite" && (
                        <span className="text-amber-700 font-semibold">
                          {" "}
                          Elite orders are non-returnable.
                        </span>
                      )}
                    </Label>
                  </div>
                  {errors.policy && (
                    <p
                      className="text-red-500 text-xs mt-2 font-body"
                      data-ocid="order.policy_error"
                    >
                      {errors.policy}
                    </p>
                  )}
                </div>

                {/* Price Summary */}
                <div
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{
                    background:
                      edition === "elite"
                        ? "linear-gradient(135deg, rgba(217,119,6,0.07), rgba(245,158,11,0.04))"
                        : "linear-gradient(135deg, oklch(0.34 0.095 155 / 0.06), oklch(0.42 0.1 155 / 0.03))",
                    border:
                      edition === "elite"
                        ? "1px solid rgba(217,119,6,0.2)"
                        : "1px solid oklch(0.34 0.095 155 / 0.12)",
                  }}
                >
                  <div>
                    <p className="font-sans-display font-semibold text-foreground">
                      Order Total
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p
                        className="font-display text-2xl font-bold"
                        style={{
                          color:
                            edition === "elite"
                              ? "oklch(0.5 0.12 55)"
                              : "oklch(0.34 0.095 155)",
                        }}
                      >
                        ₹{currentPrice}
                      </p>
                      {edition !== "elite" && (
                        <p className="text-muted-foreground line-through text-sm font-body">
                          ₹{originalPrice}
                        </p>
                      )}
                    </div>
                    {edition !== "elite" && (
                      <p className="text-[11px] text-forest font-body font-semibold">
                        🎉 Early Bird — Save ₹{originalPrice - currentPrice}!
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className="text-xs px-2 py-1 rounded-lg font-sans-display font-semibold"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        color: "rgb(5,150,105)",
                      }}
                    >
                      <FileText className="w-3 h-3 inline mr-0.5" />
                      UPI Only
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 rounded-xl font-sans-display font-bold text-base"
                  style={{
                    background:
                      edition === "elite"
                        ? "linear-gradient(135deg, #d97706, #f59e0b)"
                        : "oklch(0.34 0.095 155)",
                    color: edition === "elite" ? "white" : "white",
                    border: "none",
                  }}
                  data-ocid="order.submit_button"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    `Place Order — ₹${currentPrice}`
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
