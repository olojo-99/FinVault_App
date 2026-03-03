***

# FinVault Hackathon Project

Welcome to the **FinVault** Hackathon! FinVault is a **production‑style personal finance and banking web app**. It looks polished and realistic, but it hides a small number of **deep technical issues** and **incomplete features**. Your job is to:

- Find and fix the core issues.
- Implement the missing features.
- Use the tests, logs, and your tools (including AI) as part of your debugging process.

***

## 1. Project Overview

### Tech Stack

**Frontend**

- React
- Tailwind CSS
- shadcn/ui component primitives
- Framer Motion (for subtle motion/animation)
- Recharts (for data visualization)
- SPA routing with `wouter`
- Data fetching with `@tanstack/react-query`

**Backend**

- Node.js
- Express
- PostgreSQL (Replit provisions this automatically)
- Drizzle ORM for schema & queries
- Shared type definitions and validation using Zod in `shared/`

**Authentication**

- JWT‑based authentication
- Tokens stored in `localStorage`
- Simple auth middleware in Express to protect API routes

The result is a **full‑stack app** that feels like a modern fintech product: users log in, see realistic seeded data, move money, and view their finances.

***

## 2. High‑Level Architecture

- **Shared (`shared/`)**
  - Drizzle schema: definitions for `users`, `accounts`, `transactions`, `categories`, `budgets`, etc.
  - Zod schemas and shared types for request/response shapes.

- **Server (`server/`)**
  - Express application with a central `registerRoutes` function (e.g. in `server/routes.ts`).
  - A storage/service layer that wraps Drizzle for database access.
  - Seed script (`server/seed.ts`) to populate demo users, accounts, and transactions.

- **Client (`client/`)**
  - React SPA.
  - Route structure: e.g. `/dashboard`, `/accounts/:id`, `/transactions`, `/analytics`, `/savings`.
  - Layout components (sidebar, topbar) using Tailwind + shadcn.
  - Forms, tables, and charts using Tailwind, shadcn, and Recharts.

***

## 3. What Works Out of the Box

When you start FinVault, you get:

- **Authentication**
  - `POST /api/auth/register`: Create a new user.
  - `POST /api/auth/login`: Log in, receive a JWT, store in `localStorage`.
  - Frontend login form and protected routes.

- **Accounts & Dashboard**
  - `GET /api/accounts`: List of user accounts (current, savings, credit).
  - `GET /api/accounts/:id`: Details for a single account.
  - Dashboard showing balances, account cards, and an overview of recent activity.

- **Transactions**
  - `GET /api/accounts/:accountId/transactions`: List of transactions for that account.
  - Transactions have categories (groceries, salary, transport, etc.), amounts, dates, and descriptions.
  - A transactions page where users can browse their history.

- **Budgets**
  - `GET /api/budgets`: List budgets per user, with monthly limits.
  - `POST /api/budgets`: Create a new budget.
  - Frontend budgets page showing category budgets with progress.

- **Categories**
  - `GET /api/categories`: List all categories used for transactions and budgets.

The UI is **visually polished** with Tailwind + shadcn, transitions and small animations via Framer Motion, and card‑style layouts for balances, budgets, and histories.

***

## 4. Core Issues to Fix (Built‑in Bug Challenges)

Three issues are deliberately built into the backend. These are **not** obvious syntax errors; they’re realistic problems around **concurrency**, **performance**, and **security**. Each one is tied to concrete code in `server/routes.ts` and to how the frontend behaves under real usage.

### 🐛 Bug 1: Race Condition on Fund Transfer

**Summary**

Concurrent fund transfers can push account balances below zero, even when the UI and backend appear to enforce “no overdrafts”. This is caused by a race condition in how the transfer logic checks and updates balances.

**Location**

- `server/routes.ts`
  - Endpoint: `POST /api/transfers`

**Technical Detail**

- The transfer handler roughly does:
  1. Fetch source account.
  2. Check `balance >= amount`.
  3. Use `setTimeout` (or equivalent artificial delay) to simulate latency.
  4. Subtract the amount and update the account row.
- When multiple requests hit the endpoint at the same time, they all:
  - Read the same initial balance.
  - Pass the `balance >= amount` check.
  - Then, after the delay, all subtract from the original balance.

This is a classic “check‑then‑act” race condition. There is **no row‑level locking** or atomicity guaranteeing that only one transfer can modify an account’s balance at a time. [hackerone](https://www.hackerone.com/blog/how-race-condition-vulnerability-could-cast-multiple-votes)

**What you need to do**

- Analyze how concurrent requests interleave and reproduce the issue (e.g. send many transfers in parallel from the UI or a script).
- Fix the transfer logic to be **atomic**:
  - Use a **database transaction**.
  - Use `SELECT ... FOR UPDATE` row‑level locking for the source (and destination) account, or
  - Use an **atomic UPDATE** (e.g. `UPDATE accounts SET balance = balance - :amount WHERE id = :id AND balance >= :amount`) and check affected rows.
- Ensure that:
  - The final balance never goes below zero.
  - Only the correct number of transfers succeed given the starting balance.

This bug introduces participants to real‑world **concurrency control** in financial systems. [yeswehack](https://www.yeswehack.com/learn-bug-bounty/ultimate-guide-race-condition-vulnerabilities)

***

### 🐛 Bug 2: N+1 Query Performance Issue on Transactions

**Summary**

The transaction history endpoint and page are fast with a handful of records, but quickly become sluggish as the number of transactions grows. This is due to an N+1 query pattern in how categories are loaded. [oneuptime](https://oneuptime.com/blog/post/2026-01-27-sqlalchemy-fastapi/view)

**Location**

- `server/routes.ts`
  - Endpoint: `GET /api/accounts/:accountId/transactions`

**Technical Detail**

- Current pattern:
  - First query: get all transactions for an account.
  - For each transaction in a loop, issue **another** query to fetch its category (e.g. `SELECT * FROM categories WHERE id = ...`).
- Result:
  - 1 query for the transactions + 1 query per transaction.
  - For 500 transactions, ~501 queries are executed.
- As data volume grows, the endpoint response time rises sharply. The React transaction list (and any chart based on it) becomes slow.

This is the classic **N+1 queries** problem: one query to get a list, and then one extra query per item in that list. [oneuptime](https://oneuptime.com/blog/post/2026-01-27-sqlalchemy-fastapi/view)

**What you need to do**

- Confirm the N+1 pattern by:
  - Logging SQL queries.
  - Measuring response times for accounts with many transactions.
- Fix the problem by:
  - Rewriting the query to use a **JOIN** between transactions and categories, or
  - Using a Drizzle pattern that fetches transactions and their related category data in a single query.
- Optionally:
  - Add pagination (`limit`/`offset`) to the endpoint to avoid loading unbounded data.
  - Ensure proper indexing on `transactions.accountId` and `transactions.categoryId`.

After the fix, the transaction list endpoint should use only a small number of queries and respond quickly even with hundreds of transactions.

***

### 🐛 Bug 3: JWT Security & Middleware Hardening

**Summary**

Authentication works, but the JWT handling is intentionally simplified and doesn’t fully cover security best practices. This is an implicit challenge to harden the auth layer.

**Location**

- `server/routes.ts`
  - Auth routes (e.g. `POST /api/auth/login`)
  - JWT verification / middleware (e.g. an `authMiddleware` function)

**Current Issues**

Depending on how the boilerplate is shipped, the following may apply:

- **No token blacklist / logout handling**:
  - Logging out on the frontend only removes tokens from `localStorage`.
  - The backend will still accept a valid JWT until it expires.
  - There is no persistence of revoked tokens.
- **Minimal validation**:
  - Middleware may only decode the token and trust its claims without additional checks (like token type, issue time, or rotation).
- **Password storage** (intentional technical debt):
  - Passwords might be stored and compared in plain text for demo purposes.
  - This is explicitly marked as “technical debt” to be addressed with `bcrypt` or a similar hashing library.

**What you need to do**

- Harden the auth flow by:
  - Introducing **password hashing** (e.g. `bcrypt`):
    - Hash on registration.
    - Verify on login.
  - Designing a **logout / token revocation** scheme, for example:
    - Store a list of revoked tokens or token IDs (e.g. in a `revoked_tokens` table).
    - Reject requests with revoked tokens even if they are cryptographically valid.
  - Tightening middleware:
    - Validate token signature, expiry, and audience/issuer if configured.
    - Make sure critical routes are always behind the middleware.

This gives participants a way to think about **practical security** and authentication robustness, not just “making it work”.

***

## 5. Feature Implementations (Stubs to Build)

In addition to fixing issues, there are two feature areas that are intentionally **stubbed**: the UI exists or is scaffolded, but the backend and data flow need to be implemented.

### 🚀 Feature 1: Financial Analytics Dashboard

**Goal**

Build a meaningful analytics experience that shows how users are spending their money over time and across categories.

**Current State**

- Route: `/analytics` in the frontend.
- UI:
  - React page using Tailwind + shadcn layout.
  - Placeholder Recharts components with “Coming Soon” or stubbed data.
  - Date range or preset filters (e.g. last 30 days, last 3 months).
- Backend:
  - No dedicated analytics endpoints yet, or they return dummy data.

**What you need to implement**

1. **Backend analytics endpoints** (for example):
   - `GET /api/analytics/spending-by-category`
     - Aggregates debit transactions by category for the current user.
     - Returns data suitable for a pie/donut chart (name, total, color).
   - `GET /api/analytics/monthly-trends`
     - Returns a time series of income vs expenses per month.
   - Optionally, `GET /api/analytics/budget-vs-actual`
     - Combines budget information with actual spend.

2. **Frontend integration**:
   - Use `react-query` to fetch analytics data.
   - Feed the data into Recharts components:
     - Donut or pie chart for category spending.
     - Line or bar chart for monthly trends.
   - Add loading states and error states.

By the end, the Analytics page should show **real charts** based on the seeded transactions.

***

### 🚀 Feature 2: Savings Goals

**Goal**

Allow users to set savings goals (e.g. “Emergency Fund”, “Trip to Japan”), track their progress, and optionally link them to specific accounts.

**Current State**

- Route: `/savings` in the frontend.
- UI:
  - Page layout exists.
  - Either placeholders (“Coming Soon”) or hard‑coded example goals.
- Backend:
  - No `savings_goals` table yet.
  - No endpoints for creating or updating goals.

**What you need to implement**

1. **Database schema**
   - Add a `savings_goals` table to the Drizzle schema (in `shared/`), e.g.:
     - `id` (PK)
     - `userId` (FK to users)
     - `name`
     - `targetAmount`
     - `currentAmount`
     - `deadline` (nullable)
     - `createdAt`
   - Optionally, a `savings_contributions` table for detailed history.

2. **Backend API routes**
   - `POST /api/savings/goals` — create a new goal.
   - `GET /api/savings/goals` — list goals for the current user with progress.
   - `POST /api/savings/goals/:id/contributions` — add a contribution to a goal.
   - `PUT /api/savings/goals/:id` — edit goal details.
   - `DELETE /api/savings/goals/:id` — archive or delete a goal.

3. **Frontend integration**
   - Hook up the `/savings` page to call these APIs.
   - Show goals as cards with progress bars (e.g. current / target).
   - Provide forms/modals to create goals and add contributions.
   - Reflect changes immediately using `react-query` invalidation or similar.

This feature exercises data modeling, migrations, and full CRUD flows.

***

## 6. Running the Project

### Environment Setup

1. **Database**
   - Ensure a PostgreSQL instance is available.
   - On Replit, PostgreSQL is provisioned automatically; use the URI from secrets or the provided environment variable.

2. **Secrets**
   - Set `SESSION_SECRET` (or `JWT_SECRET`) in your environment variables or Replit Secrets.
   - Ensure your database connection URL is configured (e.g. `DATABASE_URL`).

### Commands

From the project root:

```bash
# 1. Install dependencies
npm install

# 2. Apply schema to the database (Drizzle push or equivalent)
npm run db:push

# 3. Seed data
npx tsx server/seed.ts

# 4. Start the app
npm run dev
```

The app will start (commonly on `http://localhost:3000` or similar; check the script) with both client and server wired up.

### Default Credentials

Seed script creates multiple demo users, including:

- `alice@finvault.io` / `demo1234`

You can also use any of the other seeded users documented in the project.

***

## 7. Endpoints Summary

Commonly used endpoints (may vary slightly by implementation):

- `POST /api/auth/register` — register a user.
- `POST /api/auth/login` — login, returns JWT.
- `GET /api/accounts` — list accounts for the current user.
- `GET /api/accounts/:id` — get details of an account.
- `GET /api/accounts/:accountId/transactions` — list transactions (currently N+1).
- `POST /api/transfers` — create a transfer (contains race condition logic).
- `GET /api/budgets` — list budgets.
- `POST /api/budgets` — create a budget.
- `GET /api/categories` — list transaction categories.
- (To be added) `/api/analytics/*` — analytics endpoints.
- (To be added) `/api/savings/*` — savings goals endpoints.

***
