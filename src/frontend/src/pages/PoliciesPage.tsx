import {
  AlertTriangle,
  Clock,
  Leaf,
  MessageCircle,
  Package,
  RefreshCw,
  Shield,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

interface PolicyCardProps {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}

function PolicyCard({ icon: Icon, title, color, children }: PolicyCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-light rounded-2xl overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      <div
        className="px-6 py-4 border-b border-border/40 flex items-center gap-3"
        style={{ background: "rgba(255,255,255,0.5)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: color }}
        >
          <Icon
            className="w-4.5 h-4.5 text-white"
            style={{ width: 18, height: 18 }}
          />
        </div>
        <h2 className="font-sans-display font-bold text-lg text-foreground">
          {title}
        </h2>
      </div>
      <div className="px-6 py-5 space-y-2.5 font-body text-sm text-foreground leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="w-1.5 h-1.5 rounded-full bg-forest flex-shrink-0 mt-2"
        aria-hidden="true"
      />
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans-display font-semibold text-foreground text-sm mt-4 mb-1 first:mt-0">
      {children}
    </p>
  );
}

export default function PoliciesPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-background pb-20">
      {/* Header */}
      <div
        className="relative py-14 px-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.19 0.035 155) 0%, oklch(0.26 0.06 155) 60%, oklch(0.22 0.05 200) 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Store Policies
            </h1>
            <p className="text-white/65 font-body text-base max-w-xl mx-auto">
              Our commitment to transparency — everything you need to know about
              shipping, returns, and your rights as a customer.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        <motion.div
          className="space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 1. Shipping Policy */}
          <PolicyCard
            icon={Truck}
            title="1. Shipping Policy"
            color="oklch(0.34 0.095 155)"
          >
            <SectionTitle>Shipping Timeline</SectionTitle>
            <BulletItem>
              Orders are processed within <strong>2–4 business days</strong>.
            </BulletItem>
            <BulletItem>
              Customized planners (Elite) may take{" "}
              <strong>5–7 business days</strong> to process.
            </BulletItem>
            <BulletItem>
              Delivery timeline: <strong>3–7 days across India</strong> via
              courier partner.
            </BulletItem>
            <SectionTitle>Shipping Charges</SectionTitle>
            <BulletItem>
              Standard shipping charges are included in product pricing.
            </BulletItem>
            <BulletItem>
              Remote locations may require additional shipping time.
            </BulletItem>
            <SectionTitle>Order Tracking</SectionTitle>
            <BulletItem>
              Tracking details will be shared via{" "}
              <strong>WhatsApp once dispatched</strong>. Please ensure your
              WhatsApp number is active.
            </BulletItem>
          </PolicyCard>

          {/* 2. Cancellation Policy */}
          <PolicyCard
            icon={Clock}
            title="2. Cancellation Policy"
            color="oklch(0.6 0.15 250)"
          >
            <SectionTitle>Cancellation Window</SectionTitle>
            <BulletItem>
              Orders can be cancelled within <strong>12 hours</strong> of
              placing (only if printing/processing has <em>not</em> started).
            </BulletItem>
            <BulletItem>
              After processing or dispatch, cancellation is{" "}
              <strong>not allowed</strong>.
            </BulletItem>
            <SectionTitle>Non-Refundable Charges After Processing</SectionTitle>
            <BulletItem>
              If cancellation is requested after print/processing begins:{" "}
              <strong>₹100 logistics &amp; processing charges</strong> will be
              deducted from the refund amount.
            </BulletItem>
            <SectionTitle>Customized Planners (Elite)</SectionTitle>
            <div
              className="flex items-start gap-2.5 mt-2 p-3 rounded-xl"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.18)",
              }}
            >
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-xs">
                Customized planners <strong>cannot be cancelled</strong> once
                processing has started, as they are personalised for you.
              </p>
            </div>
          </PolicyCard>

          {/* 3. Return & Replacement Policy */}
          <PolicyCard
            icon={RefreshCw}
            title="3. Return & Replacement Policy"
            color="oklch(0.55 0.18 160)"
          >
            <SectionTitle>✅ Eligible for Replacement</SectionTitle>
            <BulletItem>Product received is damaged</BulletItem>
            <BulletItem>Wrong product delivered</BulletItem>
            <SectionTitle>Conditions</SectionTitle>
            <BulletItem>
              Must inform us <strong>within 48 hours</strong> of delivery.
            </BulletItem>
            <BulletItem>
              Must provide a clear <strong>unboxing video proof</strong>.
            </BulletItem>
            <BulletItem>Product must be unused.</BulletItem>
            <SectionTitle>After Verification</SectionTitle>
            <BulletItem>
              Replacement shipped at no additional cost, <em>OR</em> refund
              processed on a case-by-case basis.
            </BulletItem>
            <SectionTitle>🔁 Change of Mind Returns</SectionTitle>
            <BulletItem>
              <strong>₹200 logistics &amp; handling charges</strong> will be
              deducted.
            </BulletItem>
            <BulletItem>
              Product must be unused and in original condition.
            </BulletItem>
            <BulletItem>
              Return pickup will be arranged by us, or you may ship back at your
              own cost.
            </BulletItem>
            <SectionTitle>🚫 Non-Returnable Items</SectionTitle>
            <BulletItem>
              Customized (Elite) planners with name or personalisation
            </BulletItem>
            <BulletItem>Used products</BulletItem>
            <BulletItem>Damaged products without unboxing proof</BulletItem>
          </PolicyCard>

          {/* 4. Refund Policy */}
          <PolicyCard
            icon={Package}
            title="4. Refund Policy"
            color="oklch(0.52 0.17 30)"
          >
            <BulletItem>
              Refunds are processed within <strong>5–7 business days</strong>{" "}
              after approval.
            </BulletItem>
            <BulletItem>
              Refunds will be credited to the{" "}
              <strong>original payment method</strong>.
            </BulletItem>
            <BulletItem>
              Payment gateway charges (if applicable) may be deducted.
            </BulletItem>
          </PolicyCard>

          {/* 5. Privacy Policy */}
          <PolicyCard
            icon={ShieldCheck}
            title="5. Privacy Policy"
            color="oklch(0.45 0.14 290)"
          >
            <BulletItem>
              Customer information (name, address, phone number) is collected{" "}
              <strong>only for order fulfillment</strong>.
            </BulletItem>
            <BulletItem>
              Your information is <strong>not sold or shared</strong> with any
              third parties.
            </BulletItem>
            <BulletItem>
              Data is used only for shipping and order communication.
            </BulletItem>
          </PolicyCard>

          {/* 6. Liability Disclaimer */}
          <PolicyCard
            icon={AlertTriangle}
            title="6. Liability Disclaimer"
            color="oklch(0.6 0.15 75)"
          >
            <BulletItem>
              Product colours may slightly vary due to printing differences.
            </BulletItem>
            <BulletItem>
              Delivery delays caused by courier partners are beyond our control.
            </BulletItem>
            <BulletItem>
              Minor printing variations are not considered defects.
            </BulletItem>
          </PolicyCard>

          {/* 7. Contact & Support */}
          <PolicyCard
            icon={MessageCircle}
            title="7. Contact & Support Policy"
            color="oklch(0.42 0.12 200)"
          >
            <BulletItem>
              Contact us via <strong>WhatsApp Business</strong> for all support
              queries.
            </BulletItem>
            <BulletItem>
              Queries will be responded to within <strong>24 hours</strong>.
            </BulletItem>
            <BulletItem>
              Please include your <strong>Order ID</strong> for faster
              resolution.
            </BulletItem>
          </PolicyCard>

          {/* Eco pledge short note */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-5 flex items-start gap-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.34 0.095 155 / 0.08), oklch(0.42 0.1 155 / 0.04))",
              border: "1px solid oklch(0.34 0.095 155 / 0.2)",
            }}
          >
            <Leaf className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans-display font-semibold text-forest text-sm mb-1">
                Thank you for supporting our eco-friendly student brand 💚
              </p>
              <p className="text-muted-foreground text-xs font-body leading-relaxed">
                • Report damage within 48 hours with unboxing video
                &nbsp;•&nbsp; Customized planners are non-returnable
                &nbsp;•&nbsp; Change-of-mind returns have ₹200 logistics
                deduction
              </p>
              <p className="text-muted-foreground text-xs font-body mt-1.5">
                For help, contact us on WhatsApp. We're here to help.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-forest-dark py-8 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display text-lg font-bold text-white">
              Exam<span className="text-gold">Kit</span>
            </div>
            <p className="text-white/50 text-xs font-body mt-0.5">
              India's premium eco exam planner
            </p>
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
