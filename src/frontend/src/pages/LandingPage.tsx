import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  Brain,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Leaf,
  Star,
  StickyNote,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEditableContent } from "../hooks/useEditableContent";
import { useGetEarlyBirdCount, useGetStats } from "../hooks/useQueries";

interface Props {
  onOpenOrderModal: (edition: "base" | "premium" | "elite") => void;
  onNavigatePolicies?: () => void;
}

const plannerSections = [
  { section: "Exam Blueprint Guide", pages: 10, purpose: "Strategy + mindset" },
  { section: "Goal Setting", pages: 5, purpose: "Target %, colleges" },
  { section: "Subject Breakdown", pages: 10, purpose: "Weak topic mapping" },
  { section: "Monthly Planner", pages: 12, purpose: "3 months layout" },
  { section: "Weekly Planner", pages: 12, purpose: "Weekly targets" },
  { section: "Daily Pages", pages: 40, purpose: "Top 3 tasks, hours" },
  { section: "Mock Test Tracker", pages: 5, purpose: "Score improvement" },
  { section: "Mistake Log", pages: 3, purpose: "Error analysis" },
  { section: "Parent Review", pages: 3, purpose: "Weekly sign" },
  { section: "Notes Pages", pages: "Remaining", purpose: "Flexibility" },
];

const sectionIcons = [
  Target,
  Star,
  BookOpen,
  Clock,
  BarChart3,
  FileText,
  TrendingUp,
  FileText,
  Users,
  StickyNote,
];

type FeatureValue = string | boolean;

interface FeatureRow {
  feature: string;
  base: FeatureValue;
  premium: FeatureValue;
  elite: FeatureValue;
}

const featureRows: FeatureRow[] = [
  {
    feature: "Inside pages",
    base: "B&W minimal",
    premium: "Full colour",
    elite: "Full colour",
  },
  {
    feature: "Cover",
    base: "Kraft natural",
    premium: "Bold colour theme",
    elite: "Gold custom cover",
  },
  {
    feature: "Stickers",
    base: "3 minimal stickers",
    premium: "8 vibrant stickers",
    elite: "8 vibrant + foil",
  },
  { feature: "Bookmark ribbon", base: false, premium: true, elite: true },
  {
    feature: "Section dividers",
    base: "Simple dividers",
    premium: "Coloured tabs",
    elite: "Gold foil tabs",
  },
  {
    feature: "Packaging",
    base: "Eco wrap",
    premium: "Premium eco box",
    elite: "Thick eco mailer box",
  },
  { feature: "Name on cover", base: false, premium: false, elite: true },
  { feature: "Custom goal page", base: false, premium: false, elite: true },
  {
    feature: "Extra 20 pages (choice)",
    base: false,
    premium: false,
    elite: true,
  },
  {
    feature: "Returns",
    base: "Accepted",
    premium: "Accepted",
    elite: "No returns — personalised",
  },
];

const ecoFeatures = [
  { icon: Leaf, label: "Recycled paper" },
  { icon: Leaf, label: "No plastic lamination" },
  { icon: Leaf, label: "Aqueous coating" },
  { icon: Leaf, label: "Paper packaging" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true)
    return <CheckCircle2 className="w-4 h-4 text-forest mx-auto" />;
  if (value === false)
    return <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return (
    <span className="text-xs font-body text-center block leading-tight">
      {value}
    </span>
  );
}

export default function LandingPage({
  onOpenOrderModal,
  onNavigatePolicies,
}: Props) {
  const { data: stats } = useGetStats();
  const { data: earlyBirdCountData } = useGetEarlyBirdCount();
  const content = useEditableContent();

  // Dynamic Most Popular: whichever edition has most orders
  const baseOrders = stats ? Number(stats.baseOrders) : 0;
  const premiumOrders = stats ? Number(stats.premiumOrders) : 0;
  const eliteOrders = stats ? Number(stats.eliteOrders) : 0;

  let mostPopular: "base" | "premium" | "elite" = "base";
  if (premiumOrders > baseOrders && premiumOrders >= eliteOrders) {
    mostPopular = "premium";
  } else if (eliteOrders > baseOrders && eliteOrders > premiumOrders) {
    mostPopular = "elite";
  }

  const earlyBirdRemaining = Math.max(
    0,
    20 - Number(earlyBirdCountData ?? BigInt(0)),
  );

  return (
    <div className="bg-background">
      {/* ── HERO ── */}
      <section className="hero-gradient grain-overlay relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10 bg-gold blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-8 bg-coral blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-5 bg-amber-400 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="early-bird-badge mb-6 mx-auto inline-flex">
              <Star className="w-4 h-4" />
              {earlyBirdRemaining > 0
                ? `Only ${earlyBirdRemaining} early bird spots left — ₹50 off!`
                : content.earlyBirdText}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
              {content.heroTitle.split("Serious Students").length > 1 ? (
                <>
                  {content.heroTitle.split("Serious Students")[0]}
                  <span className="text-gold italic">Serious Students</span>
                  {content.heroTitle.split("Serious Students")[1]}
                </>
              ) : (
                content.heroTitle
              )}
            </h1>
            <p className="text-white/75 text-lg sm:text-xl max-w-2xl mx-auto mb-8 font-body leading-relaxed">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => onOpenOrderModal("base")}
                className="bg-white text-forest font-semibold font-sans-display px-8 py-4 rounded-full text-lg hover:bg-gold transition-colors shadow-lg"
                data-ocid="hero.order_button"
              >
                Order Now — ₹499
              </button>
              <button
                type="button"
                onClick={() => onOpenOrderModal("premium")}
                className="bg-coral text-white font-semibold font-sans-display px-8 py-4 rounded-full text-lg hover:opacity-90 transition-opacity shadow-lg"
                data-ocid="hero.premium_order_button"
              >
                Go Premium — ₹599
              </button>
              <button
                type="button"
                onClick={() => onOpenOrderModal("elite")}
                className="relative font-semibold font-sans-display px-8 py-4 rounded-full text-lg shadow-lg overflow-hidden group"
                style={{
                  background:
                    "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #d97706 100%)",
                  color: "white",
                }}
                data-ocid="hero.elite_order_button"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Elite Custom — ₹799
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
            {earlyBirdRemaining > 0 && (
              <p className="text-white/60 text-sm font-body mt-3">
                <span className="text-gold font-semibold">
                  {earlyBirdRemaining}
                </span>{" "}
                of 20 early bird spots remaining
              </p>
            )}
          </motion.div>

          {/* Product Images — 3 columns */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Base */}
            <div className="group relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all" />
              <div
                className="relative rounded-2xl overflow-hidden p-2"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                {mostPopular === "base" && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-coral text-white border-0 font-sans-display text-xs">
                      ✦ Most Popular
                    </Badge>
                  </div>
                )}
                <img
                  src="/assets/generated/exam-kit-hero.dim_800x600.jpg"
                  alt="Base Eco Edition planner"
                  className="w-full rounded-xl object-cover aspect-[4/3]"
                  loading="lazy"
                />
                <div className="mt-3 px-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-sans-display font-bold text-base">
                      Base Eco
                    </span>
                    <div className="text-right">
                      <span className="text-white/50 line-through text-xs">
                        ₹499
                      </span>
                      <span className="text-gold font-bold text-lg ml-1.5">
                        ₹449
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs font-body mt-0.5">
                    Early bird price
                  </p>
                </div>
              </div>
            </div>

            {/* Premium */}
            <div className="group relative">
              <div className="absolute inset-0 bg-coral/20 rounded-2xl blur-xl group-hover:bg-coral/30 transition-all" />
              <div
                className="relative rounded-2xl overflow-hidden p-2"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(217,80,60,0.45)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {mostPopular === "premium" && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-coral text-white border-0 font-sans-display text-xs">
                      ✦ Most Popular
                    </Badge>
                  </div>
                )}
                <img
                  src="/assets/generated/exam-kit-premium.dim_800x600.jpg"
                  alt="Premium Color Edition planner"
                  className="w-full rounded-xl object-cover aspect-[4/3]"
                  loading="lazy"
                />
                <div className="mt-3 px-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-sans-display font-bold text-base">
                      Premium Color
                    </span>
                    <div className="text-right">
                      <span className="text-white/50 line-through text-xs">
                        ₹599
                      </span>
                      <span className="text-gold font-bold text-lg ml-1.5">
                        ₹549
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs font-body mt-0.5">
                    Early bird price
                  </p>
                </div>
              </div>
            </div>

            {/* Elite */}
            <div className="group relative">
              <div
                className="absolute inset-0 rounded-2xl blur-xl transition-all"
                style={{ background: "rgba(217,119,6,0.3)" }}
              />
              <div
                className="relative rounded-2xl overflow-hidden p-2"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(217,119,6,0.65)",
                  boxShadow:
                    "0 8px 32px rgba(217,119,6,0.2), inset 0 1px 0 rgba(255,230,100,0.25)",
                }}
              >
                {mostPopular === "elite" ? (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-coral text-white border-0 font-sans-display text-xs">
                      ✦ Most Popular
                    </Badge>
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge
                      className="border-0 font-sans-display text-xs text-white"
                      style={{
                        background: "linear-gradient(135deg, #d97706, #f59e0b)",
                      }}
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Elite
                    </Badge>
                  </div>
                )}
                <img
                  src="/assets/generated/exam-kit-elite.dim_800x600.jpg"
                  alt="Elite Custom Book planner"
                  className="w-full rounded-xl object-cover aspect-[4/3]"
                  loading="lazy"
                />
                <div className="mt-3 px-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-sans-display font-bold text-base">
                      Elite Custom
                    </span>
                    <div className="text-right">
                      <span
                        className="font-bold text-lg"
                        style={{ color: "#fbbf24" }}
                      >
                        ₹799
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs font-body mt-0.5">
                    Personalised for you
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── EDITION COMPARISON ── */}
      <section className="py-20 px-4 bg-background relative overflow-hidden">
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, oklch(0.34 0.095 155 / 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, oklch(0.78 0.12 72 / 0.06) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-divider mb-8" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Choose Your Edition
            </h2>
            <p className="text-muted-foreground font-body text-lg">
              Three levels of focus. One goal. Get you into your dream college.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Base Card */}
            <motion.div variants={itemVariants} className="relative">
              {mostPopular === "base" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-coral text-white text-sm font-sans-display font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular ✦
                  </span>
                </div>
              )}
              <div
                className="glass-light glass-hover rounded-3xl overflow-hidden h-full flex flex-col"
                style={{
                  border:
                    mostPopular === "base"
                      ? "1.5px solid oklch(0.62 0.18 30 / 0.45)"
                      : "1.5px solid rgba(180,155,100,0.25)",
                  boxShadow:
                    mostPopular === "base"
                      ? "0 4px 24px oklch(0.62 0.18 30 / 0.08), inset 0 1px 0 rgba(255,255,255,0.95)"
                      : undefined,
                }}
              >
                <div
                  className="px-6 py-5 flex items-center justify-between"
                  style={{
                    background: "oklch(0.62 0.18 30 / 0.06)",
                    borderBottom: "1px solid rgba(180,155,100,0.2)",
                  }}
                >
                  <div>
                    <h3 className="font-sans-display font-bold text-xl text-foreground">
                      Base Eco
                    </h3>
                    <p className="text-muted-foreground text-sm font-body mt-0.5">
                      Best Value
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground line-through text-sm">
                      ₹499
                    </div>
                    <div className="font-display text-3xl font-bold text-forest">
                      ₹449
                    </div>
                    <div className="text-xs text-muted-foreground font-body">
                      early bird
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1">
                    {[
                      "100-page exam planner",
                      "B&W focused layout",
                      "Kraft natural cover",
                      "3 minimal stickers",
                      "Eco wrap packaging",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm font-body text-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => onOpenOrderModal("base")}
                    className="w-full mt-5 bg-forest text-white font-semibold font-sans-display py-3 rounded-xl hover:bg-forest-dark transition-colors"
                    data-ocid="editions.base_order_button"
                  >
                    Order Base — ₹449
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Premium Card */}
            <motion.div variants={itemVariants} className="relative">
              {mostPopular === "premium" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-coral text-white text-sm font-sans-display font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular ✦
                  </span>
                </div>
              )}
              <div
                className="glass-light glass-hover rounded-3xl overflow-hidden h-full flex flex-col"
                style={{
                  border:
                    mostPopular === "premium"
                      ? "1.5px solid oklch(0.62 0.18 30 / 0.45)"
                      : "1.5px solid rgba(180,155,100,0.35)",
                }}
              >
                <div
                  className="px-6 py-5 flex items-center justify-between"
                  style={{
                    background: "oklch(0.82 0.07 60 / 0.12)",
                    borderBottom: "1px solid rgba(180,155,100,0.2)",
                  }}
                >
                  <div>
                    <h3 className="font-sans-display font-bold text-xl text-foreground">
                      Premium Color
                    </h3>
                    <p className="text-muted-foreground text-sm font-body mt-0.5">
                      Best All Rounder
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground line-through text-sm">
                      ₹599
                    </div>
                    <div className="font-display text-3xl font-bold text-coral">
                      ₹549
                    </div>
                    <div className="text-xs text-muted-foreground font-body">
                      early bird
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5 flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1">
                    {[
                      "100-page exam planner",
                      "Full colour inside pages",
                      "Bold colour cover",
                      "8 vibrant stickers",
                      "Bookmark ribbon",
                      "Coloured section tabs",
                      "Premium eco box",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm font-body text-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-coral flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => onOpenOrderModal("premium")}
                    className="w-full mt-5 bg-forest text-white font-semibold font-sans-display py-3 rounded-xl hover:bg-forest-dark transition-colors"
                    data-ocid="editions.premium_order_button"
                  >
                    Order Premium — ₹549
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Elite Card */}
            <motion.div variants={itemVariants} className="relative">
              {mostPopular === "elite" ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-coral text-white text-sm font-sans-display font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular ✦
                  </span>
                </div>
              ) : (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className="text-white text-sm font-sans-display font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                    }}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Personalised
                  </span>
                </div>
              )}
              <div
                className="glass-light glass-hover rounded-3xl overflow-hidden h-full flex flex-col"
                style={{
                  border: "1.5px solid oklch(0.75 0.1 72 / 0.6)",
                  boxShadow:
                    "0 4px 24px oklch(0.75 0.1 72 / 0.12), 0 0 0 3px oklch(0.85 0.08 72 / 0.18), inset 0 1px 0 rgba(255,255,255,0.95)",
                }}
              >
                {/* Header */}
                <div
                  className="px-6 py-5 flex items-center justify-between"
                  style={{
                    background: "oklch(0.78 0.12 72 / 0.1)",
                    borderBottom: "1px solid oklch(0.75 0.1 72 / 0.25)",
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Crown className="w-5 h-5 text-amber-600" />
                      <h3 className="font-sans-display font-bold text-xl text-foreground">
                        Elite Custom
                      </h3>
                    </div>
                    <p className="text-amber-700/80 text-sm font-body">
                      Best Customization
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-bold text-amber-700">
                      ₹799
                    </div>
                    <div className="text-xs text-amber-600/70 font-body">
                      fixed price
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5 flex-1 flex flex-col">
                  {/* "Everything in Premium PLUS" badge */}
                  <div
                    className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs font-sans-display font-semibold"
                    style={{
                      background: "oklch(0.78 0.12 72 / 0.15)",
                      color: "oklch(0.38 0.1 72)",
                    }}
                  >
                    <Star className="w-3.5 h-3.5" />
                    Everything in Premium, PLUS:
                  </div>

                  <ul className="space-y-2.5 flex-1">
                    {[
                      {
                        icon: Crown,
                        text: "Name printed on cover",
                        sub: 'e.g. "Aarav\'s JEE 2026 Planner"',
                      },
                      {
                        icon: Target,
                        text: "Custom goal page",
                        sub: "Exam-specific strategy & target",
                      },
                      {
                        icon: BookOpen,
                        text: "Extra 20 pages (your choice)",
                        sub: "Mock tests, habits, wellness & more",
                      },
                      {
                        icon: Brain,
                        text: "Custom study hours goal",
                        sub: "Set at checkout",
                      },
                      {
                        icon: Bookmark,
                        text: "Gold foil bookmark ribbon",
                        sub: null,
                      },
                      {
                        icon: Leaf,
                        text: "Premium thick eco mailer box",
                        sub: null,
                      },
                    ].map(({ icon: Icon, text, sub }) => (
                      <li
                        key={text}
                        className="flex items-start gap-2.5 text-sm font-body"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "oklch(0.78 0.12 72 / 0.2)" }}
                        >
                          <Icon className="w-3 h-3 text-amber-700" />
                        </div>
                        <div>
                          <span className="text-foreground font-medium">
                            {text}
                          </span>
                          {sub && (
                            <span className="text-muted-foreground text-xs block mt-0.5">
                              {sub}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* No returns notice */}
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-body bg-red-50 border border-red-100 text-red-700">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    No returns — personalised orders
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenOrderModal("elite")}
                    className="w-full mt-4 font-semibold font-sans-display py-3 rounded-xl transition-all hover:opacity-90 flex items-center justify-center gap-2 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #d97706 100%)",
                    }}
                    data-ocid="editions.elite_order_button"
                  >
                    <Crown className="w-4 h-4" />
                    Order Elite — ₹799
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Upgrade nudge */}
          <motion.div
            className="mt-10 text-center p-5 glass-light rounded-2xl"
            style={{
              border: "1px solid oklch(0.78 0.12 72 / 0.4)",
              boxShadow:
                "0 4px 16px oklch(0.78 0.12 72 / 0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-sans-display font-semibold text-foreground text-lg">
              💡 {content.upgradeNudge}
            </p>
            <p className="text-muted-foreground font-body text-sm mt-1">
              The Elite is the only planner in India with YOUR name on the
              cover, built around YOUR exam.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              Full Feature Comparison
            </h2>
            <div
              className="glass-light rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.75)" }}
            >
              {/* Header row */}
              <div className="grid grid-cols-4 bg-forest/5 border-b border-border">
                <div className="px-4 py-3 text-sm font-sans-display font-semibold text-muted-foreground">
                  Feature
                </div>
                <div className="px-4 py-3 text-sm font-sans-display font-semibold text-forest text-center">
                  Base ₹449
                </div>
                <div className="px-4 py-3 text-sm font-sans-display font-semibold text-coral text-center">
                  Premium ₹549
                </div>
                <div
                  className="px-4 py-3 text-sm font-sans-display font-semibold text-center flex items-center justify-center gap-1"
                  style={{ color: "#d97706" }}
                >
                  <Crown className="w-3.5 h-3.5" />
                  Elite ₹799
                </div>
              </div>
              {featureRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-4 border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                >
                  <div className="px-4 py-3 text-sm font-body text-muted-foreground">
                    {row.feature}
                  </div>
                  <div className="px-4 py-3 flex items-center justify-center">
                    <FeatureCell value={row.base} />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-center">
                    <FeatureCell value={row.premium} />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-center">
                    <FeatureCell value={row.elite} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ── */}
      <section className="py-20 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-divider mb-8" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              100 Pages of Pure Focus
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              Every page is intentionally designed. No filler. No wasted space.
              Built around how toppers actually study.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {plannerSections.map((item, index) => {
              const Icon = sectionIcons[index];
              return (
                <motion.div
                  key={item.section}
                  variants={itemVariants}
                  className="flex items-center gap-4 glass-light glass-hover rounded-2xl p-4 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center group-hover:bg-forest/20 transition-colors">
                    <Icon className="w-5 h-5 text-forest" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans-display font-semibold text-foreground truncate">
                        {item.section}
                      </span>
                      <span className="flex-shrink-0 text-xs bg-forest/10 text-forest font-semibold px-2 py-0.5 rounded-full font-body">
                        {item.pages} pages
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm font-body mt-0.5">
                      {item.purpose}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── ECO PLEDGE ── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative glass-light rounded-3xl p-8 sm:p-12 overflow-hidden"
            style={{
              border: "1.5px solid oklch(0.34 0.095 155 / 0.25)",
              boxShadow:
                "0 4px 24px oklch(0.34 0.095 155 / 0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-forest/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Our Eco Pledge
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {ecoFeatures.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col items-center gap-2 p-4 glass rounded-2xl"
                  >
                    <Leaf className="w-6 h-6 text-forest" />
                    <span className="text-sm font-sans-display font-semibold text-foreground text-center">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-foreground font-body text-lg">
                <span className="font-sans-display font-bold text-forest">
                  Premium is colorful but still sustainable.
                </span>{" "}
                That's unique in India. We use aqueous coating instead of
                plastic lamination — same vibrancy, zero guilt.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 hero-gradient grain-overlay relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-6">
              Start Your Journey to the Top
            </h2>
            <p className="text-white/70 font-body text-xl mb-10 max-w-2xl mx-auto">
              You're not buying paper. You're buying{" "}
              <span className="text-gold font-semibold">
                discipline, clarity, and results.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => onOpenOrderModal("base")}
                className="bg-white text-forest font-semibold font-sans-display px-8 py-4 rounded-full text-lg hover:bg-gold transition-colors shadow-lg"
                data-ocid="cta.base_order_button"
              >
                Base Eco — ₹449
              </button>
              <button
                type="button"
                onClick={() => onOpenOrderModal("premium")}
                className="bg-coral text-white font-semibold font-sans-display px-8 py-4 rounded-full text-lg hover:opacity-90 transition-opacity shadow-lg"
                data-ocid="cta.premium_order_button"
              >
                Premium Color — ₹549
              </button>
              <button
                type="button"
                onClick={() => onOpenOrderModal("elite")}
                className="font-semibold font-sans-display px-8 py-4 rounded-full text-lg shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #d97706 100%)",
                }}
                data-ocid="cta.elite_order_button"
              >
                <Crown className="w-5 h-5" />
                Elite Custom — ₹799
              </button>
            </div>
            <p className="text-white/50 text-sm mt-5 font-body">
              ⚡ Early bird pricing on Base & Premium for first 20 orders only
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-forest-dark py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display text-xl font-bold text-white">
              Exam<span className="text-gold">Kit</span>
            </div>
            <p className="text-white/50 text-sm font-body mt-1">
              India's premium exam planner
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-white/60 text-sm font-body items-center justify-center">
            <span>WhatsApp: {content.footerPhone}</span>
            <span>•</span>
            <span>{content.footerShipping}</span>
            <span>•</span>
            {onNavigatePolicies && (
              <button
                type="button"
                onClick={onNavigatePolicies}
                className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                data-ocid="footer.policies_link"
              >
                Policies
              </button>
            )}
          </div>
          <div className="text-white/40 text-xs font-body text-center">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/60 transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
