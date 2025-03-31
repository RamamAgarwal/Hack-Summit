import express from 'express';
import userController from '../controllers/userController.js';
const { authenticate } = require('../middleware/auth.js');
const router = express.Router();

// Authentication routes
router.post('/register', userController.registerWithWallet);
router.post('/nonce', userController.getNonce);
router.post('/verify-signature', userController.verifySignature);

// Protected routes (require authentication)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Verification routes
router.post('/request-verification', authenticate, require('../controllers/verificationController').requestVerification);
router.get('/verifications', authenticate, require('../controllers/verificationController').getUserVerifications);
router.get('/verifications/:id', authenticate, require('../controllers/verificationController').getVerificationById);

export default router;