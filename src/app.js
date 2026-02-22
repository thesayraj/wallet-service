const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const walletRoutes = require("./routes/walletRoutes");

const app = express();

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/wallets", walletRoutes);

module.exports = app;
