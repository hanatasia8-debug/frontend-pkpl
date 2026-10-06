"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { User, X } from "lucide-react";
import { KKN_INFO, KKN_MEMBERS, KknMember } from "@/shared/data/kkn-team.data";
import { cn } from "@/shared/utils/cn";

interface Kkn3dCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Kkn3dCarouselModal({ isOpen, onClose }: Kkn3dCarouselModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const total = KKN_MEMBERS.length;

  // 1. Always reset to member #1 (index 0) whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setDragOffset(0);
    }
  }, [isOpen]);

  // Screen size detection for responsive 3D spacing
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextMember = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setDragOffset(0);
  }, [total]);

  const prevMember = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setDragOffset(0);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextMember();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevMember();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextMember, prevMember, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragOffset(info.offset.x);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 35;
    const velocity = 200;

    if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      nextMember();
    } else if (info.offset.x > threshold || info.velocity.x > velocity) {
      prevMember();
    } else {
      setDragOffset(0);
    }
  };

  // Render 5 slots around currentIndex: [-2, -1, 0, 1, 2]
  const visibleOffsets = [-2, -1, 0, 1, 2];
  const spacing = isMobile ? 165 : 255;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8">
          {/* Backdrop: Frosted Forest Glass Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#003527]/50 backdrop-blur-md"
          />

          {/* Modal Container: Dominant Clean Pure White */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] border border-outline-variant/50 bg-[#FFFFFF] p-6 text-on-surface shadow-[0_25px_70px_rgba(0,53,39,0.2)] sm:p-8 md:p-10"
          >
            {/* Header: Clean & Authentic */}
            <div className="relative flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                {KKN_INFO.title}
              </span>
              <span className="mt-0.5 text-[10px] tracking-widest text-on-surface-variant/80 font-mono font-medium">
                {KKN_INFO.year}
              </span>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Tutup Modal"
                className="group absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 bg-surface text-on-surface-variant transition-all hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-95 shadow-2xs"
              >
                <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* True 3D Physical CoverFlow Viewport (Full Gesture Swipe) */}
            <div className="relative my-4 flex min-h-[380px] sm:min-h-[415px] md:min-h-[440px] items-center justify-center overflow-hidden py-4 select-none [perspective:1400px]">
              <div
                className="relative flex h-full w-full items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                {visibleOffsets.map((offset) => {
                  const targetIndex = (currentIndex + offset + total) % total;
                  const member = KKN_MEMBERS[targetIndex];
                  const isActive = offset === 0;

                  // 3D Motion calculations with real-time drag integration
                  const baseX = offset * spacing;
                  const currentX = baseX + dragOffset * (isActive ? 1 : 0.45);

                  let rotateY = 0;
                  if (isActive) {
                    rotateY = -dragOffset * 0.08;
                  } else if (offset === -1) {
                    rotateY = 24;
                  } else if (offset === 1) {
                    rotateY = -24;
                  } else if (offset === -2) {
                    rotateY = 36;
                  } else if (offset === 2) {
                    rotateY = -36;
                  }

                  const absOffset = Math.abs(offset);
                  const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.84 : 0.66;
                  const z = absOffset === 0 ? 0 : absOffset === 1 ? -130 : -260;
                  const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.65 : 0.15;
                  const zIndex = 30 - absOffset * 10;

                  return (
                    <motion.div
                      key={member.id}
                      onClick={() => {
                        if (offset === -1) prevMember();
                        if (offset === 1) nextMember();
                      }}
                      drag={isActive ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.45}
                      onDrag={isActive ? handleDrag : undefined}
                      onDragEnd={isActive ? handleDragEnd : undefined}
                      animate={{
                        x: currentX,
                        scale,
                        rotateY,
                        z,
                        opacity,
                        rotateZ: isActive ? dragOffset * 0.02 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 28,
                        mass: 0.8,
                      }}
                      style={{
                        position: "absolute",
                        zIndex,
                        transformStyle: "preserve-3d",
                        cursor: isActive
                          ? "grab"
                          : absOffset === 1
                          ? "pointer"
                          : "default",
                      }}
                      whileTap={isActive ? { cursor: "grabbing" } : undefined}
                    >
                      <MemberCard
                        member={member}
                        index={targetIndex}
                        total={total}
                        isActive={isActive}
                        offset={offset}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Progress (Full Geser / Swipe Navigation - No Next/Prev Buttons) */}
            <div className="flex flex-col items-center gap-2.5">
              {/* Minimal Counter */}
              <div className="font-mono text-xs tracking-widest text-on-surface-variant">
                <span className="font-bold text-primary">
                  {String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span className="mx-1 text-outline-variant">/</span>
                <span>{String(total).padStart(2, "0")}</span>
              </div>

              {/* Smooth Progress Tracker */}
              <div className="relative h-[3px] w-52 overflow-hidden rounded-full bg-surface-container-highest">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full"
                  animate={{
                    width: `${((currentIndex + 1) / total) * 100}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>

              {/* Gesture Swipe Caption */}
              <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/70 font-semibold">
                Geser kartu untuk menjelajah
              </p>
            </div>

            {/* Footer Section */}
            <div className="mt-5 flex flex-col items-center justify-center border-t border-outline-variant/30 pt-4 text-center">
              <p className="font-serif italic text-xs md:text-sm text-on-surface-variant max-w-lg leading-relaxed">
                &ldquo;{KKN_INFO.appreciationQuote}&rdquo;
              </p>

              <span className="mt-1.5 text-[10px] tracking-wider text-primary/80 uppercase font-mono font-semibold">
                {KKN_INFO.title} · {KKN_INFO.year}
              </span>

              {/* Clean Outlined Button */}
              <button
                onClick={onClose}
                className="mt-3.5 inline-flex items-center justify-center rounded-full border-2 border-primary bg-surface-container-lowest px-7 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary hover:scale-105 active:scale-95 shadow-xs"
              >
                Tutup & Kembali ke Website
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface MemberCardProps {
  member: KknMember;
  index: number;
  total: number;
  isActive?: boolean;
  offset: number;
}

function MemberCard({
  member,
  index,
  total,
  isActive,
  offset,
}: MemberCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-[355px] w-[265px] sm:h-[385px] sm:w-[285px] md:h-[405px] md:w-[305px] flex-col items-center justify-between overflow-hidden rounded-[2.2rem] border p-6 text-center transition-all duration-300",
        isActive
          ? "border-primary/25 bg-[#FFFFFF] text-on-surface shadow-[0_20px_50px_rgba(0,53,39,0.12)] ring-1 ring-primary/10"
          : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant shadow-md",
      )}
    >
      {/* Dynamic 3D Ambient Light Reflection */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[2.2rem] transition-opacity duration-300",
          isActive
            ? "bg-gradient-to-tr from-transparent via-primary/[0.03] to-transparent opacity-100"
            : offset < 0
            ? "bg-gradient-to-r from-black/[0.04] via-transparent to-transparent opacity-90"
            : "bg-gradient-to-l from-black/[0.04] via-transparent to-transparent opacity-90",
        )}
      />

      {/* Subtle Inner Hairline Border */}
      <div className="pointer-events-none absolute inset-2.5 rounded-[1.8rem] border border-outline-variant/30" />

      {/* Top Portrait Avatar with Lucide User Icon */}
      <div className="mt-2 relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-primary/20 bg-surface-container-low p-1.5 shadow-inner">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/15 shadow-2xs">
          <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary" strokeWidth={1.75} />
        </div>
      </div>

      {/* Member Information */}
      <div className="flex flex-col items-center px-1 z-10">
        {/* Full Name */}
        <h3 className="font-headline-md text-base sm:text-lg md:text-xl font-bold tracking-tight text-primary leading-snug">
          {member.name}
        </h3>

        {/* Role Pill Badge */}
        <div className="mt-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-0.5 text-xs font-semibold text-primary shadow-2xs">
          {member.role}
        </div>

        {/* Program Studi · Fakultas */}
        <p className="mt-1.5 text-[11px] sm:text-xs text-on-surface-variant leading-normal">
          {member.major} · {member.faculty}
        </p>
      </div>

      {/* Bottom Counter */}
      <div className="w-full flex items-center justify-between pt-2 px-2 text-[10px] font-mono text-on-surface-variant/70 z-10">
        <span className="uppercase tracking-widest text-primary font-bold">2026</span>
        <span className="font-semibold text-on-surface">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
