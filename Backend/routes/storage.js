import express from 'express';
const multer = require('multer');
const storageController = require('../controllers/storageController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files and PDFs
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'));
    }
  },
});

// Upload routes
router.post(
  '/upload',
  authenticate,
  upload.single('document'),
  storageController.uploadToIPFS
);

// Get file from IPFS
router.get('/ipfs/:hash', authenticate, storageController.getFromIPFS);

export default router;