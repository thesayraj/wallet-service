module.exports = (req, res, next) => {
  const { userId, assetType, amount, referenceId } = req.body;
  if (!userId || !assetType || !amount || !referenceId)
    return res.status(400).json({ error: "Missing fields" });
  if (amount <= 0)
    return res.status(400).json({ error: "Amount must be positive" });
  next();
};
