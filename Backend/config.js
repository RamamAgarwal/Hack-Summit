import dotenv from 'dotenv';
dotenv.config();

export const config  = {
  // Database configuration
  database: {
    name: process.env.DB_NAME || 'verification_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  // Blockchain configuration
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key',
    verificationContractAddress: process.env.CONTRACT_ADDRESS || '0x123456789abcdef...',
    privateKey: process.env.PRIVATE_KEY, // For server-side transactions
    networkId: process.env.NETWORK_ID || 11155111 // Sepolia testnet
  },
  // IPFS/Filecoin configuration
  ipfs: {
    projectId: process.env.IPFS_PROJECT_ID,
    projectSecret: process.env.IPFS_PROJECT_SECRET,
    gateway: process.env.IPFS_GATEWAY || 'https://gateway.ipfs.io/ipfs/'
  },
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-development-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // KYC verification service (example)
  kycService: {
    apiKey: process.env.KYC_API_KEY,
    apiUrl: process.env.KYC_API_URL || 'https://api.kyc-service.com/v1'
  }
};
