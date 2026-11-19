# FixMate — Smart Device & Home Appliance Repair Service Platform

FixMate is a full-stack, role-based repair service booking platform. Customers
browse approved services, send repair requests, track each job and pay online
only after the technician completes the work. Technicians publish and manage
services and move each job through a status pipeline. Admins approve services,
manage users and review bookings and Stripe transactions.

## Live Site

- Frontend: https://fixmate-frontend-blond.vercel.app
- Backend API: https://fixmate-backend-taupe.vercel.app/api
- Health check: https://fixmate-backend-taupe.vercel.app/api/health
- Local frontend: `http://localhost:3000`
- Local API: `http://localhost:5000`

> Both apps are deployed on Vercel. The Express API runs as a serverless
> function (`fixmate-backend/api/index.js` + `vercel.json`) and connects to the
> same MongoDB database as the frontend.
>
> Before the demo, add
> `https://fixmate-frontend-blond.vercel.app/api/auth/callback/google` to the
> Google OAuth client's authorized redirect URIs, or Google sign-in will stop
> with `redirect_uri_mismatch`.
>
> `IMGBB_API_KEY` and the Stripe keys must be valid in the Vercel project
> settings for image uploads and online payment to work in the live demo.

## Repositories

- Frontend: https://github.com/Asraful666/fixmate-frontend
- Backend: https://github.com/Asraful666/fixmate-backend

## Admin Credentials

| Email | Password | Role |
|---|---|---|
| `admin@fixmate.test` | `Demo@1234` | Admin |

Other seeded accounts (same password): `customer@fixmate.test` (customer),
`rahim@fixmate.test` and `karim@fixmate.test` (technicians).

## Key Features

- BetterAuth email/password auth with customer / technician roles, JWT bridge
  to Express, Google login (a Google user becomes a `customer` by default), and
  role-protected dashboard routes.
- Landing page with 6 latest approved services, 4-step "How FixMate Works",
  popular categories and trust points.
- Browse services with server-side search, category/mode filters, sorting and
  **server-side pagination** (Previous / page numbers / Next), all persisted in
  the URL. Cards show the average star rating and a **Verified Pro** badge.
- Service details with technician profile, review average and the latest
  customer reviews, plus a role-restricted repair request form (read-only
  name/email, phone, address, preferred date, 20+ character problem
  description, duplicate-request protection).
- Customer dashboard: overview stats and chart, My Bookings with cancel
  confirmation (requested only), a visual job timeline
  Requested → Accepted → In Progress → Completed → Paid, Stripe Pay Now
  (completed + unpaid), star review after payment and a **PDF invoice**
  download for paid jobs, plus payment history with invoices.
- Technician dashboard: overview stats and chart, **Free / Pro plan card**
  (free = 3 listings, Pro = unlimited + Verified Pro badge via Stripe), add
  service with ImgBB image upload, full service CRUD with availability toggle,
  request pipeline (Accept / Reject / Start Work / Mark Completed).
- Admin dashboard: overview stats and charts, user role management, service
  approval, read-only bookings, transactions with total revenue.
- Shared profile page with photo upload; name/photo update in the top bar
  without re-login.
- **Dark / light theme toggle** on public pages and dashboards, saved in
  `localStorage` and applied before first paint.
- Stripe Checkout in test mode with idempotent payment recording and a verified
  webhook. Payment is gated to completed, unpaid bookings.
- Responsive dashboard with collapsible sidebar, top bar avatar/name/role,
  consistent status badge colours, toasts, confirmation modals, empty states,
  loading skeletons, custom 404 and error pages.

## npm Packages Used

- `next`, `react`, `react-dom`
- `better-auth`, `@better-auth/mongo-adapter`, `mongodb`, `jose`
- `sonner` (toasts)
- `jspdf` (PDF invoice download)
- `tailwindcss`, `@tailwindcss/turbopack` (styling)
- `eslint`, `eslint-config-next` (linting)

## Tech Stack

- Next.js 16 App Router (JavaScript, no TypeScript)
- Tailwind CSS v4
- BetterAuth React client + JWT plugin
- Sonner toasts
- jsPDF invoices
- Express API at `http://localhost:5000/api`
- Stripe Checkout (test mode)
- ImgBB for avatar and service images

## Quick Start

Both servers must run for service pages and dashboards.

```bash
# terminal 1
cd fixmate-backend
npm install
npm run seed
npm run dev

# terminal 2
cd fixmate-frontend
npm install
copy .env.local.example .env.local
# fill in the values
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` from `.env.local.example`:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | Same MongoDB database as the backend |
| `DB_NAME` | Yes | Database name |
| `BETTER_AUTH_URL` | Yes | Public app URL, e.g. `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Yes | Long random secret for BetterAuth |
| `IMGBB_API_KEY` | Uploads | ImgBB API key for avatar/service images |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Browser-facing app URL |
| `NEXT_PUBLIC_API_URL` | Yes | Express API base URL ending in `/api` |

> `BETTER_AUTH_URL` must be identical in the frontend and backend. The backend
> verifies the JWT issuer/audience against it.

> Service and profile images are uploaded through ImgBB, so `IMGBB_API_KEY`
> must be a valid key from api.imgbb.com before the demo.

### Google OAuth setup (optional)

1. Create an OAuth 2.0 Client ID (Web application) in Google Cloud Console.
2. Add `http://localhost:3000/api/auth/callback/google` as an Authorized
   redirect URI (and the deployed `https://<domain>/api/auth/callback/google`
   for production).
3. Put the client ID/secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   and restart `npm run dev`.
4. "Continue with Google" on `/sign-in` and `/sign-up` then works; Google users
   are created with the `customer` role and `free` plan.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with 6 latest approved services and how-it-works sections |
| `/services` | Server-side search, filters, sorting and pagination; filters sync to the URL |
| `/services/[id]` | Service details, rating summary, reviews, technician profile, repair request form |
| `/about` | How FixMate works |
| `/sign-in`, `/sign-up` | BetterAuth email/password and Google entry points (logged-in users redirect to their dashboard) |
| `/dashboard` | Redirects to the dashboard for the signed-in role |
| `/dashboard/customer` | Overview stats, chart and recent requests |
| `/dashboard/customer/bookings` | My Bookings: job timeline, cancel requested jobs, pay, review paid jobs, PDF invoice |
| `/dashboard/customer/payments` | Payment history with a PDF invoice button |
| `/dashboard/technician` | Overview stats, chart, Free/Pro plan card and latest requests |
| `/dashboard/technician/add-service` | Validated add-service form with ImgBB upload |
| `/dashboard/technician/my-services` | Service CRUD, approval badges and availability toggle |
| `/dashboard/technician/requests` | Request pipeline with Accept / Reject / Start / Complete |
| `/dashboard/admin` | Overview stats and charts |
| `/dashboard/admin/users` | User list with role management |
| `/dashboard/admin/services` | Service approval (pending first by default) |
| `/dashboard/admin/bookings` | Read-only booking table with status filter |
| `/dashboard/admin/transactions` | Payment table with total revenue |
| `/dashboard/profile` | Name, phone, area, bio and avatar management (all roles) |
| `/payment/success` | Verifies the Stripe session and shows the receipt |
| `/payment/cancel` | Safe return page with a Try Again button |

## Demo Accounts

Run `npm run seed` in the backend first. All demo accounts use `Demo@1234`.

| Email | Role | Plan |
|---|---|---|
| `admin@fixmate.test` | admin | free |
| `customer@fixmate.test` | customer | free |
| `rahim@fixmate.test` | technician | pro |
| `karim@fixmate.test` | technician | free |

## Authentication Flow

1. BetterAuth stores the session cookie.
2. `src/lib/api.js` fetches a signed JWT from `/api/auth/token` and caches it.
3. Protected Express requests send `Authorization: Bearer <token>`.
4. Express verifies the signature against `/api/auth/jwks` and reloads the
   user role from MongoDB.
5. `apiFetch` clears the cached token on a 401 response.

## Admin Rules

- Admin is not selectable on the public sign-up page.
- New sign-ups are limited to customer or technician.
- Only an admin can change roles, via the admin dashboard.
- Admins cannot change their own role from the UI.

## Build and Lint

```bash
npm run lint
npm run build
```

`<img>` warnings are expected because remote ImgBB/Unsplash URLs are rendered
with plain image tags; `next.config.mjs` does not define `images.remotePatterns`.

## Production Deployment Checklist

- [x] Deploy the Express API first and confirm `/api/health`.
- [x] Add every variable above to the Vercel project (production environment).
- [x] Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the deployed domain.
- [x] Set `NEXT_PUBLIC_API_URL` to `https://fixmate-backend-taupe.vercel.app/api`.
- [x] Set the backend `CLIENT_URL` to this frontend domain for CORS and Stripe
      redirects.
- [x] Add the production domain to BetterAuth `trustedOrigins` via
      `BETTER_AUTH_URL`.
- [ ] Add the production redirect URI in the Google Cloud console (Google login).
- [ ] Add the Stripe webhook in the Stripe dashboard and set
      `STRIPE_WEBHOOK_SECRET` on the backend.
- [ ] Replace `IMGBB_API_KEY` with a valid key so image uploads work.
- [ ] Keep Stripe in test mode for the assignment demo.
- [ ] Verify sign-up, sign-in, Google (if configured), booking, status updates
      and a test payment end to end.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
