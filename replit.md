# FinVault Project Documentation

## Architecture

- **Shared**: Drizzle schema and Zod route definitions at `shared/`.
- **Server**: Express app with a central `registerRoutes` function. Storage layer abstracts DB operations.
- **Client**: React SPA using `wouter` for routing and `tanstack-query` for data fetching.

## Intentional Technical Debt (For Hackathon)

1. **Race Condition**: `server/routes.ts` -> `app.post("/api/transfers", ...)`
   - Uses `setTimeout` to simulate latency.
   - Lacks row-level locking.
2. **N+1 Performance**: `server/routes.ts` -> `app.get("/api/accounts/:accountId/transactions", ...)`
   - Fetches category in a loop.
3. **Plain-text Passwords**: For the sake of the hackathon demo, passwords are currently compared in plain text. (A "security audit" challenge could involve fixing this with `bcrypt`).

## Endpoints

- `POST /api/auth/register`: User registration.
- `POST /api/auth/login`: User login (returns JWT).
- `GET /api/accounts`: List user accounts.
- `GET /api/accounts/:id`: Get account details.
- `GET /api/accounts/:accountId/transactions`: List transactions (N+1 implementation).
- `POST /api/transfers`: Create transfer (Race condition implementation).
- `GET /api/budgets`: List user budgets.
- `POST /api/budgets`: Create budget.
- `GET /api/categories`: List transaction categories.
