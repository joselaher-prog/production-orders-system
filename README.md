# Production Orders System

A mini Production Orders mini-SaaS built with **Directus & NestJS backend** and **Next.js frontend**, featuring a rescheduling algorithm for managing order conflicts.

## Stack

- **Monorepo**: Yarn Workspace
- **Backend**: NestJS with TypeScript
- **Frontend**: Next.js 14 with React & Ant Design
- **Database**: Directus CMS with SQLite
- **Infrastructure**: Docker Compose

## Project Structure

```
production-orders-system/
├── apps/
│   ├── backend/          # NestJS backend with Directus integration
│   └── frontend/         # Next.js frontend with Ant Design UI
├── libs/
│   ├── types/            # Shared TypeScript types
│   └── rescheduling/     # Rescheduling algorithm & tests
├── directus/             # Directus configuration & database
├── docker-compose.yml
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** v20+
- **Yarn** v4.0+
- **Docker** & **Docker Compose**

### Installation & Running

#### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
cd production-orders-system

# Start all services
yarn docker:up

# View logs
yarn docker:logs
```

Services will be available at:
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **Directus**: http://localhost:8055 (admin/admin123)

#### Option 2: Local Development

```bash
# Install dependencies
yarn install

# Run backend
yarn workspace @po/backend dev

# In another terminal, run frontend
yarn workspace @po/frontend dev

# (Optional) Run Directus locally
docker run -d -p 8055:8055 \
  -e KEY=dev-key \
  -e SECRET=dev-secret \
  -e DB_CLIENT=sqlite3 \
  -e DB_FILENAME=/directus/database.sqlite \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=admin123 \
  directus/directus:latest
```

## Features

### Production Orders CRUD
- Create, read, update, delete Production Orders
- View all orders in a sortable table with Ant Design
- Modal form for creating/editing orders with validation

### Rescheduling Algorithm
- Automatically detects conflicting orders (same date ranges)
- Reschedules conflicts sequentially by creation date
- Preserves original order duration
- Only affects "planned" status orders

### Edge Cases Handled
1. **Overlapping dates**: Detects inclusive and adjacent date ranges
2. **Duration preservation**: Maintains the original number of days for each order
3. **Deterministic ordering**: Uses `createdAt` timestamp for consistent ordering
4. **Status updates**: Automatically marks rescheduled orders as "scheduled"
5. **Multiple conflict groups**: Handles multiple independent conflict groups

## API Endpoints

### Production Orders
- `GET /api/production-orders` - List all orders
- `GET /api/production-orders/:id` - Get single order
- `POST /api/production-orders` - Create order
- `PUT /api/production-orders/:id` - Update order
- `DELETE /api/production-orders/:id` - Delete order

### Rescheduling
- `POST /api/production-orders/reschedule/conflicts` - Reschedule all conflicts

## Domain Model

```typescript
interface ProductionOrder {
  id: string;                                    // UUID
  reference: string;                             // Required, unique identifier
  product: string;                               // Product name
  quantity: number;                              // Positive integer
  startDate: string;                             // ISO date format
  endDate: string;                               // ISO date format
  status: "planned" | "scheduled" | "in_progress" | "completed";
  createdAt: string;                             // ISO date format
}
```

## Testing

```bash
# Run rescheduling algorithm tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov
```

Tests cover:
- Date conflict detection
- Duration calculation
- Conflict grouping
- Sequential rescheduling
- Edge cases (same-day orders, multiple conflicts, ordering)

## Development

### Adding Dependencies

```bash
# To root workspace
yarn add -W <package>

# To specific workspace
yarn workspace @po/backend add <package>
yarn workspace @po/frontend add <package>
```

### Type Safety

All frontend-backend communication is type-safe using shared types from `@po/types` package.

## Docker Compose Services

| Service  | Port | Purpose |
|----------|------|---------|
| Frontend | 3001 | Next.js dev server |
| Backend  | 3000 | NestJS API |
| Directus | 8055 | Headless CMS & Database |

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:8055 | xargs kill -9
```

### Clear Dependencies
```bash
# Remove all node_modules and reinstall
yarn docker:down
rm -rf node_modules apps/*/node_modules libs/*/node_modules
yarn install
```

### Database Issues
```bash
# Reset Directus database
rm -rf directus/database/database.sqlite
yarn docker:down
yarn docker:up
```

## Rescheduling Algorithm Explanation

The algorithm works in two phases:

1. **Conflict Detection**: Finds all groups of 2+ "planned" orders with overlapping date ranges.
   - Uses inclusive date comparison: `start1 <= end2 && start2 <= end1`
   - Groups orders that conflict with each other

2. **Sequential Rescheduling**: For each conflict group:
   - Sorts orders by `createdAt` (ascending) for deterministic ordering
   - Places first order at its original start date
   - Places each subsequent order immediately after the previous one ends
   - Preserves the original duration (e.g., 5-day order remains 5 days)
   - Updates status to "scheduled"

### Example

**Before:**
- Order A: 2024-01-01 to 2024-01-05 (createdAt: 2024-01-01)
- Order B: 2024-01-03 to 2024-01-10 (createdAt: 2024-01-02)

**After Rescheduling:**
- Order A: 2024-01-01 to 2024-01-05 (unchanged - keeps original date)
- Order B: 2024-01-06 to 2024-01-12 (moved to start after A ends)

## Submission Checklist

- [x] Monorepo with Yarn workspaces
- [x] NestJS backend with custom rescheduling library
- [x] Directus CMS with SQLite integration
- [x] Next.js frontend with Ant Design UI
- [x] CRUD operations for Production Orders
- [x] Rescheduling conflicts endpoint
- [x] Tests for rescheduling algorithm
- [x] Docker Compose for easy setup
- [x] Type-safe API client
- [x] Loading/error states in UI
- [x] README with instructions

## License

MIT
