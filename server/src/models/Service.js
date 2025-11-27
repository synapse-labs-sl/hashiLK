import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['fixed', 'hourly', 'daily'], default: 'fixed' },
  images: [{ type: String }],
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliveryTime: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  views: { type: Number, default: 0 },
  location: {
    city: String,
    province: String
  },
  commissionRate: { type: Number, default: 15 },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

serviceSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Service', serviceSchema);
