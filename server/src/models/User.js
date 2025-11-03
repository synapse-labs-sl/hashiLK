import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, sparse: true, unique: true },
  avatar: { type: String },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'], 
    default: 'buyer' 
  },
  isVerified: { type: Boolean, default: false },
  isSeller: { type: Boolean, default: false },
  sellerInfo: {
    businessName: String,
    description: String,
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 }
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String
  },
  language: { type: String, enum: ['en', 'si', 'ta'], default: 'en' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
