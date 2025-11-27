import mongoose from 'mongoose';

const serviceOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requirements: { type: String, required: true },
  price: { type: Number, required: true },
  commission: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'], 
    default: 'pending' 
  },
  deliveryDate: { type: Date },
  completedAt: { type: Date },
  buyerReview: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: Date
  }
}, { timestamps: true });

export default mongoose.model('ServiceOrder', serviceOrderSchema);
