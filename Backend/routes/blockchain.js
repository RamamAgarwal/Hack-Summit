import express from 'express';
const blockchainController = require('../controllers/blockchainController');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/status/:walletAddress', blockchainController.checkVerificationStatus);
router.get('/gas-price', blockchainController.getGasPrice);

// Admin only routes (require authentication and admin role)
router.post('/record/:verificationId', authenticate, isAdmin, blockchainController.recordVerification);
router.post('/revoke/:verificationId', authenticate, isAdmin, blockchainController.revokeVerification);

export default router;