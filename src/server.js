require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());

app.use("/api/datacenters", require("./routes/datacenterRoutes"));

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`API sur http://localhost:${process.env.PORT}`);
  pool.query("SELECT NOW()")
    .then(() => console.log("Connecté à PostgreSQL"))
    .catch((err) => console.error("Connexion BDD impossible :", err.message));
});