const ethers = require('ethers');
const { Verification, User } = require('../models');
const config = require('../config');

// ABI for the verification contract (simplified example)
const verificationContractABI = [
  // Get verification status
  "function getVerificationStatus(address user) view returns (bool)",
  // Add verification
  "function addVerification(address user, string memory documentHash, string memory ipfsHash) returns (bool)",
  // Revoke verification
  "function revokeVerification(address user) returns (bool)",
  // Verification event
  "event VerificationAdded(address indexed user, string documentHash, string ipfsHash, uint256 timestamp)",
  // Revocation event
  "event VerificationRevoked(address indexed user, uint256 timestamp)"
];

// Setup provider and contract
const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
const wallet = new ethers.Wallet(config.blockchain.privateKey, provider);
const verificationContract = new ethers.Contract(
  config.blockchain.verificationContractAddress,
  verificationContractABI,
  wallet
);

// Record verification on blockchain
exports.recordVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;

    // Get verification record
    const verification = await Verification.findByPk(verificationId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    // Ensure verification is approved but not yet on blockchain
    if (verification.status !== 'approved' || verification.txHash) {
      return res.status(400).json({
        success: false,
        message: 'Verification is not approved or already recorded on blockchain'
      });
    }

    // Send transaction to blockchain
    const tx = await verificationContract.addVerification(
      verification.user.walletAddress,
      verification.documentHash,
      verification.ipfsHash
    );

    // Update verification with transaction hash
    verification.txHash = tx.hash;
    await verification.save();

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      message: 'Verification recorded on blockchain',
      data: {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      }
    });
  } catch (error) {
    console.error('Blockchain recording error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during blockchain recording',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Revoke verification on blockchain
exports.revokeVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;

    // Get verification record
    const verification = await Verification.findByPk(verificationId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
    }

    // Ensure verification exists on blockchain
    if (!verification.txHash) {
      return res.status(400).json({
        success: false,
        message: 'Verification is not recorded on blockchain'
      });
    }

    // Send transaction to blockchain
    const tx = await verificationContract.revokeVerification(
      verification.user.walletAddress
    );

    // Update verification status
    verification.status = 'rejected';
    verification.rejectionReason = req.body.reason || 'Verification revoked';
    await verification.save();

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      message: 'Verification revoked on blockchain',
      data: {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      }
    });
  } catch (error) {
    console.error('Blockchain revocation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during blockchain revocation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check verification status on blockchain
exports.checkVerificationStatus = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }

    // Check status on blockchain
    const isVerified = await verificationContract.getVerificationStatus(walletAddress);

    return res.status(200).json({
      success: true,
      message: 'Verification status retrieved',
      data: {
        walletAddress,
        isVerified
      }
    });
  } catch (error) {
    console.error('Blockchain status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during blockchain status check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get gas price estimate
exports.getGasPrice = async (req, res) => {
  try {
    const gasPrice = await provider.getFeeData();

    return res.status(200).json({
      success: true,
      message: 'Gas price retrieved successfully',
      data: {
        gasPrice: gasPrice.gasPrice.toString(),
        maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
      }
    });
  } catch (error) {
    console.error('Gas price retrieval error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during gas price retrieval',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};