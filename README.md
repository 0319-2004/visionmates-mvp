# VisionMates MVP (Next.js + Supabase)

A minimal "vision-first teammate finder" MVP. Post a project, signal interest in 3 levels, comment, and share updates.

## 🧰 Stack
- Next.js (App Router)
- Supabase (Postgres + Auth + Storage)
- Tailwind CSS

## ⚙️ Setup

1) **Create Supabase project**
- Get your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- In Supabase SQL editor, run the SQL in `supabase/schema.sql`

2) **Local env**
```bash
cp .env.example .env.local
# fill in your Supabase URL & anon key
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:3000
```

3) **Deploy**
- Push to GitHub
- Import repo on **Vercel**
- Add env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Deploy

4) **Auth**
- In Supabase → Authentication → Providers, enable **Email (magic link)** and/or **Google**.
- For Google, set your Vercel domain as the authorized redirect.

5) **SEO**
- The app provides `robots.txt` & `sitemap.xml`. In production, adjust `metadataBase` in `app/layout.tsx` and sitemap URLs to your domain.
- Add your domain to **Google Search Console** and submit `/sitemap.xml`.

## 🗃️ Data model
See `supabase/schema.sql`.

## 🔒 Notes
- Row Level Security (RLS) is **enabled**. Reads are public; writes require auth.
- Client-only writes keep MVP simple. Move critical writes to server routes later.
