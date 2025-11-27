# Hashi.lk - Sri Lanka's All-in-One Marketplace

A modern web platform combining products (like Amazon) and services (like Fiverr) in one marketplace for Sri Lanka.

## Features

- 🛍️ Product marketplace with categories, filters, and pagination
- 💼 Service marketplace with booking system and commission structure
- 🌐 Multi-language support (English, Sinhala, Tamil)
- 🔐 Authentication with Google OAuth + Email/Password
- 👤 User & Seller dashboards
- 🛒 Shopping cart & checkout
- 👨‍💼 Admin moderation system
- 📱 Mobile responsive design
- 📤 Image upload with Cloudinary

## Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Zustand (state management)
- i18next (internationalization)
- Axios
- React Hot Toast

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JWT authentication
- Passport.js (Google OAuth)
- Multer + Cloudinary (image uploads)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Cloudinary account for image uploads
- (Optional) Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd hashi-lk
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
```

4. Start MongoDB (if running locally)

5. (Optional) Seed sample data:
```bash
cd server
npm run seed
```

This creates test accounts:
- Admin: `admin@hashi.lk` / `admin123`
- Seller: `kamal@example.com` / `seller123`
- Buyer: `buyer@example.com` / `buyer123`

6. Run the application:
```bash
# From root directory - runs both client & server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
hashi-lk/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── api/            # API configuration
│   │   └── i18n.js         # Translations
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   ├── seed.js         # Database seeder
│   │   └── index.js        # Entry point
│   └── package.json
└── package.json            # Root workspace config
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with pagination, filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Services
- `GET /api/services` - List services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (seller)
- `PUT /api/services/:id` - Update service

### Orders
- `POST /api/cart/checkout` - Create product order
- `POST /api/orders/service-order` - Book a service
- `GET /api/orders/my-orders` - Get buyer's product orders
- `GET /api/orders/my-service-orders` - Get buyer's service bookings
- `GET /api/orders/seller-orders` - Get seller's received orders
- `GET /api/orders/provider-orders` - Get provider's service orders
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/service-order/:id/status` - Update service order status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/become-seller` - Register as seller
- `GET /api/users/seller/dashboard` - Get seller dashboard data

### Admin
- `GET /api/admin/products/pending` - Pending products
- `PATCH /api/admin/products/:id/status` - Approve/reject product
- `GET /api/admin/services/pending` - Pending services
- `PATCH /api/admin/services/:id/status` - Approve/reject service
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/role` - Update user role

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images

## User Roles

1. **Buyer** - Can browse, purchase products, and book services
2. **Seller** - Can list products and services, manage orders
3. **Admin** - Can moderate listings, manage users

## Commission Model

- Products: No commission fees
- Services: 15% commission on completed orders (configurable via `SERVICE_COMMISSION_RATE`)

## Design System - "Bridge of Opportunity"

The UI embodies Hashi.lk as a bridge connecting buyers and sellers across Sri Lanka.

**Colors:**
- Ocean Blue (Primary): `#0B4F6C` - Trust, reliability
- Burnt Orange (Accent): `#D97706` - Energy, Sri Lankan heritage
- Emerald Green (Secondary): `#059669` - Growth, local relevance

**Typography:** Montserrat

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete design guidelines.

## Optional Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add to `.env`

## License

MIT
