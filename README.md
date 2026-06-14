# 21 Letters ✉️✨

A private, collaborative, and sentimental digital "wishing well" designed as a premium birthday keepsake. The website features a countdown timer that gates access to a beautiful, organic gallery of vintage Polaroid-style cards containing letters and photos from friends and family.

---

## 🎨 Design & Experience

- **Minimalist Countdown (Locked State):** A sleek dark slate background (`#0f172a`) with a monospace digital timer showing the exact time remaining until the recipient's birthday (July 27, 2026).
- **Birthday Gallery (Unlocked State):** A warm, cream/amber canvas (`#fefaf6`) with elegant serif typography. The letters from loved ones stagger-fade onto the screen in an organic grid of Polaroid cards.
- **Polaroid Card UI:** Clean white blocks with realistic photo borders, a white gloss gloss-overlay, sepia filters, customized scrollbars for longer text, and letters rendered in a fluid handwriting font (`Caveat`).
- **Interactive Animations:** Cards are slightly rotated at randomized angles. On hover, cards smoothly straighten, slide upwards, scale slightly, and cast a deep realistic shadow.

---

## 🖥️ How to Use the Website

The website has a two-sided flow: one public countdown/gallery for the birthday recipient, and a hidden form page for contributors.

### 1. For Contributors (Adding Letters & Photos)

To populate the wishing well, send the contribution link to friends and family prior to the birthday:

1. Navigate to the hidden path: `/contribute` (e.g., `https://your-domain.com/contribute`).
2. Enter your **Name or Relationship** (e.g., "Sarah (College Roommate)").
3. Write your **Birthday Message / Letter**.
4. Drag and drop or click to upload a **Photo** (PNG, JPG, WEBP under 5MB).
5. Click **Submit Message**. The image will be uploaded, and the letter metadata will be saved.

### 2. For the Birthday Recipient

1. On visiting the homepage, they will see a countdown ticking down in their local timezone.
2. The page is **Timezone-Gated**—to prevent network inspection or early access, data is only queried from the database once the countdown reaches zero.
3. Once the countdown hits zero, the site automatically unlocks the **Birthday Gallery**, revealing all the Polaroid cards with smooth stagger entrance animations.

### 3. For Development & Testing (Bypass Countdown)

To bypass the countdown during development or testing, add one of the following query parameters to the URL:

- `?bypass=true` (e.g., `http://localhost:3000/?bypass=true` or `https://your-domain.com/?bypass=true`)
- `?unlock=true`
- `?preview=true`

This will trigger the gallery state immediately and fetch data from the database, allowing you to preview exactly what the recipient will see when the countdown expires.

---

## 🗄️ How the Database Works

The backend runs entirely on **Supabase** (Postgres Database & Cloud Storage). When a contributor submits the form, a two-sided pipeline executes:

1. **File Storage:** The photo is uploaded to a Supabase Storage bucket named `birthday-photos` under the path `uploads/` with a collision-resistant timestamp name.
2. **Database Record:** The public URL of the uploaded image, along with the contributor's name and letter, is inserted into the `wishes` PostgreSQL table.

### 1. Database Schema

Run the following SQL in your Supabase SQL Editor to set up the `wishes` table and configure Row Level Security (RLS) policies:

```sql
-- Create the wishes table
create table public.wishes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contributor text not null,
  letter text not null,
  image_url text not null
);

-- Enable Row Level Security (RLS)
alter table public.wishes enable row level security;

-- Policy: Allow anyone to view wishes (required for the gallery)
create policy "Allow public read access" on public.wishes
  for select using (true);

-- Policy: Allow anyone to submit wishes (required for the contribution form)
create policy "Allow public insert access" on public.wishes
  for insert with check (true);
```

### 2. Storage Bucket Setup

1. Create a **New Bucket** in Supabase Storage.
2. Name the bucket **`birthday-photos`** and set its access level to **Public** (so public image URLs work).
3. Set up the following storage policies for the `birthday-photos` bucket:
   - **Select / Read Policy:** Enable `SELECT` for all users (public read access).
   - **Insert Policy:** Enable `INSERT` for all users (allowing anyone to upload files via `/contribute`).

---

## ⚙️ Project Configuration & Environment Variables

Create a `.env.local` (or `.env`) file in the root of the project with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-api-key
```

_Note: You can find these values under **Project Settings > API** in your Supabase dashboard._

---

## 🛠️ Local Development & Deployment

### Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn

### Setup Instructions

1. **Clone the repository** and navigate to the directory:
   ```bash
   cd 21-letters
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
   _Open [http://localhost:3000](http://localhost:3000) in your browser to see the result._
4. **Build for production:**
   ```bash
   npm run build
   ```
