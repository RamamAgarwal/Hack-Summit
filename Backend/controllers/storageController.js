const crypto = require('crypto');
const { create } = 'ipfs-http-client';
const { Verification } = require('../models');
const config = require('../config');

// Configure IPFS client with authentication
const auth = 'Basic ' + Buffer.from(
  config.ipfs.projectId + ':' + config.ipfs.projectSecret
).toString('base64');

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

// Upload file to IPFS
exports.uploadToIPFS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate SHA-256 hash of the file
    const fileHash = crypto
      .createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');

    // Prepare metadata
    const metadata = {
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hash: fileHash,
      uploadedBy: req.user.id,
      timestamp: new Date().toISOString()
    };

    // Create a buffer of metadata JSON
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));

    // Upload file and metadata to IPFS
    const fileResult = await ipfs.add(req.file.buffer);
    const metadataResult = await ipfs.add(metadataBuffer);

    // Combine hashes into a single metadata object with links
    const ipfsData = {
      fileHash: fileResult.path,
      metadataHash: metadataResult.path,
      fileUrl: `${config.ipfs.gateway}${fileResult.path}`,
      metadataUrl: `${config.ipfs.gateway}${metadataResult.path}`
    };

    return res.status(200).json({
      success: true,
      message: 'File uploaded to IPFS successfully',
      data: {
        fileHash,
        ipfsHash: fileResult.path,
        ipfsData
      }
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during IPFS upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get file from IPFS
exports.getFromIPFS = async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({
        success: false,
        message: 'IPFS hash is required'
      });
    }

    // Check if user has access to this verification
    const verification = await Verification.findOne({
      where: { ipfsHash: hash }
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // For administrators or the file owner
    if (req.user.role !== 'admin' && verification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this file'
      });
    }

    // Redirect to IPFS gateway
    return res.redirect(`${config.ipfs.gateway}${hash}`);
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during IPFS retrieval',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};