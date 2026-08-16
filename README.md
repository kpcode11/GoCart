# GoCart

A full-stack multi-vendor e-commerce marketplace built with **Next.js 15**, where sellers can open stores, list products, and accept orders — while admins oversee the platform.

---

## Features

### Shoppers
- Browse products by category or keyword search
- Add to cart and save for later
- Apply discount coupons (public, new-user, or member-exclusive)
- Checkout with **Stripe** (online) or **Cash on Delivery**
- Save multiple delivery addresses
- Track order status in real time
- Leave ratings & reviews on purchased products

### Sellers
- Apply to open a store with a custom username and branding
- Manage product listings (add, edit, toggle stock)
- Upload product images via **ImageKit**
- View store orders and revenue with an analytics chart
- Manage store profile and settings

### Admins
- Approve or reject store applications
- Toggle store active/inactive status
- Create and manage discount coupons
- Platform-wide dashboard overview

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| Auth | [Clerk](https://clerk.com/) |
| Database | [Neon](https://neon.tech/) (Serverless PostgreSQL) |
| ORM | [Prisma](https://www.prisma.io/) |
| Payments | [Stripe](https://stripe.com/) |
| Image Hosting | [ImageKit](https://imagekit.io/) |
| Background Jobs | [Inngest](https://www.inngest.com/) |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/) |
| Charts | [Recharts](https://recharts.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |

---

## Data Models

```
User ──< Rating
User ──< Address
User ──1 Store ──< Product
                  Store ──< Order ──< OrderItem
Coupon (standalone)
```

- **User** – synced from Clerk via Inngest webhooks
- **Store** – seller's shop, requires admin approval (`pending` → `approved`)
- **Product** – belongs to a store, supports multiple images
- **Order** – statuses: `ORDER_PLACED` → `PROCESSING` → `SHIPPED` → `DELIVERED`
- **Coupon** – supports `forNewUser`, `forMember`, and `isPublic` flags

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL database
- A [Clerk](https://clerk.com/) application
- A [Stripe](https://stripe.com/) account
- An [ImageKit](https://imagekit.io/) account
- An [Inngest](https://www.inngest.com/) account (or local dev server)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/gocart.git
cd gocart
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root and fill in the following:

```env
# Database (Neon)
DATABASE_URL=""
DIRECT_URL=""

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Admin (comma-separated emails)
ADMIN_EMAIL=""

# Stripe
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# ImageKit
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""
IMAGEKIT_URL_ENDPOINT=""

# Inngest
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

### 3. Set Up the Database

```bash
npx prisma migrate dev
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> For background jobs, run the Inngest dev server in a separate terminal:
> ```bash
> npx inngest-cli@latest dev
> ```

---

## Project Structure

```
gocart/
├── app/
│   ├── (public)/          # Shopper-facing pages (home, shop, cart, orders…)
│   ├── store/             # Seller dashboard pages
│   ├── admin/             # Admin panel pages
│   └── api/               # Next.js API route handlers
├── components/            # Shared UI components
├── inngest/               # Background job functions (Clerk webhook sync)
├── lib/                   # Prisma client, Redux store
├── middlewares/           # authAdmin, authSeller helpers
├── prisma/                # Prisma schema
└── configs/               # ImageKit config
```

---

## Role-Based Access

| Role | How it's determined |
|---|---|
| **Shopper** | Any signed-in Clerk user |
| **Seller** | User has an `approved` store in the database |
| **Admin** | User's email is listed in `ADMIN_EMAIL` env variable |

Access to `/store` and `/admin` routes is protected by server-side middleware (`authSeller.js` / `authAdmin.js`). Navigation links in the Navbar appear automatically based on the user's role.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Generate Prisma client + build Next.js |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

This project is private and not licensed for public distribution.

---

## Docker Setup (DevOps Level 1)

This project has been containerized using a multi-stage Dockerfile for optimized production deployments.

### Prerequisites
Ensure Docker and Docker Compose are installed on your machine.
Ensure you have a `.env` file populated with the necessary environment variables (Clerk, Neon Database, etc.).

### Build and Run with Docker CLI
```bash
docker build -t gocart:1.0 .
docker run --env-file .env -p 3000:3000 gocart:1.0
```

### Run with Docker Compose
```bash
docker compose up --build
```
The application will be accessible at `http://localhost:3000`.

---

## Jenkins CI (DevOps Level 2)

This project includes a declarative `Jenkinsfile` for Continuous Integration on every GitHub push.

### Pipeline Stages
1. **Checkout**: Pulls the latest code from GitHub.
2. **Install Dependencies**: Runs `npm ci`.
3. **Lint**: Validates code with `npm run lint`.
4. **Prisma Generate**: Generates the Prisma client.
5. **Next.js Production Build**: Ensures the application builds successfully. Requires the `.env` file injected securely to prerender pages without failing.
6. **Docker Image Build**: Re-builds the containerized application to verify the Level 1 container setup.

### Jenkins Configuration Requirements

1. **Plugins**:
   - NodeJS Plugin (Configured with an installation named `node20`).
   - Credentials Binding Plugin (For `.env` injection).
   - Docker Pipeline / Docker build capabilities.
   - Workspace Cleanup Plugin.

2. **Credentials**:
   - Create a **Secret file** credential in Jenkins.
   - Upload your production `.env` file.
   - Set the ID to `gocart-env`. The pipeline uses this to securely inject public build-time variables without committing secrets to the repo.

3. **GitHub Webhook**:
   - In your GitHub repository settings, go to **Webhooks**.
   - Add a webhook pointing to `http://<YOUR_JENKINS_URL>/github-webhook/`.
   - Select the `push` event.
   - Ensure your Jenkins Multibranch Pipeline (or standard pipeline) is configured to trigger on "GitHub hook trigger for GITScm polling".

**Note**: The current setup performs CI and verification only. The live application continues to be deployed and hosted on Vercel.
