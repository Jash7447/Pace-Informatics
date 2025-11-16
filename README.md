# Pace Informatics - Product Inventory Management System

A full-stack Next.js application for tracking import and export products for a company. Built with TypeScript, Tailwind CSS, Shadcn UI, MongoDB, and Recharts for analytics.

## Features

- 📦 **Product Management**: Full CRUD operations for products
- 🗂️ **Category Management**: Organize products by categories
- 📊 **Analytics Dashboard**: Visual statistics with bar charts and pie charts
- 🔍 **Search Functionality**: Search products across all fields
- 📱 **Responsive Design**: Clean, modern, professional UI
- 🚀 **Server-Side Rendering**: Fast, optimized performance

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Database**: MongoDB with Mongoose
- **Charts**: Recharts
- **Icons**: Lucide React
- **Future**: ExcelJS for data export (prepared structure)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- MongoDB (local or MongoDB Atlas)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pace_infomatics
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/pace_infomatics
```
For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pace_infomatics
```

4. Run MongoDB locally (if using local MongoDB):
```bash
mongod
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
pace_infomatics/
├── app/
│   ├── api/
│   │   ├── categories/        # Category CRUD endpoints
│   │   ├── products/          # Product CRUD endpoints
│   │   └── stats/             # Statistics endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── Header.tsx             # App header with search
│   ├── Footer.tsx             # App footer
│   ├── Sidebar.tsx            # Left sidebar (categories)
│   ├── ProductTable.tsx       # Main product table
│   └── StatsSidebar.tsx       # Right sidebar (statistics)
├── lib/
│   ├── mongodb.ts             # MongoDB connection utility
│   └── utils.ts               # Utility functions
├── models/
│   ├── Category.ts            # Category Mongoose model
│   └── Product.ts             # Product Mongoose model
└── package.json
```

## Usage

### Adding Categories

1. Click the "Add Category" button in the left sidebar
2. Enter a category name (required) and optional description
3. Click "Create Category"

### Adding Products

1. Click the "Add Product" button in the main content area
2. Fill in all required fields:
   - Product Name
   - Brand
   - Model
   - Stock (quantity)
   - Location
   - Category
3. Optionally add remarks
4. Click "Create Product"

### Viewing Products

- Click on a category in the left sidebar to filter products
- Use the search bar in the header to search across all products
- View statistics in the right sidebar

### Editing/Deleting

- Click the edit icon (pencil) to modify a product
- Click the delete icon (trash) to remove a product

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a category
- `PUT /api/categories/[id]` - Update a category
- `DELETE /api/categories/[id]` - Delete a category

### Products
- `GET /api/products?category=[id]` - Get all products (optional category filter)
- `POST /api/products` - Create a product
- `PUT /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Delete a product

### Statistics
- `GET /api/stats` - Get dashboard statistics

## Future Enhancements

- [ ] Excel export functionality (ExcelJS)
- [ ] User authentication and authorization
- [ ] Role-based access control (admin/staff)
- [ ] Enhanced charts and analytics
- [ ] Product import from Excel
- [ ] Barcode scanning support
- [ ] Inventory alerts and notifications

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

© 2024 Pace Informatics. All rights reserved.
