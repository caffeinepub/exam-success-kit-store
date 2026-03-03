import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign,
  Lock,
  Package,
  ShoppingBag,
  Star,
  Target,
  TrendingUp,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import {
  useGetAllOrders,
  useGetStats,
  useIsCallerAdmin,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
};

const statusIcons: Record<string, typeof Package> = {
  Pending: Package,
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
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-sans-display ${order.edition.includes("Premium") ? "bg-coral/10 text-coral border-coral/30" : "bg-muted text-muted-foreground border-border"}`}
        >
          {order.edition.includes("Premium") ? "Premium" : "Base"}
        </span>
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

export default function AdminPage() {
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
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

  if (isCheckingAdmin) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center">
        <div className="text-center space-y-4" data-ocid="admin.loading_state">
          <Skeleton className="h-10 w-48 mx-auto rounded-xl" />
          <Skeleton className="h-5 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4"
        data-ocid="admin.error_state"
      >
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">
            Access Denied
          </h1>
          <p className="text-muted-foreground font-body">
            You don't have admin access. Please log in with an admin account to
            view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const totalOrders = stats ? Number(stats.totalOrders) : 0;
  const totalRevenue = stats ? Number(stats.totalRevenue) : 0;
  const totalProfit = stats ? Number(stats.totalProfit) : 0;
  const earlyBirdUsed = stats ? Number(stats.earlyBirdUsed) : 0;
  const baseOrders = stats ? Number(stats.baseOrders) : 0;
  const premiumOrders = stats ? Number(stats.premiumOrders) : 0;
  const breakEvenProgress = Math.min((totalOrders / 33) * 100, 100);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground font-body">
            Business overview for Exam Success Kit
          </p>
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
                className="rounded-2xl border-border"
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
                    Base: {baseOrders} · Premium: {premiumOrders}
                  </div>
                </CardContent>
              </Card>

              <Card
                className="rounded-2xl border-border"
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
                className="rounded-2xl border-border"
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
                className="rounded-2xl border-border"
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
          <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-sans-display text-muted-foreground">
              Base Edition:
            </span>
            <span className="font-sans-display font-bold text-foreground">
              {baseOrders} sold
            </span>
          </div>
          <div className="bg-coral/10 border border-coral/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-coral" />
            <span className="text-sm font-sans-display text-coral">
              Premium Edition:
            </span>
            <span className="font-sans-display font-bold text-coral">
              {premiumOrders} sold
            </span>
          </div>
          <div className="bg-gold/20 border border-gold/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
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
            className="bg-card border border-border rounded-2xl overflow-hidden"
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
              className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1 rounded-xl mb-6"
              data-ocid="admin.toolkit.tab"
            >
              <TabsTrigger
                value="cost"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit.tab"
              >
                Cost Structure
              </TabsTrigger>
              <TabsTrigger
                value="plan"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit.tab"
              >
                90-Day Plan
              </TabsTrigger>
              <TabsTrigger
                value="scale"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit.tab"
              >
                Scaling Roadmap
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit.tab"
              >
                Content Calendar
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit.tab"
              >
                Market Research
              </TabsTrigger>
              <TabsTrigger
                value="ambassador"
                className="text-xs rounded-lg"
                data-ocid="admin.toolkit.tab"
              >
                Ambassador Program
              </TabsTrigger>
            </TabsList>

            {/* Cost Structure */}
            <TabsContent value="cost">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Base */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="bg-kraft/30 px-5 py-4 border-b border-border">
                    <h3 className="font-sans-display font-bold text-foreground">
                      Base Eco Edition — ₹499
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
                <div className="bg-card border border-coral/30 rounded-2xl overflow-hidden">
                  <div className="bg-coral/10 px-5 py-4 border-b border-coral/20">
                    <h3 className="font-sans-display font-bold text-foreground">
                      Premium Color Edition — ₹599
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
              </div>
            </TabsContent>

            {/* 90-Day Plan */}
            <TabsContent value="plan">
              <div className="space-y-6">
                {ninetyDayPlan.map((month) => (
                  <div
                    key={month.month}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="bg-forest/10 px-5 py-3 border-b border-border">
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
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-xl text-sm font-body text-foreground">
                <strong className="font-sans-display">Strategy Summary:</strong>{" "}
                First 3 months: ₹30K–₹60K possible. 1 year: ₹3–5 lakh realistic.
                With proper scaling → multi-lakh/month.
              </div>
            </TabsContent>

            {/* Content Calendar */}
            <TabsContent value="content">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <div className="mt-4 p-4 bg-muted/50 border border-border rounded-xl text-sm font-body text-muted-foreground">
                <strong className="font-sans-display text-foreground">
                  Pattern (Days 6–30):
                </strong>{" "}
                Repeat cycle — flip-through, transformation story, study tip,
                testimonial, order CTA. Post every day for 30 days consistently.
              </div>
            </TabsContent>

            {/* Market Research */}
            <TabsContent value="market">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
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
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
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
