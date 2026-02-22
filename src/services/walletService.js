const pool = require("../config/db");
const walletRepo = require("../repositories/walletRepo");
const ledgerRepo = require("../repositories/ledgerRepo");
const snowflake = require("../utils/snowflake");

const TREASURY_MAP = { GOLD: 1, DIAMOND: 2, LOYALTY: 3 };

class WalletService {
  async getUserBalances(userId) {
    const rows = await walletRepo.getByUserId(pool, userId);

    const balances = {};
    rows.forEach((row) => {
      balances[row.asset_type] = row.balance.toString();
    });

    return {
      userId,
      balances,
    };
  }

  async processTransaction({ userId, assetType, amount, referenceId, type }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const wallet = await walletRepo.getForUpdate(conn, userId, assetType);
      if (!wallet) throw new Error("WALLET_NOT_FOUND");
      if (amount < 0 && BigInt(wallet.balance) < BigInt(Math.abs(amount))) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const txId = snowflake.generate();
      await ledgerRepo.createHeader(conn, { id: txId, referenceId, type });
      await walletRepo.updateBalance(conn, wallet.id, amount);

      await ledgerRepo.createEntries(conn, [
        { id: snowflake.generate(), txId, walletId: wallet.id, amount },
        {
          id: snowflake.generate(),
          txId,
          walletId: TREASURY_MAP[assetType],
          amount: -amount,
        },
      ]);

      await conn.commit();
      return { transactionId: txId.toString(), referenceId };
    } catch (err) {
      console.log("err :", err)
      await conn.rollback();
      if (err.code === "ER_DUP_ENTRY")
        return await this.handleDuplicate(referenceId);
      throw err;
    } finally {
      conn.release();
    }
  }

  async handleDuplicate(ref) {
    const tx = await ledgerRepo.getByRef(pool, ref);
    return { transactionId: tx.id.toString(), status: "ALREADY_PROCESSED" };
  }
}

module.exports = new WalletService();
