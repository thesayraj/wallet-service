const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, () => {
  console.log(`wallet service running on Port: ${PORT}`);
});
