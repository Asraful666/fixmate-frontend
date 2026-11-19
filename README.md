# FixMate — Smart Device & Home Appliance Repair Service Platform

FixMate is a full-stack, role-based repair service booking platform. Customers
browse approved services, send repair requests, track each job and pay online
only after the technician completes the work. Technicians publish and manage
services and move each job through a status pipeline. Admins approve services,
manage users and review bookings and Stripe transactions.

## Live Site

- Frontend: `https://fixmate-frontend.vercel.app` **(replace with your deployed URL)**
- Backend API: `https://fixmate-api.onrender.com/api` **(replace with your deployed URL)**
- Local frontend: `http://localhost:3000`
- Local API: `http://localhost:5000`

> The live URL above is a placeholder. Deploy both apps and replace it before
> submitting the assignment.

## Admin Credentials

| Email | Password | Role |
|---|---|---|
| `admin@fixmate.test` | `Demo@1234` | Admin |

Other seeded accounts (same password): `customer@fixmate.test` (customer),
`rahim@fixmate.test` and `karim@fixmate.test` (technicians).

## Key Features

- BetterAuth email/password auth with customer / technician roles, JWT bridge
  to Express, Google login option, and role-protected dashboard routes.
- Landing page with 6 latest approved services, 4-step "How FixMate Works",
  popular categories and trust points.
- Browse services with server-side search, category/mode filters and sorting,
  all persisted in the URL.
- Service details with technician profile and a role-restricted repair request
  form (read-only name/email, phone, address, preferred date, 20+ character
  problem description, duplicate-request protection).
- Customer dashboard: overview stats and chart, My Bookings with cancel
  confirmation (requested only) and Stripe Pay Now (completed + unpaid),
  payment history.
- Technician dashboard: overview stats and chart, add service with ImgBB image
  upload, full service CRUD with availability toggle, request pipeline
  (Accept / Reject / Start Work / Mark Completed with final amount modal).
- Admin dashboard: overview stats and charts, user role management, service
  approval, read-only bookings, transactions with total revenue.
- Shared profile page with photo upload; name/photo update in the top bar
  without re-login.
- Stripe Checkout in test mode with idempotent payment recording and a verified
  webhook. Payment is gated to completed, unpaid bookings.
- Responsive dashboard with collapsible sidebar, top bar avatar/name/role,
  consistent status badge colours, toasts, confirmation modals, empty states,
  loading skeletons, custom 404 and error pages.

## npm Packages Used

- `next`, `react`, `react-dom`
- `better-auth`, `@better-auth/mongo-adapter`, `mongodb`, `jose`
- `sonner` (toasts)
- `tailwindcss`, `@tailwindcss/turbopack` (styling)
- `eslint`, `eslint-config-next` (linting)

## Tech Stack

- Next.js 16 App Router (JavaScript, no TypeScript)
- Tailwind CSS v4
- BetterAuth React client + JWT plugin
- Sonner toasts
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

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with 6 latest approved services and how-it-works sections |
| `/services` | Server-side search, category/mode filters and sorting; filters sync to the URL |
| `/services/[id]` | Service details, technician profile, repair request form |
| `/about` | How FixMate works |
| `/sign-in`, `/sign-up` | BetterAuth email/password and Google entry points (logged-in users redirect to their dashboard) |
| `/dashboard` | Redirects to the dashboard for the signed-in role |
| `/dashboard/customer` | Overview stats, chart and recent requests |
| `/dashboard/customer/bookings` | My Bookings: cancel requested jobs, pay completed jobs |
| `/dashboard/customer/payments` | Payment history (service, technician, amount, transaction, date) |
| `/dashboard/technician` | Overview stats, chart and latest requests |
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

| Email | Role |
|---|---|
| `admin@fixmate.test` | admin |
| `customer@fixmate.test` | customer |
| `rahim@fixmate.test` | technician |
| `karim@fixmate.test` | technician |

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

- [ ] Deploy the Express API first and confirm `/api/health`.
- [ ] Create `.env.local` on Vercel/host with every variable above.
- [ ] Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the deployed domain.
- [ ] Set `NEXT_PUBLIC_API_URL` to `https://<api-host>/api`.
- [ ] Set the backend `CLIENT_URL` to this frontend domain for CORS and Stripe
      redirects.
- [ ] Add the production domain to BetterAuth `trustedOrigins` via
      `BETTER_AUTH_URL`.
- [ ] Add the Stripe webhook in the Stripe dashboard and set
      `STRIPE_WEBHOOK_SECRET` on the backend.
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
