const walletService = require("../src/services/walletService");
const pool = require("../src/config/db");
const snowflake = require("../src/utils/snowflake");

async function seed() {
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM users");

  if (rows[0].count > 1) {
    console.log("⚠️ Database already seeded. Skipping...");
    return;
  }

  console.log("🌱 Starting Seeding...");

  const testUsers = [
    { id: snowflake.generate().toString(), username: "sigma_player" },
    { id: snowflake.generate().toString(), username: "gamma_player" },
  ];

  for (const user of testUsers) {
    await pool.execute("INSERT INTO users (id, username) VALUES (?, ?)", [
      user.id,
      user.username,
    ]);

    const assets = ["GOLD", "DIAMOND", "LOYALTY"];
    for (const asset of assets) {
      const walletId = snowflake.generate().toString();

      await pool.execute(
        "INSERT INTO wallets (id, user_id, asset_type, balance) VALUES (?, ?, ?, 0)",
        [walletId, user.id, asset],
      );
      console.log(`   - Created ${asset} wallet for ${user.username}`);
    }

    await walletService.processTransaction({
      userId: user.id,
      assetType: "GOLD",
      amount: 5000,
      referenceId: `INITIAL_FUNDING_${user.id}`,
      type: "BONUS",
    });

    console.log(`✅ Funded ${user.username} (${user.id}) with 5000 GOLD.`);
  }
}

async function run() {
  try {
    await seed();
    console.log("✅ Seed script finished successfully.");
  } catch (err) {
    console.error("❌ Seed script crashed:", err);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit();
  }
}

run();
