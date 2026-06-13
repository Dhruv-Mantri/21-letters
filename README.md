# 21-letters

Act as a senior frontend engineer and UI/UX designer. I am building a private, collaborative birthday gift website for my girlfriend. The application is built using Next.js, Tailwind CSS, Framer Motion, and Supabase.

Here is the exact look, feel, and functionality of the final production website:

1. CORE OVERVIEW & VIBE
   The website is a private digital "wishing well" designed to look like an elegant, sentimental, and premium digital keepsake. The aesthetic balances a clean, modern dark-mode landing experience with a warm, nostalgic, cream-toned paper-and-ink gallery.

2. VISUAL LAYOUT & PAGES

- Landing Page (Locked State): A minimalist, immersive dark slate background (#0f172a) featuring a large, crisp, monochromatic digital countdown timer built using monospace typography. The heading reads a soft, tracking-wide message: "Something special is waiting...".
- Birthday Gallery (Unlocked State): A warm, inviting off-white/amber canvas (#fefaf6). The header features clean, elegant serif typography wishing her a happy birthday, leading into a beautiful, organic grid layout.

3. THE INTERACTIVE POLAROID CARD UI
   The heart of the site is a grid of responsive, floating cards styled to look exactly like physical Polaroid pictures:

- Each card is a clean white block with a subtle border and shadow, holding an uploaded square image (forced into a perfect 1:1 aspect-square ratio with object-cover cropping).
- The photos feature a slight vintage sepia filter (sepia-[10%]) and a subtle top-right white gradient gloss overlay to simulate real photographic paper.
- Below the photo, the birthday letter is styled using a highly realistic, fluid handwriting script web font ('Caveat'). For longer letters, the text safely scrolls inside a customized, ultra-thin translucent amber scrollbar so it never distorts the card geometry.
- The bottom of the card features a dashed separator with a clean, modern sans-serif signature: "From — [Name]".

4. MOTION, INTERACTION, & ANIMATION

- Grid Staggering: To avoid a rigid computer-generated look, the cards are organically scattered across the screen using alternating subtle rotations (some tilted slightly left, others right by 1 to 3 degrees).
- Physics-Based Hover Effects: When a user hovers over any Polaroid, a smooth 300ms transition occurs. The card dynamically straightens back to 0 degrees, lifts upward on the Y-axis (-translate-y-4), drops a deep, realistic ambient shadow (shadow-2xl), and scales slightly forward.
- Entrance Animations: When the gallery unlocks, the cards stagger-fade onto the screen from the bottom up using Framer Motion for a high-end, choreographed reveal.

5. BACKEND & UNDER-THE-HOOD FUNCTIONALITY

- Timezone Gating: The frontend tracks the target birthday countdown relative to the recipient's local device time zone. Data fetching is strictly gated; the application only queries the database once the countdown hits zero to prevent early network inspection.
- Two-Sided Data Pipeline: There is a separate, hidden, mobile-optimized form page (/contribute) where friends and family input their name, write a letter, and upload a file. The image is uploaded to a Supabase Storage bucket with a collision-resistant timestamp filename, and its public asset URL is mapped alongside the text fields into a PostgreSQL 'wishes' table.
