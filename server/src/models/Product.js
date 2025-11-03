import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 0 },
  condition: { type: String, enum: ['new', 'used', 'refurbished'], default: 'new' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  views: { type: Number, default: 0 },
  location: {
    city: String,
    province: String
  },
  specifications: mongoose.Schema.Types.Mixed
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
