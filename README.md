# TYLGO - Smart Operating System for Tile Businesses

A comprehensive SaaS platform for managing tile showrooms, inventory, quotations, and team collaboration.

## Features

- 🏢 **Company Workspace System** - Each company has its own isolated data
- 👥 **Role-Based Access** - Admin and Worker roles with different permissions
- 📦 **Tile Management** - Full CRUD operations for tiles with images, pricing, and inventory
- 📱 **QR Code System** - Generate QR codes for each tile for quick access
- 🧮 **Room Calculator** - Calculate required tiles with automatic wastage calculation
- 🛒 **Shopping Cart** - Add tiles to cart and manage quantities
- 📄 **Quotations** - Generate professional quotations with PDF export
- 🔒 **Row Level Security** - Secure data isolation using Supabase RLS

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router DOM
- **PDF Generation**: jsPDF + html2canvas
- **QR Codes**: qrcode.react

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Tylgo
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor and run the SQL script from `supabase/schema.sql`
   - Go to Settings > API and copy your project URL and anon key

4. Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the SQL script
4. This will create all necessary tables, policies, and indexes

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── RoomCalculator.tsx
├── contexts/         # React contexts
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── lib/             # Utilities and configurations
│   └── supabase.ts
├── pages/           # Page components
│   ├── Dashboard.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── TilesPage.tsx
│   ├── TileDetailPage.tsx
│   ├── CartPage.tsx
│   ├── QuotationsPage.tsx
│   ├── QuotationDetailPage.tsx
│   ├── ManageTilesPage.tsx
│   └── ManageWorkersPage.tsx
├── types/           # TypeScript type definitions
│   └── database.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## User Roles

### Admin
- Add, edit, and delete tiles
- Manage inventory and pricing
- Add and remove workers
- View all quotations

### Worker
- Browse and search tiles
- Add tiles to cart
- Generate quotations
- View quotations

## Key Features Explained

### Authentication
- Email/password authentication via Supabase Auth
- Company workspace isolation
- Automatic user profile creation on signup

### Tile Management
- Each tile has: name, brand, size, category, price per sqft, image, and stock quantity
- Admin can manage all tiles
- Workers can view and add to cart

### QR Code System
- Each tile has a unique QR code
- Scanning opens the tile detail page
- Workers can scan and add tiles directly to cart

### Room Calculator
- Enter room dimensions (length × width)
- Automatic wastage calculation (default 10%)
- Calculates total sqft required
- Can be used when adding tiles to cart

### Quotations
- Create quotations from cart items
- View quotation history
- Download quotations as PDF
- Includes all tile details and pricing

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)
3. Make sure to set environment variables in your hosting platform

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access data from their company
- Admin-only operations are protected at both database and UI levels

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
