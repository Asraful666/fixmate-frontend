# FixMate Frontend

Next.js 16 App Router frontend for FixMate, a home repair service marketplace.
The app uses BetterAuth (email/password + optional Google), JWT-protected
Express API calls, ImgBB uploads and Stripe Checkout.

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
| `/` | Landing page with featured approved services |
| `/services` | Search, category/mode filters, sorting; filters sync to the URL |
| `/services/[id]` | Service details, technician bio, booking request form |
| `/about` | How FixMate works |
| `/sign-in`, `/sign-up` | BetterAuth email/password and Google entry points |
| `/dashboard` | Redirects to the dashboard for the signed-in role |
| `/dashboard/customer` | Own bookings, cancel, Stripe payment after completion |
| `/dashboard/technician` | Service CRUD, availability, booking status pipeline |
| `/dashboard/admin` | Stats, service approvals, user roles, bookings, payments |
| `/dashboard/profile` | Name, phone, area, bio and avatar management |
| `/payment/success` | Verifies the Stripe session and shows the receipt |
| `/payment/cancel` | Safe return page when Stripe checkout is cancelled |

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
