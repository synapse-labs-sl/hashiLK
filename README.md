# Hashi.lk - Sri Lanka's All-in-One Marketplace

A modern web platform combining products (like Amazon) and services (like Fiverr) in one marketplace for Sri Lanka.

## Features

- 🛍️ Product marketplace with categories
- 💼 Service marketplace with commission structure
- 🌐 Multi-language support (English, Sinhala, Tamil)
- 🔐 Authentication with Google OAuth
- 👤 User & Seller dashboards
- 🛒 Shopping cart & checkout
- 👨‍💼 Admin moderation system
- 📱 Mobile responsive design

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- React Router
- Zustand (state management)
- i18next (internationalization)
- Axios

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JWT authentication
- Passport.js (Google OAuth)
- bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Google OAuth credentials

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

**Server (.env):**
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
```

4. Start MongoDB

5. Run the application:
```bash
# Development mode (both client & server)
npm run dev

# Or run separately:
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 5173
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

## Project Structure

```
hashi-lk/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand stores
│   │   ├── api/         # API configuration
│   │   └── i18n.js      # Translations
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   ├── config/      # Configuration files
│   │   └── index.js     # Entry point
│   └── package.json
└── package.json         # Root workspace config
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Services
- `GET /api/services` - List services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (seller)
- `PUT /api/services/:id` - Update service

### Admin
- `GET /api/admin/products/pending` - Pending products
- `PATCH /api/admin/products/:id/status` - Approve/reject product
- `GET /api/admin/services/pending` - Pending services
- `PATCH /api/admin/services/:id/status` - Approve/reject service

## Design System - "Bridge of Opportunity"

The entire UI/UX embodies the concept of Hashi.lk as a bridge connecting buyers and sellers across Sri Lanka.

### Visual Identity

**Logo:** Stylized bridge arch formed by two interlocking "H" shapes with subtle Gokkola weave pattern

**Colors:**
- **Ocean Blue** (Primary): `#0B4F6C` - Trust, reliability, depth
- **Burnt Orange** (Accent): `#D97706` - Energy, creativity, Sri Lankan heritage
- **Emerald Green** (Secondary): `#059669` - Growth, local relevance

**Typography:** Montserrat (clean, modern sans-serif)

**Motifs:** 
- Bridge arches and curves throughout the design
- Gokkola weave pattern as subtle background texture
- Upward curves suggesting growth and aspiration

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete design guidelines.

## Commission Model

Services have a configurable commission rate (default 15%) that can be set via environment variable `SERVICE_COMMISSION_RATE`.

## License

MIT
