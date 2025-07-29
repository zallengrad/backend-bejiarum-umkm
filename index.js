// index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const umkmRoutes = require("./routes/umkmRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/umkm", umkmRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
