"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-900/95 dark:shadow-[0_16px_64px_rgba(0,0,0,0.5)]">
              {/* Subtle top shine */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20 dark:bg-white/[0.06]" />

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    variant === "danger"
                      ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={loading}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onConfirm}
                  disabled={loading}
                  className="rounded-xl"
                >
                  {loading ? "Deleting..." : confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage confirm dialog state.
 * Usage:
 *   const confirm = useConfirm();
 *   <ConfirmDialog {...confirm.dialogProps} />
 *   onClick={() => confirm.open(() => doDelete())}
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    onConfirm: (() => void) | null;
    title?: string;
    description?: string;
    confirmLabel?: string;
  }>({ open: false, onConfirm: null });

  return {
    open: (
      onConfirm: () => void,
      opts?: { title?: string; description?: string; confirmLabel?: string }
    ) => {
      setState({ open: true, onConfirm, ...opts });
    },
    dialogProps: {
      open: state.open,
      title: state.title,
      description: state.description,
      confirmLabel: state.confirmLabel,
      onConfirm: () => {
        state.onConfirm?.();
        setState({ open: false, onConfirm: null });
      },
      onCancel: () => setState({ open: false, onConfirm: null }),
    },
  };
}
