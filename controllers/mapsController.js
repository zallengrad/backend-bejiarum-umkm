// backend/controllers/mapsController.js
const { resolveShortMapsUrl } = require("../utils/mapsHelper");

const getLatLngFromMapsUrl = async (req, res) => {
  const { url } = req.query; // URL akan dikirim sebagai query parameter: /api/maps/resolve?url=SHORT_LINK

  if (!url) {
    return res.status(400).json({ error: "URL tidak ditemukan di query parameter." });
  }

  try {
    const result = await resolveShortMapsUrl(url);
    if (result) {
      res.json(result); // Mengembalikan { lat, lng, longUrl }
    } else {
      res.status(400).json({ error: "Tidak dapat mengekstrak koordinat dari URL yang diberikan." });
    }
  } catch (error) {
    console.error("Error di mapsController.js:", error);
    res.status(500).json({ error: "Kesalahan server saat memproses URL Maps." });
  }
};

module.exports = {
  getLatLngFromMapsUrl,
};
