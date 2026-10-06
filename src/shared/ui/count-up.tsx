"use client";

import { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

interface CountUpProps {
  value: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  value,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const targetValue = Math.max(0, typeof value === "number" ? value : Number(value) || 0);

  useEffect(() => {
    if (!isInView) return;

    const node = ref.current;
    if (!node) return;

    if (targetValue === 0) {
      node.textContent = `${prefix}0${suffix}`;
      return;
    }

    const controls = animate(0, targetValue, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate(latest) {
        if (node) {
          node.textContent = `${prefix}${Math.round(latest).toLocaleString("id-ID")}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [isInView, targetValue, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
