require("dotenv").config(); 
const express = require("express");
const connectDB = require("./src/infrastructure/db.js");

const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("MongoDB connection test!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
