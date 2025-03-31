const express = require("express");
const router = express.Router();
const { uploadToIPFS } = require("../utils/ipfs");

router.post("/submit-verification", async (req, res) => {
  const { walletAddress, file } = req.body;
  if (!walletAddress || !file) return res.status(400).json({ error: "Missing parameters" });

  try {
    const ipfsHash = await uploadToIPFS(file);
    // Here, the backend could interact with the smart contract if necessary.
    res.json({ success: true, ipfsHash });
  } catch (error) {
    res.status(500).json({ error: "Failed to process verification" });
  }
});

module.exports = router;