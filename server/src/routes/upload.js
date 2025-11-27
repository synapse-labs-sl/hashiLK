import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

// Configure Cloudinary if credentials exist
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Placeholder images for when Cloudinary isn't configured
const placeholderImages = [
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500'
];

// Upload single image
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // If Cloudinary isn't configured, return a placeholder
    if (!isCloudinaryConfigured) {
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      return res.json({ url: randomImage, placeholder: true });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'hashilk',
      resource_type: 'auto'
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple images
router.post('/images', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // If Cloudinary isn't configured, return placeholders
    if (!isCloudinaryConfigured) {
      const urls = req.files.map((_, i) => 
        placeholderImages[i % placeholderImages.length]
      );
      return res.json({ urls, placeholder: true });
    }

    const uploadPromises = req.files.map(file => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return cloudinary.uploader.upload(dataURI, {
        folder: 'hashilk',
        resource_type: 'auto'
      });
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.secure_url);

    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
