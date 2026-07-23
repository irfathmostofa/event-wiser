# Smriti Box — setup

## 1. Supabase project
1. Create a project at supabase.com.
2. Open the SQL editor → run everything in `sql/schema.sql`.
3. Storage → confirm the `event-images` bucket exists (the script creates it).

## 2. Create the admin account
Dashboard → Authentication → Users → Add user:
- Email: `irfathmostofa1@gmail.com`
- Password: (set your own — don't reuse one you've typed elsewhere)

Then in the SQL editor:
```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'irfathmostofa1@gmail.com');
```

## 3. Environment variables
```
cp .env.example .env
```
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Project Settings → API.

## 4. bKash number
Open `src/pages/dashboard/tabs/PublishTab.jsx` and replace `BKASH_NUMBER` with your real number.

## 5. Run
```
npm install
npm run dev
```

## What's built
- **Auth**: register/login (Supabase Auth), profile auto-created via trigger
- **Design**: your original wine/gold palette and Bangla-supporting fonts (Tiro Bangla, Baloo Da 2, Hind Siliguri) carried through the whole app — dashboard, auth, admin, and the public page
- **Dashboard**: create events (birthday/anniversary/father's day/mother's day/valentine's/other), edit details, timeline, gallery, plus editable locked-screen text (waiting message + footer line), defaulting to your original copy
- **Image upload**: client-side compressed (max 1600px, ~0.5MB) before going to Supabase Storage, folder-per-event
- **Image limit — corrected**: 20 free images TOTAL across timeline + gallery combined, enforced by DB triggers on both tables. ৳500 covers those 20; each image beyond that is ৳50, shown as a running total on the Publish tab
- **Publish flow**: user submits bKash txn ID (৳500) → `payments` row, status `pending`
- **Admin panel** (`/admin`, admin role only): lists pending payments, a "Preview page before deciding" link that opens the event exactly as it'll look — even before payment is verified — plus one-click verify/reject. Verifying a `publish` payment atomically flips `events.is_published = true`
- **Public page** (`/e/:slug`): only resolves data when `is_published = true`, otherwise shows "not available" — reuses your birthday app's envelope/countdown/timeline/gallery/letter components and design tokens, now driven by Supabase data instead of static config

## Known gaps to close before launch
- No storage cleanup when an event/image is deleted (orphaned files in the bucket)
- No email/SMS notification to the user when their payment is verified — right now they only find out by revisiting the dashboard
- `payments.bkash_txn_id` isn't checked for uniqueness — nothing stops someone submitting the same txn ID twice; worth a unique constraint or manual admin vigilance
- Main JS bundle is ~340KB — fine for now, worth code-splitting the dashboard/admin/public routes later
