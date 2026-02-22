const walletService = require("../services/walletService");

class WalletController {
  async handleFlow(type, req, res) {
    try {
      const { userId, assetType, amount, referenceId } = req.body;

      // Spend is negative amount, Topup/Bonus is positive
      const finalAmount = type === "SPEND" ? -amount : amount;

      const result = await walletService.processTransaction({
        userId: userId,
        assetType: assetType.toUpperCase(),
        amount: finalAmount,
        referenceId: referenceId,
        type,
      });
      res.status(type === "SPEND" ? 200 : 201).json(result);
    } catch (err) {
      const code = err.message === "INSUFFICIENT_FUNDS" ? 402 : 500;
      res.status(code).json({ error: err.message });
    }
  }

  async getBalance(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      const result = await walletService.getUserBalances(userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new WalletController();
