module.exports = {
    ethereum: {
      rpcUrl: process.env.SEPOLIA_RPC_URL, 
      privateKey: process.env.PRIVATE_KEY,
      contractAddress: "DEPLOYED_CONTRACT_ADDRESS", 
      contractABI: require("./IdentityVerificationABI.json"),
    },
  };
  