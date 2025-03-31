const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const { identityContractABI, identityContractAddress } = require("../config");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID");

router.get("/verification-status/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  
  try {
    const contract = new ethers.Contract(identityContractAddress, identityContractABI, provider);
    const identity = await contract.getIdentity(walletAddress);
    
    res.json({ walletAddress, verificationStatus: identity.verified });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verification status" });
  }
});

module.exports = router;