"use client";

import { useEffect, useRef } from "react";

/**
 * Replicates the prototype's scroll-reveal behavior (`.scroll-reveal` /
 * `.scroll-reveal.visible` classes + IntersectionObserver, see the inline
 * `<script>` in every `code.html`) as a reusable hook instead of a global
 * `document.querySelectorAll` side effect.
 *
 * Usage: `const ref = useScrollReveal(); <div ref={ref} className="scroll-reveal">`
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
