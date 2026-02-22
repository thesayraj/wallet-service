# 💰 Wallet Service

A high-performance, precision-safe wallet system built with **Node.js**, **MySQL**, and **Docker**.
This service handles multi-asset balances (`GOLD`, `DIAMOND`, `LOYALTY`) using a strict, atomic ledger-based approach.

## 🚀 Quick Start (Zero Config)

The entire environment is containerized. You do not need to install Node.js or MySQL locally.

1.  **Clone the repository.**
2.  **cd into project root dir**
    ```bash
    cd wallet-service
    ```
3.  **Start the service:**
    ```bash
    docker-compose up --build
    ```
    That's it.

**Automatic Lifecycle:**

- **Database Init:** MySQL boots and creates a restricted `app_user`.
- **Migrations:** `db-migrate` automatically builds the schema and creates system account and wallets.
- **Seeding:** The system seeds two test users (`sigma_player` and `gamma_player`) and funds them via the transaction service
  to ensure a valid audit trail exists from day one. You can note their `userId`s from logs.
- **Ready:** The API starts on `http://localhost:3000`.

**Debugging and data verification:**

- You can verify database tables by using docker shell

```bash
    docker exec -it wallet_mysql mysql -u app_user -p
```

Enter password which is defined as DB_PASS in `docker-compose.yml` file.
You can refer to other env variables in `docker-compose.yml` file under `environment`.

> [!IMPORTANT]
> Injected all vars in `docker-compose.yml` for ease. In production we will use `.env`.

---

## 🏗 Key Engineering Decisions

### 1. Choice of Technology

- **Node.js**: Selected due to familiarity and ease.
- **MySQL:** Selected for simplicity and robust support of **ACID transactions**,
  ensuring no transactions are lost or out of sync even under system failures.
- **Snowflake IDs:** Used for primary keys to provide unique, time-ordered identifiers that are safer, storage efficient
  and more scalable than standard auto-incrementing integers.

**_NOTE:_** For System accounts we use low IDs like `1`, `2`, 3.. so that they are clearly distinguishable than user related ids
which will be a big number like `151292704704172032`

### 2. Concurrency & Deadlock Avoidance

To handle heavy traffic and prevent "Double Spending":

- **Row-Level Locking:** We utilize `SELECT ... FOR UPDATE` on user wallet records.
  This ensures only one process can modify a specific balance at a time, preventing race conditions.
  This also makes sure we only read updated and consistent balance.
- **System Wallet Strategy:** As System wallet will be common in all transactions it can become a bottleneck on scale if we lock it too.
  To avoid global bottlenecks and deadlocks, we **do not lock the System/Treasury wallet row**.
  Instead, we record its involvement in the ledger for auditability while treating it as an infinite sink/source, allowing high-concurrency throughput.

**_NOTE:_** Locking user wallet won't have impact on other users' transactions as we are not targeting `user-user` transfer.
So, no deadlock in that way.

### 3. Idempotency

To handle network retries or duplicate API calls safely:

- **Unique Reference Constraints:** The `transactions` table enforces a `UNIQUE` constraint on `reference_id`.
- **Integrity:** Any duplicate transaction attempt is rejected by the database engine, ensuring every credit is recorded exactly once.

### 4. Ledger-Based Architecture

- **Auditability:** Every movement of funds creates a permanent, immutable record in the `transaction_entries` table rather than just updating a balance column.
- **Double-Entry Logic:** Every user credit/debit has a corresponding entry relative to the System Treasury, ensuring the system remains in sync.

---

## 📡 API Endpoints

### 1. Check Balance

**GET** `/wallets/:userId/balance`

- Returns the current balance for the user's assets.

### 2. Functional Flows

All transaction endpoints require a `referenceId` for idempotency and `assetType` (e.g., "GOLD").

- **Wallet Top-up (Purchase):**
  `POST /wallets/topup`
  Credits the user's wallet following a successful "real money" payment

- **Bonus/Incentive:**
  `POST /wallets/bonus`
  Issues free credits (e.g., referral or game-level bonuses)

- **Purchase/Spend:**
  `POST /wallets/spend`
  Debits the user's wallet for in-game items or services, ensuring balances never go negative.

**Example Request Body:**

```json
{
  "userId": "151257461234",
  "assetType": "GOLD",
  "amount": 100,
  "referenceId": "INV-unique-99"
}
```
