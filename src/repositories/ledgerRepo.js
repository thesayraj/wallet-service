class LedgerRepository {
  async createHeader(conn, { id, referenceId, type }) {
    return conn.execute(
      "INSERT INTO transactions (id, reference_id, type) VALUES (?, ?, ?)",
      [id, referenceId, type],
    );
  }

  async createEntries(conn, entries) {
    const sql =
      "INSERT INTO transaction_entries (id, transaction_id, wallet_id, amount) VALUES ?";
    const values = entries.map((e) => [
      e.id.toString(),
      e.txId.toString(),
      e.walletId,
      e.amount,
    ]);
    return conn.query(sql, [values]);
  }

  async getByRef(pool, referenceId) {
    const [rows] = await pool.execute(
      "SELECT id FROM transactions WHERE reference_id = ?",
      [referenceId],
    );
    return rows[0];
  }
}
module.exports = new LedgerRepository();
