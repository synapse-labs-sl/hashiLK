import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { connectDB } from './config/db.js';
import './config/passport.js';

// Security middleware
import { generalLimiter, sanitizeInput, securityHeaders } from './middleware/security.js';

// Routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import serviceRoutes from './routes/services.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import reviewRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import messageRoutes from './routes/messages.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import verificationRoutes from './routes/verification.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);
app.use(sanitizeInput);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Hashi.lk API Server', status: 'running' });
});

// Handle production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
