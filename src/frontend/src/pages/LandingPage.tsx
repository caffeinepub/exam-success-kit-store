import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  FileText,
  Leaf,
  Star,
  StickyNote,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onOpenOrderModal: (edition: "base" | "premium") => void;
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

const featureRows = [
  { feature: "Inside pages", base: "B&W minimal", premium: "Full colour" },
  { feature: "Cover", base: "Kraft natural", premium: "Bold colour theme" },
  {
    feature: "Stickers",
    base: "3 minimal stickers",
    premium: "8 vibrant stickers",
  },
  { feature: "Bookmark ribbon", base: "—", premium: "✓ Included" },
  {
    feature: "Section dividers",
    base: "Simple dividers",
    premium: "Coloured tabs",
  },
  { feature: "Packaging", base: "Eco wrap", premium: "Premium eco box" },
  {
    feature: "Best for",
    base: "Serious students",
    premium: "Aspirational toppers",
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

export default function LandingPage({ onOpenOrderModal }: Props) {
  return (
    <div className="bg-background">
      {/* ── HERO ── */}
      <section className="hero-gradient grain-overlay relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10 bg-gold blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-8 bg-coral blur-3xl" />
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
              First 20 orders get ₹50 off!
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
              The Planner That Turns{" "}
              <span className="text-gold italic">Serious Students</span> Into
              Toppers
            </h1>
            <p className="text-white/75 text-lg sm:text-xl max-w-2xl mx-auto mb-8 font-body leading-relaxed">
              100-page Premium Exam Success Kit. Eco-friendly. India-made.{" "}
              <strong className="text-white">
                Designed to get you results.
              </strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </motion.div>

          {/* Product Images */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="group relative">
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all" />
              <div className="relative bg-white/10 border border-white/20 rounded-2xl overflow-hidden p-2">
                <img
                  src="/assets/generated/exam-kit-hero.dim_800x600.jpg"
                  alt="Base Eco Edition planner"
                  className="w-full rounded-xl object-cover aspect-[4/3]"
                  loading="lazy"
                />
                <div className="mt-3 px-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-sans-display font-bold text-lg">
                      Base Eco Edition
                    </span>
                    <div className="text-right">
                      <span className="text-white/50 line-through text-sm">
                        ₹499
                      </span>
                      <span className="text-gold font-bold text-xl ml-2">
                        ₹449
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm font-body mt-1">
                    Early bird price
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-coral/20 rounded-2xl blur-xl group-hover:bg-coral/30 transition-all" />
              <div className="relative bg-white/10 border border-coral/40 rounded-2xl overflow-hidden p-2">
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-coral text-white border-0 font-sans-display">
                    ✦ Premium
                  </Badge>
                </div>
                <img
                  src="/assets/generated/exam-kit-premium.dim_800x600.jpg"
                  alt="Premium Color Edition planner"
                  className="w-full rounded-xl object-cover aspect-[4/3]"
                  loading="lazy"
                />
                <div className="mt-3 px-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-sans-display font-bold text-lg">
                      Premium Color Edition
                    </span>
                    <div className="text-right">
                      <span className="text-white/50 line-through text-sm">
                        ₹599
                      </span>
                      <span className="text-gold font-bold text-xl ml-2">
                        ₹549
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm font-body mt-1">
                    Early bird price
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── EDITION COMPARISON ── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
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
              Both editions. One goal. Get you into your dream college.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Base Card */}
            <motion.div variants={itemVariants} className="relative">
              <div className="bg-kraft/30 border-2 border-kraft rounded-3xl overflow-hidden">
                <div className="bg-kraft/50 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-sans-display font-bold text-xl text-foreground">
                      Base Eco Edition
                    </h3>
                    <p className="text-muted-foreground text-sm font-body mt-0.5">
                      For serious students
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
                <div className="px-6 py-5">
                  {featureRows.map((row) => (
                    <div
                      key={row.feature}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground text-sm font-body">
                        {row.feature}
                      </span>
                      <span
                        className={`text-sm font-medium font-sans-display ${row.base === "—" ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {row.base}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => onOpenOrderModal("base")}
                    className="w-full mt-5 bg-forest text-white font-semibold font-sans-display py-3 rounded-xl hover:bg-forest-dark transition-colors"
                    data-ocid="hero.base_order_button"
                  >
                    Order Base Edition — ₹449
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Premium Card */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-coral text-white text-sm font-sans-display font-bold px-4 py-1 rounded-full shadow-lg">
                  Most Popular ✦
                </span>
              </div>
              <div className="bg-primary/5 border-2 border-coral rounded-3xl overflow-hidden ring-2 ring-coral/20">
                <div className="bg-coral/15 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-sans-display font-bold text-xl text-foreground">
                      Premium Color Edition
                    </h3>
                    <p className="text-muted-foreground text-sm font-body mt-0.5">
                      For aspirational toppers
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
                <div className="px-6 py-5">
                  {featureRows.map((row) => (
                    <div
                      key={row.feature}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <span className="text-muted-foreground text-sm font-body">
                        {row.feature}
                      </span>
                      <span
                        className={`text-sm font-medium font-sans-display ${row.premium === "—" ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {row.premium}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => onOpenOrderModal("premium")}
                    className="w-full mt-5 bg-coral text-white font-semibold font-sans-display py-3 rounded-xl hover:opacity-90 transition-opacity"
                    data-ocid="hero.premium_order_button"
                  >
                    Order Premium Edition — ₹549
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Upgrade nudge */}
          <motion.div
            className="mt-8 text-center p-5 bg-gold/20 border border-gold/40 rounded-2xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-sans-display font-semibold text-foreground text-lg">
              💡 Only ₹100 more for the Premium. Most students upgrade.
            </p>
            <p className="text-muted-foreground font-body text-sm mt-1">
              Color pages keep you engaged. Vibrant tabs help you navigate
              faster.
            </p>
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
                  className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:border-forest/50 transition-colors group"
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
            className="relative bg-forest/5 border-2 border-forest/20 rounded-3xl p-8 sm:p-12 overflow-hidden"
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
                    className="flex flex-col items-center gap-2 p-4 bg-forest/10 rounded-2xl"
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => onOpenOrderModal("base")}
                className="bg-white text-forest font-semibold font-sans-display px-8 py-4 rounded-full text-lg hover:bg-gold transition-colors shadow-lg"
                data-ocid="hero.base_order_button"
              >
                Base Eco Edition — ₹449
              </button>
              <button
                type="button"
                onClick={() => onOpenOrderModal("premium")}
                className="bg-coral text-white font-semibold font-sans-display px-8 py-4 rounded-full text-lg hover:opacity-90 transition-opacity shadow-lg"
                data-ocid="hero.premium_order_button"
              >
                Premium Color Edition — ₹549
              </button>
            </div>
            <p className="text-white/50 text-sm mt-5 font-body">
              ⚡ Early bird pricing for first 20 orders only
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
          <div className="flex gap-6 text-white/60 text-sm font-body">
            <span>WhatsApp: +91 9999999999</span>
            <span>•</span>
            <span>Ships in 2–3 days</span>
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
