"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabase";
import WishGrid from "@/app/components/WishGrid";

// Target Birthday: July 27, 2026 at Midnight (recipient's local timezone)
const BIRTHDAY_TARGET = new Date("2026-07-27T00:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Wish {
  id: string;
  contributor: string;
  letter: string;
  image_url: string;
}

/* ─── Ambient floating particles for the countdown ─── */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(251, 191, 36, ${p.opacity})`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Single countdown digit block ─── */
function CountdownUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl px-5 py-4 sm:px-7 sm:py-5 min-w-[80px] sm:min-w-[100px]">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: -12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="block text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-white tabular-nums text-center"
            >
              {String(value).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white/40">
        {label}
      </span>
    </div>
  );
}

/* ─── Colon separator between digits ─── */
function Separator() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="text-3xl sm:text-4xl md:text-5xl font-mono font-light text-white/30 self-start mt-4 sm:mt-5"
    >
      :
    </motion.span>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════ */
export default function BirthdayPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Countdown timer
  useEffect(() => {
    setHasMounted(true);

    // Dev/Preview bypass via query parameter (?bypass=true or ?unlock=true or ?preview=true)
    const params = new URLSearchParams(window.location.search);
    const hasBypassParam =
      params.get("bypass") === "true" ||
      params.get("unlock") === "true" ||
      params.get("preview") === "true";

    if (hasBypassParam) {
      setIsUnlocked(true);
      return;
    }

    const calculateTimeLeft = (): TimeLeft | null => {
      const difference = +BIRTHDAY_TARGET - +new Date();

      if (difference <= 0) {
        setIsUnlocked(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const initialTime = calculateTimeLeft();
    if (initialTime) setTimeLeft(initialTime);

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining) {
        setTimeLeft(remaining);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch wishes ONLY after unlock — timezone gated
  useEffect(() => {
    if (!isUnlocked) return;

    const fetchWishes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("wishes")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (data) setWishes(data);
      } catch (err) {
        console.error("Failed to fetch wishes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishes();
  }, [isUnlocked]);

  // ─── LOCKED STATE: Countdown ───
  if (!isUnlocked) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{ backgroundColor: "#0f172a" }}
      >
        {/* Ambient background glow */}
        <div className="countdown-glow absolute inset-0 animate-glow-pulse" />

        {/* Floating particles */}
        {hasMounted && <Particles />}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center gap-10 sm:gap-14 px-4"
        >
          {/* Heading */}
          <div className="text-center space-y-3">
            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.3em" }}
              animate={{ opacity: 1, letterSpacing: "0.2em" }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="text-2xl sm:text-3xl md:text-4xl font-light text-white/80 tracking-[0.2em]"
            >
              Something special is waiting...
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
            />
          </div>

          {/* Countdown timer */}
          <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
            <CountdownUnit value={hasMounted ? timeLeft.days : 0} label="Days" />
            <Separator />
            <CountdownUnit value={hasMounted ? timeLeft.hours : 0} label="Hours" />
            <Separator />
            <CountdownUnit value={hasMounted ? timeLeft.minutes : 0} label="Mins" />
            <Separator />
            <CountdownUnit value={hasMounted ? timeLeft.seconds : 0} label="Secs" />
          </div>

          {/* Subtle footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-xs text-white/20 tracking-widest uppercase"
          >
            Until the wishing well opens
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ─── UNLOCKED STATE: Birthday Gallery ───
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="gallery-bg min-h-screen"
      >
        {/* Header */}
        <header className="pt-16 pb-8 sm:pt-20 sm:pb-12 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-amber-600/60 text-sm tracking-[0.3em] uppercase font-medium mb-4">
              July 27, 2026
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-ink font-medium leading-tight">
              Happy Birthday, Chinmayi{" "}
              <span className="inline-block animate-float">✨</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent"
            />
            <p className="mt-6 text-lg text-ink-soft/60 font-light leading-relaxed max-w-lg mx-auto">
              The people who love you left some notes for you to open.
            </p>
          </motion.div>
        </header>

        {/* Wishes Grid */}
        <main className="pb-20">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-amber-300 border-t-transparent rounded-full"
              />
            </div>
          ) : wishes.length > 0 ? (
            <WishGrid wishes={wishes} />
          ) : (
            <div className="text-center py-20 text-ink-soft/40">
              <p className="text-lg">The wishing well is waiting for its first letter...</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center pb-10 px-4">
          <p className="text-xs text-ink-soft/25 tracking-widest uppercase">
            Made with love · 21 Letters
          </p>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}