const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const personRoutes = require("./routes/personRoutes");
const relationshipRoutes = require("./routes/relationshipRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/person", personRoutes);
app.use("/relationship", relationshipRoutes);

module.exports = app;
