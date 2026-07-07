# Westcoast Automobile — Car Dealership & Rental Management System

Full-stack web application for **Westcoast Automobile**, a car dealership and rental
agency located at Ecowas Road 64, Agbogba Risk Road. Tel: 0553629054 / 0204425572.

**Architecture: fully serverless.** React talks directly to Supabase (Postgres +
Auth + Storage) using Row Level Security for access control. There is no separate
backend server to deploy or run.

---

## Live Supabase Project

- Project: **Westcoast Automobile** (`rngnfvsnolpkxmyhcrql`), region `eu-west-2` (London)
- Dashboard: https://supabase.com/dashboard/project/rngnfvsnolpkxmyhcrql
- Default admin login: `admin@westcoastautomobile.com` / `Admin@123`
  **→ change this password immediately after first login.**

The frontend's `.env.example` already contains this project's URL and public
(anon) key — copy it to `.env` and you're connected. The anon key is safe to
expose in the browser; all access control is enforced by Postgres Row Level
Security policies, not by hiding the key.

---

## Project Structure

```
westcoast-automobile/
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/          Header, Footer, VehicleCard, ProtectedRoute, admin/AdminLayout
        ├── pages/                 public pages + admin/ subfolder
        ├── context/AuthContext.jsx   wraps Supabase Auth session + admin_profiles role
        ├── services/
        │     supabaseClient.js     the one Supabase client instance
        │     vehicleService.js     vehicle CRUD + image/video upload to Storage
        │     bookingService.js     rentals/test-drives/inquiries, availability check
        │     authService.js        login/logout, staff account management
        │     homepageService.js    homepage content + hero image + testimonials
        ├── styles/global.css
        ├── App.jsx
        └── index.js
```

There is no `backend/` folder — it was removed when this project moved to Supabase.

---

## Database Schema (Postgres)

| Table | Purpose |
|---|---|
| `vehicles` | Full vehicle listing: specs, `images` (jsonb array of `{url, path}`), `video` (jsonb `{url, path}`), `sale_price`, `rental_daily/weekly/monthly`, `available_for` (text array: `sale`/`rental`), `status`, `featured`, `views` |
| `bookings` | Unified table for rentals, test drives, purchase inquiries, and trade-ins (`booking_type`). Auto-generated `booking_reference` (e.g. `RNT-260706-0001`). Pricing, payment, and status fields included. |
| `booking_notes` | Internal staff notes on a booking |
| `admin_profiles` | Staff/admin accounts, one row per `auth.users` row, with `role` (`admin`/`manager`/`staff`) and `email` (duplicated here since `auth.users` isn't queryable from the browser) |
| `homepage_content` | Singleton row (`id = 1`) holding hero text/image, about section, services, testimonials, contact info — all editable from the admin panel |

**Key RPC functions:**
- `get_booking_by_reference(reference)` — public lookup for the "Track My Booking" page, without exposing the whole `bookings` table
- `cancel_booking_by_reference(reference, reason)` — lets a customer cancel their own booking by reference
- `check_vehicle_availability(vehicle_id, pickup, return)` — prevents double-booking a rental
- `increment_vehicle_views(vehicle_id)` — view counter without granting UPDATE to anonymous users
- `get_vehicle_stats()` / `get_booking_stats()` — power the admin dashboard

**Storage buckets** (all public-read, admin/manager-write via RLS):
- `vehicle-images` (up to 10 per vehicle, 10MB each)
- `vehicle-videos` (50MB max — **not auto-trimmed**; trim clips to ~10s before uploading)
- `homepage-images` (hero background, etc.)

---

## Row Level Security summary

- **Public (anon key)** can: read vehicles, read homepage content, create bookings,
  look up/cancel a booking by reference (via RPC), read/write public storage buckets per the rules above.
- **Staff (`admin_profiles.role` = staff/manager/admin)** can: read/update all bookings, add booking notes.
- **Manager or Admin** can: create/update vehicles, update homepage content, upload media.
- **Admin only** can: delete vehicles, create/manage staff accounts.

All of this is enforced in Postgres itself — the React app has no special
privileges beyond what a logged-in Supabase Auth session grants.

---

## Getting Started

```bash
cd frontend
npm install
cp .env.example .env   # already points at the live Westcoast Automobile project
npm start
```

Runs on `http://localhost:3000`.

- Visit `/` → public site (empty until vehicles are added)
- Visit `/admin/login` → log in with the default admin account above
- Add a vehicle → upload images/video → it appears live on the public site immediately (no deploy step)

### Creating additional staff accounts

Admins can create manager/staff accounts from **Admin → Users**. Note: Supabase's
client-side `signUp` briefly switches the active browser session to the new
account before `authService.registerStaff` restores the admin's session — this
is a client-only limitation (creating auth users normally requires a service-role
key, which must never be shipped to the browser). For a large team, consider
creating accounts via the Supabase dashboard's Auth panel instead.

---

## What changed from the original MongoDB/Express version

- MongoDB/Mongoose → Postgres tables with RLS policies (see above)
- Express REST API → Supabase client calls straight from React (no backend to host)
- JWT auth you issued yourself → Supabase Auth (`admin_profiles` still tracks role)
- Cloudinary uploads (with auto video trimming) → Supabase Storage (**no automatic
  trimming** — trim video clips to ~10 seconds before upload)
- Nodemailer booking confirmation emails → **not yet re-implemented**. The
  original design used a Supabase Edge Function triggered by a Postgres webhook
  + Resend API; that's the recommended next step if email confirmations are needed.

## Suggested next steps

1. Change the default admin password.
2. If email confirmations matter, add a Postgres webhook on `bookings` insert →
   Edge Function → Resend (or similar) — ask and I can build this out.
3. Consider adding CAPTCHA (e.g. hCaptcha) to the public booking forms to deter spam,
   since anyone with the anon key can call `bookings` insert.
4. Deploy the frontend (Vercel/Netlify) — it's a static React build with no server dependency.
