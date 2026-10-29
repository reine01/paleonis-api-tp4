require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const connectMongo = require("./config/mongo");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());

app.use("/api/datacenters", require("./routes/datacenterRoutes"));

app.use(errorHandler);

async function start() {
  try {
    await pool.query("SELECT NOW()");
    console.log("Connecté à PostgreSQL");
    await connectMongo();
    app.listen(process.env.PORT, () =>
      console.log(`API sur http://localhost:${process.env.PORT}`)
    );
  } catch (err) {
    console.error("Démarrage impossible :", err);
    process.exit(1);
  }
}

start();