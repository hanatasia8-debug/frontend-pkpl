"use client";

import { useEffect, useState } from "react";

/** Thin progress bar pinned to the top of the article, as in the prototype. */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setProgress(scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="bg-primary fixed top-0 left-0 z-[60] h-1 transition-all duration-150"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
