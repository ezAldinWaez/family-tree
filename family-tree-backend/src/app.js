const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const treeRoutes = require("./routes/treeRoutes");

require("dotenv").config();

const app = express();

console.log("Connecting to MongoDB ...")
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());

app.use("/tree", treeRoutes);

module.exports = app;
