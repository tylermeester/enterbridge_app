# EnterBridge Procurement App

A lightweight full-stack procurement application that proxies an external pricing API, stores internal orders locally, and provides a clean UI for browsing products and managing orders.

## Tech Stack

- **Backend:** ASP.NET Core 8.0, Entity Framework Core, SQLite, Minimal APIs
- **Frontend:** React 18, TypeScript, Vite, React Router
- **Database:** SQLite (auto-seeded on first run)

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (v16 or later) – [Download](https://nodejs.org/)
- **.NET SDK 8.0** – [Download](https://dotnet.microsoft.com/download/dotnet/8.0)

Verify installations:
```bash
node --version
npm --version
dotnet --version
```

## Project Structure

```
enterbridge_app/
├── EnterBridge.Api/          # .NET Core backend
│   ├── Program.cs
│   ├── OrderEndpoints.cs
│   ├── ExternalEndpoints.cs
│   ├── Data/
│   ├── Models/
│   ├── ExternalApi/
│   └── appsettings.json
├── enterbridge-ui/           # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/enterbridge_app.git
cd enterbridge_app
```

### 2. Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd EnterBridge.Api
dotnet run
```

The backend will:
- Start on `http://localhost:5121`
- Auto-create the SQLite database (`enterbridge.db`)
- Seed the database with 17 test orders

You should see output like:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5121
```

### 3. Start the Frontend

Open a **new terminal** and navigate to the frontend directory:

```bash
cd enterbridge-ui
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is in use).

### 4. Open the App

Navigate to `http://localhost:5173` in your browser. You should see:
- A navigation bar with Products, Place Order, and Order History links
- The app is ready to use!

## Features

### Products Page
- Browse all available products from the external API
- Products grouped by category
- View latest pricing for each product

### Place Order Page
- Select products and quantities
- Auto-populated product details (name, ID, SKU, unit, price)
- Live line and order totals
- Place orders that persist to the local database

### Order History Page
- View all placed orders sorted newest first
- Expandable order details showing all line items
- Order metadata: creator, timestamp, total price

## API Endpoints

### Products & Pricing
- `GET /api/products` – List products (paginated, with filters)
- `GET /api/products/{id}` – Get a single product
- `GET /api/prices/history/{productId}` – Get price history for a product

### Orders
- `GET /api/orders` – List all local orders
- `GET /api/orders/{id}` – Get a single order
- `POST /api/orders` – Create a new order

## Database

The app uses SQLite with automatic seeding:

### Reset the Database

If you want to reset to a clean state with fresh seed data:

```bash
# Kill the backend if running
# Then delete the database file
rm -f EnterBridge.Api/enterbridge.db*

# Restart the backend
cd EnterBridge.Api
dotnet run
```

The database will be recreated and seeded with 17 test orders.

### Database Location

The SQLite database file is stored at:
```
EnterBridge.Api/enterbridge.db
```

## Architecture Highlights

### Backend Proxy Layer
The frontend never calls the external vendor API directly. Instead:
1. Frontend calls local backend endpoints
2. Backend proxies requests to the external API
3. Backend normalizes and aggregates responses
4. Frontend receives clean, typed data

**Benefits:**
- Hides vendor API complexity from UI
- Centralizes error handling and pagination
- Enables easy vendor swaps in the future

### Data Separation
- **External Data:** Products and pricing (from vendor API)
- **Internal Data:** Orders and order lines (in local SQLite)

This keeps the local database focused on app-owned transactional data while treating vendor catalog as reference data.

### Price Snapshots
When an order is placed, a price snapshot (unit price + effective date) is stored on each line item. This ensures historical orders remain accurate even when vendor prices change.

## Configuration

Backend configuration is in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=enterbridge.db"
  }
}
```

To use a different database path, edit this file. The app will create the database file at the specified location on first run.

## Troubleshooting

### Backend won't start / Port 5121 already in use
```bash
# Kill the process using port 5121
lsof -i :5121
kill -9 <PID>

# Then restart
dotnet run
```

### Frontend can't connect to backend
- Ensure the backend is running on `http://localhost:5121`
- Check that there are no CORS errors in the browser console
- The backend has CORS enabled for all origins by default (see `Program.cs`)

### Database is corrupted or out of sync
Delete all database files and restart:
```bash
rm -f EnterBridge.Api/enterbridge.db*
cd EnterBridge.Api
dotnet run
```

### Port 5173 already in use
Vite will automatically use the next available port. Check the terminal output for the actual URL.

## Development

### Hot Reload
- **Frontend:** Changes to React files automatically refresh in the browser
- **Backend:** Changes require a restart (`Ctrl+C`, then `dotnet run` again)

### Build for Production

Frontend:
```bash
cd enterbridge-ui
npm run build
```

Backend:
```bash
cd EnterBridge.Api
dotnet publish -c Release
```

## Future Enhancements

The app is designed to support several planned features:

1. **Price Movement Tracking** – Add charts to visualize price trends over time
2. **Order Approval Workflow** – Add order status (Draft/Pending Review/Approved) with a foreman review page
3. **Order Templates** – Save and reuse frequently-ordered product combinations
4. **Advanced Search & Filtering** – Search products and filter orders by date/status
5. **Mobile Optimization** – Improve layout for smaller screens


## License

This is a case study project. Feel free to use it as a reference or starting point for your own work.

