"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary";
}

const variants = {
  default:
    "bg-white/10 text-zinc-900 border-white/20 hover:bg-white/20 hover:border-white/30 dark:bg-white/[0.06] dark:text-zinc-100 dark:border-white/[0.1] dark:hover:bg-white/[0.1] dark:hover:border-white/[0.15]",
  secondary:
    "bg-white/10 text-zinc-900 border-white/20 hover:bg-white/20 hover:border-white/30 dark:bg-white/[0.06] dark:text-zinc-100 dark:border-white/[0.1] dark:hover:bg-white/[0.1] dark:hover:border-white/[0.15]",
};

export function ShimmerButton({
  className,
  variant = "default",
  children,
  disabled,
  ...props
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-xl border px-6 text-sm font-semibold backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {/* Prismatic top edge */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-40"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,200,255,0.5) 30%, rgba(200,220,255,0.5) 50%, rgba(200,255,220,0.5) 70%, transparent)",
        }}
      />
      {/* Inner glow ring */}
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.08]" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2,
        }}
      />
    </motion.button>
  );
}
