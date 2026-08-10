# SPUN — Custom Clothes Shop (Next.js)

Full-stack e-commerce site for a Gen Z custom clothing brand, now on **Next.js** (App Router). Browse products, design your own print with a live canvas tool, cart, checkout, order tracking, accounts, a **Contact form**, and an admin dashboard — all in one Next.js app.

## What changed from the previous (Vite + Express) version

- **One framework instead of two.** The old setup had a separate Express API server and a Vite React frontend. Everything now lives in a single Next.js app: pages are React Client Components under `src/app/`, and the API is built from Next.js **Route Handlers** under `src/app/api/`.
- **No more Multer.** File uploads (for the design tool's custom graphics) now use the Web-standard `request.formData()` / `File` API that Route Handlers support natively.
- **New: Contact page.** A `/contact` page with a form (name, email, subject, message) posts to `POST /api/contact`, stored in a new `contact_messages` table. Admins can view, mark read/replied, or reply by email from `/admin/messages` — and the admin dashboard flags new messages.
- Same SQLite database, same design system, same Design Studio canvas tool, same auth/cart/checkout logic underneath — just re-homed into Next.js's routing and request/response conventions.

## Running it locally

You'll need [Node.js](https://nodejs.org) (v18.18 or newer).

```bash
npm install
npm run seed     # creates spun.db with demo products + admin account
npm run build      # production build
npm start            # runs on http://localhost:3000
```

Or for local development with hot reload:

```bash
npm install
npm run seed
npm run dev         # runs on http://localhost:3000
```

Open **http://localhost:3000**.

### Demo admin login
- Email: `admin@spun.shop`
- Password: `admin1234`

Visit `/admin` after logging in as admin — includes the new **Messages** tab for contact form submissions.

## What's mocked / what you'll need for production

- **Payments**: no real money moves. ABA QR / ACLEDA / Visa / MasterCard / COD are all selectable at checkout, but there's no live payment gateway wired in — see `src/app/api/orders/checkout/route.js` for where to plug in real gateway calls.
- **Contact form emails**: submissions are stored in the database and viewable in `/admin/messages`; there's no outbound email sending. To notify yourself automatically, add an email service call (e.g. Resend, SendGrid) inside `src/app/api/contact/route.js`.
- **Product photos**: `nav_img.jpg` carries an Unsplash+ watermark (licensed stock) — swap in your own photography before going live.

## Deploying

This is a single Next.js app, which deploys cleanly to **Vercel** (the simplest option, since it's built by the Next.js team) or any Node host (Render, Railway, Fly.io):

1. Push this repo to GitHub.
2. On Vercel: import the repo, it auto-detects Next.js — no build/start commands to configure.
3. On Render/Railway: set build command to `npm install && npm run build`, start command to `npm start`.
4. Add an environment variable `JWT_SECRET` set to a long random string.
5. After the first deploy, run `npm run seed` once via the host's shell/console to create demo data.

**Note on SQLite**: it's a single file (`spun.db`) written to disk. Vercel's serverless functions have a read-only filesystem except `/tmp`, which is wiped between invocations — so **SQLite will not persist on Vercel**. For a Vercel deployment, swap `src/lib/db.js` for a hosted database (e.g. Vercel Postgres, Turso, or Neon). Render/Railway with a persistent disk will keep SQLite working as-is, though it still resets on redeploy unless you attach a persistent volume.

## Project structure

```
spun-next/
├── src/
│   ├── app/
│   │   ├── layout.js            Root layout: fonts, providers, navbar, footer
│   │   ├── page.js                Home
│   │   ├── products/              Product listing + [slug] detail (with Design Studio)
│   │   ├── cart/, checkout/       Cart and checkout (payment method selection)
│   │   ├── contact/                 Contact form page (new)
│   │   ├── login/, register/      Auth pages
│   │   ├── account/                Profile + order history (protected)
│   │   ├── admin/                    Dashboard, Products, Orders, Customers, Messages (protected)
│   │   └── api/                        Route Handlers: auth, products, cart, orders, admin, upload, contact
│   ├── lib/                          db.js (schema), auth.js (JWT), api.js (client fetch wrapper), withApi.js (error handling)
│   ├── components/               Navbar, Footer, ProductCard, DesignCanvas, ProtectedRoute
│   └── context/                    AuthContext, CartContext (client-side state)
├── public/img/                    Product images
└── public/uploads/               User-uploaded design graphics land here
```
