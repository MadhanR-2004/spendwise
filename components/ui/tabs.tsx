"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-10 items-center rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-zinc-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/40 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-zinc-100 dark:data-[state=active]:text-black",
        className
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
