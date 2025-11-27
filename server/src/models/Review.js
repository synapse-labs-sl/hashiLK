import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewType: { type: String, enum: ['product', 'service'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  order: { type: mongoose.Schema.Types.ObjectId }, // Reference to order/service order
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, maxlength: 1000 },
  images: [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  response: {
    text: String,
    respondedAt: Date
  }
}, { timestamps: true });

// Ensure one review per user per product/service
reviewSchema.index({ reviewer: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewer: 1, service: 1 }, { unique: true, sparse: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(itemId, itemType) {
  const match = itemType === 'product' ? { product: itemId } : { service: itemId };
  
  const result = await this.aggregate([
    { $match: match },
    { 
      $group: { 
        _id: null, 
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      } 
    }
  ]);
  
  return result.length > 0 
    ? { averageRating: Math.round(result[0].averageRating * 10) / 10, totalReviews: result[0].totalReviews }
    : { averageRating: 0, totalReviews: 0 };
};

export default mongoose.model('Review', reviewSchema);
