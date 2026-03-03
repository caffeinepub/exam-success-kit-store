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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlaceOrder } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultEdition: "base" | "premium";
}

export default function OrderModal({ open, onClose, defaultEdition }: Props) {
  const [edition, setEdition] = useState<"base" | "premium">(defaultEdition);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [payment, setPayment] = useState<"UPI" | "COD">("UPI");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: placeOrder, isPending } = usePlaceOrder();

  // Reset when opening
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
      // Reset after close animation
      setTimeout(() => {
        setOrderId(null);
        setName("");
        setPhone("");
        setAddress("");
        setPincode("");
        setPayment("UPI");
        setErrors({});
        setEdition(defaultEdition);
      }, 300);
    }
  };

  // Keep edition synced with default when modal reopens
  useState(() => {
    setEdition(defaultEdition);
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!/^\d{10}$/.test(phone))
      newErrors.phone = "Enter a valid 10-digit phone number";
    if (!address.trim() || address.trim().length < 10)
      newErrors.address = "Please enter your full delivery address";
    if (!/^\d{6}$/.test(pincode))
      newErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    placeOrder(
      {
        customerName: name.trim(),
        phone,
        address: address.trim(),
        pincode,
        paymentMethod: payment,
        edition:
          edition === "base" ? "Base Eco Edition" : "Premium Color Edition",
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

  const isEarlyBird = true; // We show early bird pricing in UI (actual backend handles count)
  const basePrice = isEarlyBird ? 449 : 499;
  const premiumPrice = isEarlyBird ? 549 : 599;
  const currentPrice = edition === "base" ? basePrice : premiumPrice;
  const originalPrice = edition === "base" ? 499 : 599;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            {orderId ? "Order Confirmed! 🎉" : "Place Your Order"}
          </DialogTitle>
        </DialogHeader>

        {orderId ? (
          <div
            className="py-6 text-center space-y-4"
            data-ocid="order.success_state"
          >
            <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-forest" />
            </div>
            <div>
              <p className="font-sans-display font-bold text-foreground text-xl mb-1">
                Your order is confirmed!
              </p>
              <p className="text-muted-foreground font-body text-sm">
                We'll ship within 2–3 business days.
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-sm font-body">
              <p className="text-muted-foreground">Order ID</p>
              <p className="font-semibold text-foreground font-mono mt-0.5 break-all">
                {orderId}
              </p>
            </div>
            <p className="text-muted-foreground text-sm font-body">
              Track your order anytime using your phone number from the Track
              Order page.
            </p>
            <Button
              onClick={() => handleOpenChange(false)}
              className="w-full bg-forest text-white hover:bg-forest/90"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Edition Toggle */}
            <div>
              <Label className="font-sans-display font-semibold text-sm mb-3 block">
                Choose Edition
              </Label>
              <div
                className="grid grid-cols-2 gap-3"
                data-ocid="order.edition_toggle"
              >
                <button
                  type="button"
                  onClick={() => setEdition("base")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    edition === "base"
                      ? "border-forest bg-forest/5"
                      : "border-border hover:border-forest/50"
                  }`}
                >
                  <div className="font-sans-display font-bold text-sm text-foreground">
                    Base Eco
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-muted-foreground line-through text-xs">
                      ₹499
                    </span>
                    <span className="font-bold text-forest text-base">
                      ₹{basePrice}
                    </span>
                    <Badge className="bg-gold/20 text-foreground border-0 text-xs px-1.5 py-0 font-body">
                      <Star className="w-2.5 h-2.5 mr-0.5" />
                      EB
                    </Badge>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setEdition("premium")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    edition === "premium"
                      ? "border-coral bg-coral/5"
                      : "border-border hover:border-coral/50"
                  }`}
                >
                  <div className="font-sans-display font-bold text-sm text-foreground">
                    Premium Color
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-muted-foreground line-through text-xs">
                      ₹599
                    </span>
                    <span className="font-bold text-coral text-base">
                      ₹{premiumPrice}
                    </span>
                    <Badge className="bg-coral/20 text-foreground border-0 text-xs px-1.5 py-0 font-body">
                      <Star className="w-2.5 h-2.5 mr-0.5" />
                      EB
                    </Badge>
                  </div>
                </button>
              </div>
            </div>

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
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
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

            {/* Payment Method */}
            <div>
              <Label className="font-sans-display font-semibold text-sm mb-3 block">
                Payment Method
              </Label>
              <RadioGroup
                value={payment}
                onValueChange={(v) => setPayment(v as "UPI" | "COD")}
                className="grid grid-cols-2 gap-3"
              >
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${payment === "UPI" ? "border-forest bg-forest/5" : "border-border"}`}
                >
                  <RadioGroupItem
                    value="UPI"
                    id="upi"
                    data-ocid="order.upi_radio"
                  />
                  <Label
                    htmlFor="upi"
                    className="cursor-pointer font-sans-display font-semibold text-sm"
                  >
                    UPI / Online
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${payment === "COD" ? "border-forest bg-forest/5" : "border-border"}`}
                >
                  <RadioGroupItem
                    value="COD"
                    id="cod"
                    data-ocid="order.cod_radio"
                  />
                  <Label
                    htmlFor="cod"
                    className="cursor-pointer font-sans-display font-semibold text-sm"
                  >
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Total & Submit */}
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-muted-foreground text-sm">
                  Order Total
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through text-sm">
                    ₹{originalPrice}
                  </span>
                  <span className="font-display font-bold text-xl text-foreground">
                    ₹{currentPrice}
                  </span>
                  <Badge className="bg-gold/30 text-foreground border-0 text-xs font-body">
                    Early Bird
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-xs font-body">
                Free shipping • Ships within 2–3 days
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-forest text-white font-sans-display font-bold py-3 text-base hover:bg-forest/90 rounded-xl"
              data-ocid="order.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Place Order — ₹${currentPrice}`
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
