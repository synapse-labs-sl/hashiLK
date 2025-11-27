import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    addedAt: { type: Date, default: Date.now },
    priceWhenAdded: Number
  }],
  services: [{
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    addedAt: { type: Date, default: Date.now },
    priceWhenAdded: Number
  }]
}, { timestamps: true });

wishlistSchema.index({ user: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
