"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight, high-performance ScrollRevealProvider.
 * Observes `.scroll-reveal` elements using IntersectionObserver without
 * invoking synchronous `getBoundingClientRect()` inside DOM mutation callbacks,
 * preventing layout thrashing and main thread jank during navigation.
 */
export function ScrollRevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 150px 0px" },
    );

    const observeAll = () => {
      document
        .querySelectorAll(".scroll-reveal")
        .forEach((el) => {
          el.classList.add("visible");
          observer.observe(el);
        });
    };

    // Immediate check
    observeAll();

    // Secondary check after short delay to catch dynamic components
    const timer = setTimeout(() => {
      observeAll();
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
