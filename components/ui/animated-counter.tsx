"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function AnimatedCounter({
  value,
  formatter,
  className,
}: {
  value: number;
  formatter?: (v: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 25 });
  const [display, setDisplay] = useState(
    formatter ? formatter(0) : "0"
  );

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(
        formatter ? formatter(v) : Math.round(v).toLocaleString()
      );
    });
    return unsub;
  }, [spring, formatter]);

  return <motion.span className={className}>{display}</motion.span>;
}
