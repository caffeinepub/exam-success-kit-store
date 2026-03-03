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
  CheckCircle2,
  Crown,
  Loader2,
  Smartphone,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlaceOrder } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultEdition: "base" | "premium" | "elite";
}

export default function OrderModal({ open, onClose, defaultEdition }: Props) {
  const [edition, setEdition] = useState<"base" | "premium" | "elite">(
    defaultEdition,
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  // Elite-specific fields
  const [coverName, setCoverName] = useState("");
  const [examType, setExamType] = useState("");
  const [bonusPages, setBonusPages] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: placeOrder, isPending } = usePlaceOrder();

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
      setTimeout(() => {
        setOrderId(null);
        setName("");
        setPhone("");
        setAddress("");
        setPincode("");
        setCoverName("");
        setExamType("");
        setBonusPages("");
        setErrors({});
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
    if (edition === "elite") {
      if (!coverName.trim())
        newErrors.coverName = "Enter your name for the cover";
      if (!examType) newErrors.examType = "Select your exam";
      if (!bonusPages) newErrors.bonusPages = "Choose your bonus 20 pages";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let editionString: string;
    if (edition === "base") {
      editionString = "Base Eco Edition";
    } else if (edition === "premium") {
      editionString = "Premium Color Edition";
    } else {
      editionString = `Elite Custom Book | Cover: ${coverName.trim()} | Exam: ${examType} | Bonus: ${bonusPages}`;
    }

    placeOrder(
      {
        customerName: name.trim(),
        phone,
        address: address.trim(),
        pincode,
        paymentMethod: "UPI",
        edition: editionString,
        customName: edition === "elite" ? coverName.trim() : "",
        examType: edition === "elite" ? examType : "",
        bonusPages: edition === "elite" ? bonusPages : "",
      },
      {
        onSuccess: (id) => {
          setOrderId(id);
          toast.success("Order placed successfully!");
        },
        onError: () => {
          toast.error("Failed to place order. Please try again.");
        },
      },
    );
  };

  const isEarlyBird = true;
  const basePrice = isEarlyBird ? 449 : 499;
  const premiumPrice = isEarlyBird ? 549 : 599;
  const elitePrice = 799;
  const currentPrice =
    edition === "base"
      ? basePrice
      : edition === "premium"
        ? premiumPrice
        : elitePrice;
  const originalPrice =
    edition === "base" ? 499 : edition === "premium" ? 599 : 799;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        {/* Glass morphism wrapper */}
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
          {/* Subtle gradient accent at top */}
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
                {/* Success animation */}
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
                    Save your Order ID below. We'll ship within 2–3 business
                    days.
                  </p>
                </div>

                {/* Order ID */}
                <div
                  className="rounded-2xl p-4 text-sm font-body"
                  style={{
                    background: "oklch(0.97 0.008 85)",
                    border: "1px solid oklch(0.88 0.018 75)",
                  }}
                >
                  <p className="text-muted-foreground text-xs mb-1">Order ID</p>
                  <p className="font-semibold text-foreground font-mono text-xs break-all">
                    {orderId}
                  </p>
                </div>

                {/* UPI payment info */}
                <div
                  className="rounded-2xl p-4 text-sm flex items-start gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.04))",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-sans-display font-semibold text-emerald-800 text-sm">
                      UPI Payment Details
                    </p>
                    <p className="text-emerald-700 font-body text-xs mt-1">
                      We'll send you the UPI ID on WhatsApp within 30 minutes.
                      Pay ₹{currentPrice} after receiving the message.
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground text-xs font-body">
                  Track your order anytime using your phone number from the
                  Track Order page.
                </p>
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
                {/* Edition Toggle — 3 buttons */}
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
                        <Star className="w-2 h-2" />
                        EB
                      </span>
                    </button>

                    {/* Premium */}
                    <button
                      type="button"
                      onClick={() => setEdition("premium")}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        edition === "premium"
                          ? "border-coral bg-coral/5 shadow-sm"
                          : "border-border hover:border-coral/50 bg-white/60"
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
                        <span className="font-bold text-coral text-sm">
                          ₹{premiumPrice}
                        </span>
                      </div>
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-body mt-1"
                        style={{
                          background: "oklch(0.62 0.18 30 / 0.12)",
                          color: "oklch(0.5 0.15 30)",
                        }}
                      >
                        <Star className="w-2 h-2" />
                        EB
                      </span>
                    </button>

                    {/* Elite */}
                    <button
                      type="button"
                      onClick={() => setEdition("elite")}
                      className={`p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                        edition === "elite"
                          ? "border-amber-500 bg-amber-50 shadow-sm"
                          : "border-border hover:border-amber-400 bg-white/60"
                      }`}
                      data-ocid="order.elite_tab"
                    >
                      <Crown className="w-3 h-3 text-amber-600 mb-0.5" />
                      <div className="font-sans-display font-bold text-xs text-foreground">
                        Elite
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-bold text-amber-600 text-sm">
                          ₹{elitePrice}
                        </span>
                      </div>
                      <span
                        className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-body mt-1"
                        style={{
                          background: "oklch(0.78 0.12 72 / 0.25)",
                          color: "oklch(0.45 0.1 72)",
                        }}
                      >
                        Custom
                      </span>
                    </button>
                  </div>
                </div>

                {/* Elite-specific fields */}
                {edition === "elite" && (
                  <div
                    className="space-y-4 rounded-2xl p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.06))",
                      border: "1.5px solid rgba(217,119,6,0.3)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span className="font-sans-display font-bold text-sm text-amber-800">
                        Personalisation Details
                      </span>
                    </div>

                    {/* Cover name */}
                    <div>
                      <Label
                        htmlFor="cover-name"
                        className="font-sans-display font-semibold text-xs mb-1.5 block text-amber-900"
                      >
                        Your Name for the Cover
                      </Label>
                      <Input
                        id="cover-name"
                        value={coverName}
                        onChange={(e) => {
                          setCoverName(e.target.value);
                          if (errors.coverName)
                            setErrors((prev) => ({ ...prev, coverName: "" }));
                        }}
                        placeholder="e.g. Aarav (becomes: Aarav's JEE 2026 Planner)"
                        className="border-amber-300 focus-visible:ring-amber-400 bg-white/80"
                        data-ocid="order.cover_name_input"
                      />
                      {errors.coverName && (
                        <p
                          className="text-destructive text-xs mt-1 font-body"
                          data-ocid="order.cover_name_error"
                        >
                          {errors.coverName}
                        </p>
                      )}
                    </div>

                    {/* Exam type */}
                    <div>
                      <Label className="font-sans-display font-semibold text-xs mb-1.5 block text-amber-900">
                        Exam You're Preparing For
                      </Label>
                      <Select
                        value={examType}
                        onValueChange={(v) => {
                          setExamType(v);
                          if (errors.examType)
                            setErrors((prev) => ({ ...prev, examType: "" }));
                        }}
                      >
                        <SelectTrigger
                          className="border-amber-300 focus:ring-amber-400 bg-white/80"
                          data-ocid="order.exam_type_select"
                        >
                          <SelectValue placeholder="Select your exam" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JEE 2026">
                            JEE 2026 (Main + Advanced)
                          </SelectItem>
                          <SelectItem value="NEET 2026">NEET 2026</SelectItem>
                          <SelectItem value="CUET 2026">CUET 2026</SelectItem>
                          <SelectItem value="Board Exams">
                            Board Exams (Class 10/12)
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.examType && (
                        <p
                          className="text-destructive text-xs mt-1 font-body"
                          data-ocid="order.exam_type_error"
                        >
                          {errors.examType}
                        </p>
                      )}
                    </div>

                    {/* Bonus pages */}
                    <div>
                      <Label className="font-sans-display font-semibold text-xs mb-2 block text-amber-900">
                        Your Extra 20 Pages (choose one)
                      </Label>
                      <RadioGroup
                        value={bonusPages}
                        onValueChange={(v) => {
                          setBonusPages(v);
                          if (errors.bonusPages)
                            setErrors((prev) => ({ ...prev, bonusPages: "" }));
                        }}
                        className="space-y-2"
                        data-ocid="order.bonus_pages_radio"
                      >
                        {[
                          {
                            value: "Mock Test Pages",
                            label: "Mock Test Pages",
                            desc: "More score tracking sheets",
                          },
                          {
                            value: "Subject Tracker",
                            label: "Extra Subject Tracker",
                            desc: "Deep dive per subject",
                          },
                          {
                            value: "Advanced Habit Tracker",
                            label: "Advanced Habit Tracker",
                            desc: "Daily discipline system",
                          },
                          {
                            value: "Mental Wellness Tracker",
                            label: "Mental Wellness Tracker",
                            desc: "Stress & motivation log",
                          },
                        ].map((opt) => (
                          <div
                            key={opt.value}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              bonusPages === opt.value
                                ? "border-amber-500 bg-amber-100/80"
                                : "border-amber-200 bg-white/60 hover:border-amber-400"
                            }`}
                          >
                            <RadioGroupItem
                              value={opt.value}
                              id={`bonus-${opt.value}`}
                            />
                            <Label
                              htmlFor={`bonus-${opt.value}`}
                              className="cursor-pointer flex-1"
                            >
                              <span className="font-sans-display font-semibold text-xs text-foreground block">
                                {opt.label}
                              </span>
                              <span className="text-muted-foreground text-xs font-body">
                                {opt.desc}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {errors.bonusPages && (
                        <p
                          className="text-destructive text-xs mt-1 font-body"
                          data-ocid="order.bonus_pages_error"
                        >
                          {errors.bonusPages}
                        </p>
                      )}
                    </div>

                    {/* No returns notice */}
                    <div
                      className="flex items-start gap-2 p-3 rounded-xl"
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                      data-ocid="order.no_returns_notice"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-xs font-body">
                        <span className="font-semibold">
                          No returns on Elite.
                        </span>{" "}
                        Personalised orders cannot be cancelled or returned once
                        placed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <Label
                    htmlFor="order-name"
                    className="font-sans-display font-semibold text-sm mb-1.5 block"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="order-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g. Priya Sharma"
                    autoComplete="name"
                    className="bg-white/70"
                    data-ocid="order.name_input"
                  />
                  {errors.name && (
                    <p
                      className="text-destructive text-xs mt-1 font-body"
                      data-ocid="order.name_error"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label
                    htmlFor="order-phone"
                    className="font-sans-display font-semibold text-sm mb-1.5 block"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="order-phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      if (errors.phone)
                        setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    placeholder="10-digit mobile number"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    className="bg-white/70"
                    data-ocid="order.phone_input"
                  />
                  {errors.phone && (
                    <p
                      className="text-destructive text-xs mt-1 font-body"
                      data-ocid="order.phone_error"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <Label
                    htmlFor="order-address"
                    className="font-sans-display font-semibold text-sm mb-1.5 block"
                  >
                    Delivery Address
                  </Label>
                  <Textarea
                    id="order-address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address)
                        setErrors((prev) => ({ ...prev, address: "" }));
                    }}
                    placeholder="House/Flat no., Street, Area, City, State"
                    rows={3}
                    className="bg-white/70 resize-none"
                    data-ocid="order.address_textarea"
                  />
                  {errors.address && (
                    <p
                      className="text-destructive text-xs mt-1 font-body"
                      data-ocid="order.address_error"
                    >
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <Label
                    htmlFor="order-pincode"
                    className="font-sans-display font-semibold text-sm mb-1.5 block"
                  >
                    Pincode
                  </Label>
                  <Input
                    id="order-pincode"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      if (errors.pincode)
                        setErrors((prev) => ({ ...prev, pincode: "" }));
                    }}
                    placeholder="6-digit pincode"
                    inputMode="numeric"
                    className="bg-white/70"
                    data-ocid="order.pincode_input"
                  />
                  {errors.pincode && (
                    <p
                      className="text-destructive text-xs mt-1 font-body"
                      data-ocid="order.pincode_error"
                    >
                      {errors.pincode}
                    </p>
                  )}
                </div>

                {/* UPI payment info */}
                <div
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans-display font-semibold text-emerald-800 text-sm">
                      UPI Payment Only
                    </p>
                    <p className="text-emerald-700 font-body text-xs mt-0.5">
                      After placing your order, we'll send the UPI ID to your
                      WhatsApp number. Ships in 2–3 days after payment.
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div
                  className={`rounded-2xl p-4 border ${
                    edition === "elite"
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-muted/40 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body text-muted-foreground text-sm">
                      Order Total
                    </span>
                    <div className="flex items-center gap-2">
                      {edition !== "elite" && (
                        <span className="text-muted-foreground line-through text-sm">
                          ₹{originalPrice}
                        </span>
                      )}
                      <span
                        className={`font-display font-bold text-xl ${
                          edition === "elite"
                            ? "text-amber-700"
                            : "text-foreground"
                        }`}
                      >
                        ₹{currentPrice}
                      </span>
                      {edition !== "elite" ? (
                        <span
                          className="text-xs font-body px-2 py-0.5 rounded-full"
                          style={{
                            background: "oklch(0.78 0.12 72 / 0.25)",
                            color: "oklch(0.3 0.05 72)",
                          }}
                        >
                          Early Bird
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <Crown className="w-3 h-3" />
                          Elite
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className={`w-full font-sans-display font-bold py-3 text-base rounded-xl shadow-lg ${
                    edition === "elite"
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : edition === "premium"
                        ? "bg-coral text-white hover:opacity-90"
                        : "bg-forest text-white hover:bg-forest/90"
                  }`}
                  style={
                    edition === "elite"
                      ? {
                          background:
                            "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #d97706 100%)",
                          boxShadow: "0 8px 24px rgba(217,119,6,0.35)",
                        }
                      : {}
                  }
                  data-ocid="order.submit_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order…
                    </>
                  ) : edition === "elite" ? (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Place Elite Order — ₹{currentPrice}
                    </>
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
