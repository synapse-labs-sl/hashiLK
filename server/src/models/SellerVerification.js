import mongoose from 'mongoose';

const sellerVerificationSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  // Personal verification
  nicNumber: { type: String },
  nicFrontImage: { type: String },
  nicBackImage: { type: String },
  selfieWithNic: { type: String },
  
  // Business verification (optional)
  businessRegistrationNumber: { type: String },
  businessRegistrationDoc: { type: String },
  businessType: { type: String, enum: ['individual', 'sole_proprietor', 'company'] },
  
  // Bank details for payouts
  bankDetails: {
    bankName: String,
    branchName: String,
    accountNumber: String,
    accountHolderName: String
  },
  
  // Verification process
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  
  // Verification badges
  badges: [{
    type: { type: String, enum: ['identity_verified', 'business_verified', 'top_seller', 'trusted'] },
    awardedAt: Date
  }]
}, { timestamps: true });

export default mongoose.model('SellerVerification', sellerVerificationSchema);
