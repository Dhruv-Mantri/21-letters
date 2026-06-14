"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface Wish {
  id: string;
  contributor: string;
  letter: string;
  image_url: string;
}

interface WishGridProps {
  wishes: Wish[];
}

// Organic rotation values for resting grid
const rotations = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.5, -2.1, 2.8, -0.8, 1.3];

// Stagger animations for the grid
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function WishGrid({ wishes }: WishGridProps) {
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 px-4 md:px-8 max-w-6xl mx-auto justify-items-center"
      >
        {wishes.map((wish, index) => {
          const rotation = rotations[index % rotations.length];

          return (
            <motion.div
              key={wish.id}
              variants={cardVariants}
              className="w-full flex justify-center"
            >
              {/* Envelope Card */}
              <motion.div
                initial={{ rotate: rotation }}
                whileHover={{
                  rotate: 0,
                  y: -16,
                  scale: 1.05,
                  transition: { duration: 0.35, ease: "easeOut" },
                }}
                onClick={() => setSelectedWish(wish)}
                className="group relative w-full max-w-[340px] h-[240px] cursor-pointer rounded-lg z-0"
              >
                {/* 1. THE EMBEDDED PEEKING LETTER (Pulls out on hover) */}
                <div className="absolute inset-x-4 top-4 h-[170px] bg-stone-50 rounded-md shadow-sm border border-stone-200/80 p-3 transform transition-transform duration-500 ease-out translate-y-12 group-hover:-translate-y-14 z-10 flex flex-col items-center">
                  <div className="w-12 h-1 bg-stone-200 rounded-full mb-2" />
                  <p className="text-[10px] font-mono tracking-[0.15em] text-stone-400/80 uppercase mb-2">Special Note</p>
                  
                  {/* Mocked mini graphic preview on peeking card */}
                  <div className="w-full flex-1 bg-stone-100 rounded overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={wish.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* 2. ENVELOPE BACKPLATE & OPEN TOP FLAP */}
                <div className="absolute inset-0 bg-[#854d0e] rounded-lg shadow-md z-0 overflow-hidden">
                  {/* Open V flap (Triangle pointing up) */}
                  <svg className="absolute top-0 inset-x-0 w-full h-[70px] text-[#78350f] fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="0,100 50,0 100,100" />
                  </svg>
                  
                  {/* Dark interior shadow pocket */}
                  <div className="absolute bottom-0 inset-x-0 h-[170px] bg-amber-950/60 rounded-b-lg border-t border-amber-950/40" />
                </div>

                {/* 3. ENVELOPE FRONT POCKET COVER (Masks the letter at rest) */}
                <div className="absolute bottom-0 inset-x-0 h-[170px] z-20 pointer-events-none">
                  <svg className="w-full h-full rounded-b-lg overflow-hidden filter drop-shadow-[0_-4px_10px_rgba(0,0,0,0.12)]" viewBox="0 0 340 170" preserveAspectRatio="none">
                    {/* Left flap fold */}
                    <polygon points="0,0 170,85 0,170" fill="#b45309" />
                    
                    {/* Right flap fold */}
                    <polygon points="340,0 170,85 340,170" fill="#92400e" />
                    
                    {/* Bottom flap fold */}
                    <polygon points="0,170 170,85 340,170" fill="#d97706" />
                    
                    {/* Origami highlight lines */}
                    <polyline points="0,0 170,85 340,0" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.15" />
                    <polyline points="0,170 170,85 340,170" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.1" />
                  </svg>
                </div>

                {/* 4. NAME TAG LABEL OVERLAY */}
                <div className="absolute inset-x-0 bottom-0 h-[170px] flex items-center justify-center p-4 z-30 pointer-events-none">
                  <div className="bg-[#fdfbf7] shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_0_12px_rgba(217,119,6,0.04)] px-5 py-2.5 border border-amber-900/10 rounded-sm transform -rotate-1 max-w-[85%] text-center">
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-700/80 font-bold mb-0.5">
                      For Chinmayi
                    </p>
                    <p className="font-serif font-semibold text-stone-800 text-sm truncate">
                      From: {wish.contributor}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─── FOCUSED MODAL (The Unfolded Sheet View) ─── */}
      <AnimatePresence>
        {selectedWish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Viewport Backdrop film */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWish(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Sheet Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-stone-200/50 flex flex-col z-10 max-h-[90vh] md:max-h-[85vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedWish(null)}
                className="absolute top-4 right-4 bg-slate-900/40 hover:bg-slate-900/60 transition-colors text-white rounded-full p-2 z-20 backdrop-blur-sm shadow-md"
                aria-label="Close note"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Scrollable Document Container */}
              <div className="flex-1 overflow-y-auto polaroid-scrollbar bg-[#fdfbf7] flex flex-col">
                {/* Component 1: Image (Top of Scroll) */}
                <div className="relative w-full bg-stone-100/30 border-b border-stone-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedWish.image_url}
                    alt={`Memory with ${selectedWish.contributor}`}
                    className="w-full h-auto object-contain select-none pointer-events-none block"
                    style={{
                      filter: "sepia(8%) contrast(98%) brightness(102%)",
                    }}
                  />
                  {/* Vintage overlays */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/[0.12] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Component 2: Letter content (Bottom of Scroll) */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="polaroid-handwriting text-stone-800 text-left tracking-wide leading-relaxed selection:bg-amber-100/60 whitespace-pre-wrap text-2xl md:text-3xl">
                      &ldquo;{selectedWish.letter}&rdquo;
                    </p>
                  </div>

                  {/* Signature Block */}
                  <div className="pt-6 border-t border-dashed border-stone-200/80 flex flex-col items-end">
                    <span className="text-[10px] tracking-[0.2em] text-stone-400/80 uppercase font-mono mb-1">
                      With Love,
                    </span>
                    <span className="font-serif font-bold text-stone-800 text-lg md:text-xl tracking-wide">
                      — {selectedWish.contributor}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}