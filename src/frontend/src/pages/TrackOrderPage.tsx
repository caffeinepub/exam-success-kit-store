import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Package, Search, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Order } from "../backend.d";
import { useGetOrdersByPhone } from "../hooks/useQueries";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof Package }
> = {
  Pending: {
    label: "Pending",
    color: "bg-gold/20 text-yellow-800 border-gold/40",
    icon: Clock,
  },
  Shipped: {
    label: "Shipped",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
  },
  Delivered: {
    label: "Delivered",
    color: "bg-forest/10 text-forest border-forest/30",
    icon: CheckCircle2,
  },
};

function OrderCard({ order, index }: { order: Order; index: number }) {
  const status = statusConfig[order.status] || statusConfig.Pending;
  const Icon = status.icon;
  const date = new Date(Number(order.timestamp) / 1_000_000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl p-5 hover:border-forest/40 transition-colors"
      data-ocid={`track.order_item.${index + 1}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="font-sans-display font-bold text-foreground">
            {order.customerName}
          </div>
          <div className="text-muted-foreground text-xs font-body mt-0.5">
            Order #{order.id.slice(0, 8)}...
          </div>
        </div>
        <Badge
          className={`${status.color} border font-sans-display text-xs px-2.5 py-1 flex items-center gap-1.5`}
        >
          <Icon className="w-3 h-3" />
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
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
          <p className="text-muted-foreground font-body text-xs mb-0.5">Date</p>
          <p className="font-sans-display font-semibold text-foreground">
            {date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground font-body text-xs mb-0.5">
            Delivery Address
          </p>
          <p className="font-body text-foreground text-sm leading-relaxed">
            {order.address}, {order.pincode}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TrackOrderPage() {
  const [phoneInput, setPhoneInput] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const {
    data: orders,
    isLoading,
    isFetched,
  } = useGetOrdersByPhone(searchPhone);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{10}$/.test(phoneInput)) {
      setSearchPhone(phoneInput);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 bg-forest/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-forest" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Track Your Order
          </h1>
          <p className="text-muted-foreground font-body">
            Enter your phone number to view your orders
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          className="flex gap-3 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            value={phoneInput}
            onChange={(e) =>
              setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="Enter 10-digit phone number"
            type="tel"
            inputMode="numeric"
            className="flex-1 h-11"
            data-ocid="track.phone_input"
          />
          <Button
            type="submit"
            disabled={!/^\d{10}$/.test(phoneInput)}
            className="bg-forest text-white hover:bg-forest/90 px-5 h-11"
            data-ocid="track.search_button"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </motion.form>

        {isLoading && (
          <div className="space-y-4" data-ocid="track.loading_state">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && isFetched && searchPhone && (
          <div data-ocid="track.order_list">
            {!orders || orders.length === 0 ? (
              <motion.div
                className="text-center py-16 bg-muted/40 rounded-2xl border border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-ocid="track.empty_state"
              >
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-sans-display font-semibold text-foreground text-lg">
                  No orders found
                </p>
                <p className="text-muted-foreground font-body text-sm mt-1">
                  No orders placed with this phone number.
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
