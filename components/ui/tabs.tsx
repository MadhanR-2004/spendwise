"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return <TabsPrimitive.List className={cn("inline-flex h-10 items-center rounded-md bg-slate-100 p-1 dark:bg-slate-800", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow dark:data-[state=active]:bg-slate-950",
        className
      )}
      {...props}
    />
  );
}

export const TabsContent = TabsPrimitive.Content;
