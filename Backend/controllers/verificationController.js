const { Verification, User } = require('../models');

// Request a new verification
exports.requestVerification = async (req, res) => {
  try {
    const { documentType, documentHash, ipfsHash, metadata = {} } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!documentType || !documentHash || !ipfsHash) {
      return res.status(400).json({
        success: false,
        message: 'Document type, document hash, and IPFS hash are required'
      });
    }

    // Check if there's a pending verification already
    const existingVerification = await Verification.findOne({
      where: {
        userId,
        status: 'pending'
      }
    });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending verification request'
      });
    }

    // Create verification request
    const verification = await Verification.create({
      userId,
      documentType,
      documentHash,
      ipfsHash,
      metadata,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    });

    return res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      data: { verification }
    });
  } catch (error) {
    console.error('Verification request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user verifications
exports.getUserVerifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const verifications = await Verification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Verifications retrieved successfully',
      data: { verifications }
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving verifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get verification by ID
exports.getVerificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const verification = await Verification.findOne({
      where: { id },
      include: [{ model: User, as: 'user', attributes: ['id', 'walletAddress', 'email', 'username'] }]
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    // Check if user has permission to view this verification
    if (verification.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this verification'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification retrieved successfully',
      data: { verification }
    });
  } catch (error) {
    console.error('Get verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin: Review verification
exports.reviewVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can review verifications'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    // Get verification
    const verification = await Verification.findByPk(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    // Update verification
    verification.status = status;
    if (status === 'rejected' && rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }

    await verification.save();

    // If approved, update user verification status
    if (status === 'approved') {
      await User.update(
        { isVerified: true },
        { where: { id: verification.userId } }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Verification ${status}`,
      data: { verification }
    });
  } catch (error) {
    console.error('Review verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};