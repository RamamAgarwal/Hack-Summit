const { sign } = 'jsonwebtoken';
const { verifyMessage } = 'ethers';
const { User } =require ('../models');
const { jwt } =require ('../config');

// Generate JWT token
const generateToken = (userId) => {
  return sign(
    { id: userId },
    _jwt.secret,
    { expiresIn: _jwt.expiresIn }
  );
};

// Register a new user with wallet address
export const registerWithWallet=async(req, res) =>{
  try {
    const { walletAddress, signature, email, username } = req.body;

    // Validate inputs
    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address and signature are required'
      });
    }

    // Check if wallet address already exists
    const existingUser = await User.findOne({ where: { walletAddress } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this wallet address already exists'
      });
    }

    // Create new user
    const user = await User.create({
      walletAddress,
      email,
      username
    });

    // Generate JWT token
    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Login with wallet (get nonce)
export const getNonce=async(req, res) =>{
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // Find or create user
    let [user, created] = await User.findOrCreate({
      where: { walletAddress },
      defaults: { walletAddress }
    });

    // If user exists but we need a new nonce
    if (!created) {
      await user.generateNewNonce();
    }

    return res.status(200).json({
      success: true,
      message: 'Nonce generated',
      data: {
        nonce: user.nonce
      }
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during nonce generation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Verify signature and login
export async function verifySignature(req, res) {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address and signature are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { walletAddress } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verification message includes the nonce
    const message = `Sign this message to verify your identity. Nonce: ${user.nonce}`;
    
    // Verify signature
    try {
      const recoveredAddress = verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Signature verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Generate new nonce for next login
    await user.generateNewNonce();

    // Generate JWT token
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get user profile
export async function getProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'nonce'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during profile retrieval',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update user profile
export async function updateProfile(req, res) {
  try {
    const { email, username } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (email) user.email = email;
    if (username) user.username = username;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default userController;