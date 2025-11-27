import express from 'express';
import SellerVerification from '../models/SellerVerification.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get seller's verification status
router.get('/status', authenticate, async (req, res) => {
  try {
    const verification = await SellerVerification.findOne({ seller: req.user._id });
    res.json(verification || { status: 'not_submitted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit verification documents
router.post('/submit', authenticate, async (req, res) => {
  try {
    const {
      nicNumber,
      nicFrontImage,
      nicBackImage,
      selfieWithNic,
      businessRegistrationNumber,
      businessRegistrationDoc,
      businessType,
      bankDetails
    } = req.body;
    
    let verification = await SellerVerification.findOne({ seller: req.user._id });
    
    if (verification && verification.status === 'approved') {
      return res.status(400).json({ message: 'Already verified' });
    }
    
    if (verification) {
      // Update existing
      verification.nicNumber = nicNumber;
      verification.nicFrontImage = nicFrontImage;
      verification.nicBackImage = nicBackImage;
      verification.selfieWithNic = selfieWithNic;
      verification.businessRegistrationNumber = businessRegistrationNumber;
      verification.businessRegistrationDoc = businessRegistrationDoc;
      verification.businessType = businessType || 'individual';
      verification.bankDetails = bankDetails;
      verification.status = 'pending';
      verification.submittedAt = new Date();
      verification.rejectionReason = undefined;
    } else {
      verification = new SellerVerification({
        seller: req.user._id,
        nicNumber,
        nicFrontImage,
        nicBackImage,
        selfieWithNic,
        businessRegistrationNumber,
        businessRegistrationDoc,
        businessType: businessType || 'individual',
        bankDetails,
        status: 'pending',
        submittedAt: new Date()
      });
    }
    
    await verification.save();
    res.json({ message: 'Verification submitted', verification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get pending verifications
router.get('/pending', authenticate, authorize('admin'), async (req, res) => {
  try {
    const verifications = await SellerVerification.find({ 
      status: { $in: ['pending', 'under_review'] } 
    })
      .populate('seller', 'name email phone')
      .sort({ submittedAt: 1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Review verification
router.patch('/:id/review', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const verification = await SellerVerification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    verification.status = status;
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.user._id;
    
    if (status === 'rejected') {
      verification.rejectionReason = rejectionReason;
    }
    
    if (status === 'approved') {
      // Add verified badge
      verification.badges.push({
        type: 'identity_verified',
        awardedAt: new Date()
      });
      
      if (verification.businessRegistrationNumber) {
        verification.badges.push({
          type: 'business_verified',
          awardedAt: new Date()
        });
      }
      
      // Update user
      await User.findByIdAndUpdate(verification.seller, {
        isVerified: true,
        'sellerInfo.isVerified': true
      });
    }
    
    await verification.save();
    res.json(verification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's badges
router.get('/badges/:sellerId', async (req, res) => {
  try {
    const verification = await SellerVerification.findOne({ 
      seller: req.params.sellerId,
      status: 'approved'
    });
    
    res.json({ badges: verification?.badges || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
