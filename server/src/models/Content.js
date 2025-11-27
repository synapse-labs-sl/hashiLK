import mongoose from 'mongoose';

// Banner Schema - for homepage hero banners, promotional banners
const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  linkText: { type: String },
  position: { type: String, enum: ['hero', 'sidebar', 'footer', 'popup'], default: 'hero' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Promotion Schema - for discounts, flash sales, coupons
const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['percentage', 'fixed', 'flash_sale', 'buy_one_get_one'], required: true },
  discountValue: { type: Number }, // percentage or fixed amount
  code: { type: String, unique: true, sparse: true }, // coupon code
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number }, // cap for percentage discounts
  usageLimit: { type: Number }, // total uses allowed
  usageCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  applicableTo: {
    type: { type: String, enum: ['all', 'products', 'services', 'categories', 'specific'] },
    categories: [String],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }]
  },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Notice Schema - for announcements, alerts, system messages
const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'announcement'], default: 'info' },
  target: { type: String, enum: ['all', 'buyers', 'sellers', 'admins'], default: 'all' },
  position: { type: String, enum: ['top_bar', 'popup', 'dashboard', 'checkout'], default: 'top_bar' },
  isActive: { type: Boolean, default: true },
  isDismissible: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  link: { type: String },
  linkText: { type: String },
  priority: { type: Number, default: 0 }, // higher = more important
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Featured Section Schema - for featured products/services on homepage
const featuredSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['products', 'services', 'mixed'], required: true },
  items: [{
    itemType: { type: String, enum: ['product', 'service'] },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    order: { type: Number, default: 0 }
  }],
  displayStyle: { type: String, enum: ['carousel', 'grid', 'list'], default: 'carousel' },
  maxItems: { type: Number, default: 8 },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Banner = mongoose.model('Banner', bannerSchema);
export const Promotion = mongoose.model('Promotion', promotionSchema);
export const Notice = mongoose.model('Notice', noticeSchema);
export const Featured = mongoose.model('Featured', featuredSchema);
