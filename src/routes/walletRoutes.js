const router = require("express").Router();
const controller = require("../controllers/walletController");
const validate = require("../middlewares/validate");

router.get("/:userId/balance", (req, res) => controller.getBalance(req, res));

router.post("/topup", validate, (req, res) =>
  controller.handleFlow("PURCHASE", req, res),
);

router.post("/bonus", validate, (req, res) =>
  controller.handleFlow("BONUS", req, res),
);

router.post("/spend", validate, (req, res) =>
  controller.handleFlow("SPEND", req, res),
);

module.exports = router;
