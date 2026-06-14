"use client";

import { motion, Variants } from "framer-motion";

interface Wish {
  id: string;
  contributor: string;
  letter: string;
  image_url: string;
}

interface WishGridProps {
  wishes: Wish[];
}

// Organic rotation values — subtle tilt in degrees
const rotations = [
  -2.5, 1.8, -1.2, 2.4, -1.8, 1.5, -2.1, 2.8, -0.8, 1.3,
];

// Stagger animations for the grid
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function WishGrid({ wishes }: WishGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 px-4 md:px-8 max-w-6xl mx-auto"
    >
      {wishes.map((wish, index) => {
        const rotation = rotations[index % rotations.length];

        return (
          <motion.div
            key={wish.id}
            variants={cardVariants}
            className="w-full flex justify-center"
          >
            {/* Polaroid Card */}
            <motion.div
              initial={{ rotate: rotation }}
              whileHover={{
                rotate: 0,
                y: -16,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className="group w-full max-w-[340px] bg-white p-4 pb-6 rounded-sm cursor-default
                border border-stone-200/60
                shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_1px_3px_-1px_rgba(0,0,0,0.05)]
                hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15),0_8px_20px_-8px_rgba(0,0,0,0.1)]
                transition-shadow duration-300 ease-out"
            >
              {/* Photo Area */}
              <div className="relative w-full aspect-square bg-stone-50 overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={wish.image_url}
                  alt={`Photo from ${wish.contributor}`}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{
                    filter: "sepia(10%) contrast(95%) brightness(102%)",
                  }}
                  loading="lazy"
                />

                {/* Vintage photo gloss overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/[0.12] pointer-events-none" />

                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] pointer-events-none rounded-sm" />
              </div>

              {/* Caption / Letter Area */}
              <div className="mt-5 space-y-3">
                {/* Scrollable letter — handwriting font */}
                <div className="max-h-36 overflow-y-auto pr-1 polaroid-scrollbar">
                  <p className="polaroid-handwriting text-stone-700 leading-relaxed selection:bg-amber-100">
                    &ldquo;{wish.letter}&rdquo;
                  </p>
                </div>

                {/* Dashed separator + Signature */}
                <div className="pt-3 border-t border-dashed border-stone-200/80 flex justify-between items-center">
                  <span className="text-[0.65rem] tracking-[0.2em] text-stone-400 uppercase font-mono">
                    From
                  </span>
                  <span className="font-medium text-stone-800 text-sm tracking-wide">
                    — {wish.contributor}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}