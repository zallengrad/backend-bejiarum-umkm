// backend/routes/mapsRoutes.js
const express = require("express");
const router = express.Router();
const { getLatLngFromMapsUrl } = require("../controllers/mapsController");

router.get("/resolve", getLatLngFromMapsUrl);

module.exports = router;
