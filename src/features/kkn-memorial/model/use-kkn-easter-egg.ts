"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const EVENT_NAME = "kkn-open-memorial";

export function triggerKknMemorial() {
  if (typeof window !== "undefined") {
    // queueMicrotask ensures event dispatch is safely queued outside any active React 19 render cycle
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    });
  }
}

export function useKknEasterEgg() {
  const [isOpen, setIsOpen] = useState(false);
  const keySequenceRef = useRef<string[]>([]);
  const keyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    // 1. Custom event listener
    const handleCustomEvent = () => {
      setIsOpen(true);
    };

    window.addEventListener(EVENT_NAME, handleCustomEvent);

    // 2. Keyboard listener ("kkn" or "Shift+K")
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input/textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check Shift+K
      if (e.shiftKey && (e.key === "K" || e.key === "k")) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Sequence detector for "k-k-n"
      const key = e.key.toLowerCase();
      if (["k", "n"].includes(key)) {
        keySequenceRef.current.push(key);

        if (keyTimerRef.current) {
          clearTimeout(keyTimerRef.current);
        }
        keyTimerRef.current = setTimeout(() => {
          keySequenceRef.current = [];
        }, 2000);

        const sequenceStr = keySequenceRef.current.join("");
        if (sequenceStr.endsWith("kkn")) {
          keySequenceRef.current = [];
          setIsOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
      window.removeEventListener("keydown", handleKeyDown);
      if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
    };
  }, []);

  return {
    isOpen,
    open,
    close,
  };
}
