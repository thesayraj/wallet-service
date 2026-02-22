class WalletRepository {
  async getByUserId(pool, userId) {
    const [rows] = await pool.execute(
      "SELECT asset_type, balance FROM wallets WHERE user_id = ?",
      [userId],
    );
    return rows;
  }

  async getForUpdate(conn, userId, assetType) {
    const [rows] = await conn.execute(
      "SELECT id, balance FROM wallets WHERE user_id = ? AND asset_type = ? FOR UPDATE",
      [userId, assetType],
    );
    return rows[0];
  }

  async updateBalance(conn, walletId, amount) {
    return conn.execute(
      "UPDATE wallets SET balance = balance + ? WHERE id = ?",
      [amount, walletId],
    );
  }
}
module.exports = new WalletRepository();
