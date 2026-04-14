"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, ...props }: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn("z-50 w-72 rounded-md border border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
