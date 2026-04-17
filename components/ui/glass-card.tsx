"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type GlassCardProps = Omit<
  React.ComponentProps<typeof motion.div>,
  "children"
> & {
  glow?: boolean;
  children?: React.ReactNode;
};

export function GlassCard({
  className,
  glow = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-2xl",
        // Light mode
        "bg-white/70 border-white/40 shadow-[0_2px_16px_rgba(0,0,0,0.06)]",
        // Dark mode — liquid glass look
        "dark:bg-white/[0.04] dark:border-white/[0.1] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]",
        // Hover
        "transition-all duration-300 hover:border-white/50 dark:hover:border-white/[0.15] dark:hover:bg-white/[0.06]",
        glow && "dark:shadow-[0_0_48px_rgba(99,102,241,0.06),0_8px_32px_rgba(0,0,0,0.35)]",
        className
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {/* Prismatic refraction edge — subtle rainbow highlight on top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] opacity-40 dark:opacity-25"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,120,120,0.5) 15%, rgba(255,200,100,0.5) 30%, rgba(130,255,130,0.5) 50%, rgba(100,180,255,0.5) 70%, rgba(180,130,255,0.5) 85%, transparent 100%)",
        }}
      />
      {/* Inner refraction ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.08] dark:ring-white/[0.05]" />
      {/* Frosted shine overlay on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-white/[0.02]" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
