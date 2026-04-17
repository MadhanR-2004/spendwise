import * as SeparatorPrimitive from "@radix-ui/react-separator";

function Separator({ orientation = "horizontal" }: { orientation?: "horizontal" | "vertical" }) {
  return (
    <SeparatorPrimitive.Root
      decorative
      orientation={orientation}
      className={orientation === "horizontal" ? "h-px w-full bg-zinc-200 dark:bg-zinc-800" : "h-full w-px bg-zinc-200 dark:bg-zinc-800"}
    />
  );
}

export { Separator };
