// backend/utils/mapsHelper.js
const axios = require("axios"); // Pastikan axios sudah diinstal: npm install axios

/**
 * Mengekstrak latitude dan longitude dari berbagai format URL Google Maps (termasuk hasil redirect).
 * @param {string} url - URL Google Maps (panjang)
 * @returns {{lat: number, lng: number}|null} Objek berisi lat dan lng, atau null jika tidak ditemukan.
 */
const extractLatLngFromGoogleMapsUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  let lat = null;
  let lng = null;

  // --- Format Umum: /@lat,lng,zoom ---
  const coordsMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (coordsMatch && coordsMatch.length >= 3) {
    lat = parseFloat(coordsMatch[1]);
    lng = parseFloat(coordsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // --- Format Q (query): maps?q=lat,lng ---
  const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (queryMatch && queryMatch.length >= 3) {
    lat = parseFloat(queryMatch[1]);
    lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // --- Format Embed/Place ID: /place/.../@lat,lng ---
  const placeMatch = url.match(/\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (placeMatch && placeMatch.length >= 3) {
    lat = parseFloat(placeMatch[1]);
    lng = parseFloat(placeMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  return null;
};

/**
 * Mengikuti redirect dari URL pendek Google Maps dan mengekstrak lat/lng dari URL final.
 * @param {string} shortUrl - URL pendek Google Maps (misal: https://maps.app.goo.gl/...)
 * @returns {Promise<{lat: number, lng: number, longUrl: string}|null>} Objek berisi lat, lng, dan longUrl, atau null.
 */
const resolveShortMapsUrl = async (shortUrl) => {
  try {
    console.log(`Backend: Mencoba meresolve URL pendek: ${shortUrl}`);
    // ✨ PERBAIKAN DI SINI: Ganti axios.head() menjadi axios.get() ✨
    const response = await axios.get(shortUrl, {
      maxRedirects: 10,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    // Periksa response.request.res.responseUrl untuk URL final setelah redirect
    const longUrl = response.request.res.responseUrl || response.request.responseURL || response.headers.location; // Fallback untuk berbagai lingkungan axios
    console.log(`Backend: URL panjang ditemukan: ${longUrl}`);

    if (longUrl) {
      const coords = extractLatLngFromGoogleMapsUrl(longUrl);
      if (coords) {
        return { ...coords, longUrl };
      }
    }
    return null;
  } catch (error) {
    console.error(`Backend: Gagal meresolve URL pendek ${shortUrl}:`, error.message);
    // Jika error, cek response.status untuk melihat apakah ada 400/500
    if (error.response) {
      console.error(`Backend: Status respons: ${error.response.status}`);
      console.error(`Backend: Data respons: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
};

module.exports = {
  extractLatLngFromGoogleMapsUrl,
  resolveShortMapsUrl,
};
