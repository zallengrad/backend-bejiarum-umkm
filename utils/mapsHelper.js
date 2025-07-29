// backend/utils/mapsHelper.js
const axios = require("axios"); // Pastikan axios sudah diinstal: npm install axios

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
      console.log(`  Extracted from @ format: ${lat}, ${lng}`);
      return { lat, lng };
    }
  }

  // --- Format Q (query): maps?q=lat,lng ---
  const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (queryMatch && queryMatch.length >= 3) {
    lat = parseFloat(queryMatch[1]);
    lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`  Extracted from ?q format: ${lat}, ${lng}`);
      return { lat, lng };
    }
  }

  // --- Format Embed/Place ID: /place/.../@lat,lng ---
  const placeMatch = url.match(/\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (placeMatch && placeMatch.length >= 3) {
    lat = parseFloat(placeMatch[1]);
    lng = parseFloat(placeMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`  Extracted from /place format: ${lat}, ${lng}`);
      return { lat, lng };
    }
  }

  // ✨ PERBAIKAN DI SINI: COBA EKSTRAK DARI FORMAT GOOGLEUSERCONTENT.COM KHUSUS (jika mengandung koordinat) ✨
  // Ini adalah pola yang mungkin muncul dari redirect setelah googl.gl/maps
  // Contoh: https://www.google.com/maps/search/?api=1&query=-7.360000,109.942000
  // Contoh lain: https://www.google.com/maps/place/Cireng+dhiptha+al-azhar/@-7.360000,109.942000,17z
  const googleSearchQueryMatch = url.match(/[?&]query=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (googleSearchQueryMatch && googleSearchQueryMatch.length >= 3) {
    lat = parseFloat(googleSearchQueryMatch[1]);
    lng = parseFloat(googleSearchQueryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`  Extracted from Google Search Query format: ${lat}, ${lng}`);
      return { lat, lng };
    }
  }

  console.warn("  WARNING: Could not extract lat/lng from URL:", url);
  return null;
};

const resolveShortMapsUrl = async (shortUrl) => {
  try {
    console.log(`Backend: Mencoba meresolve URL pendek: ${shortUrl}`);
    const response = await axios.get(shortUrl, {
      // Tetap gunakan axios.get
      maxRedirects: 10,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const longUrl = response.request.res.responseUrl || response.request.responseURL || response.headers.location;
    console.log(`Backend: URL panjang final setelah redirect: ${longUrl}`); // ✨ LOG INI ✨

    if (longUrl) {
      const coords = extractLatLngFromGoogleMapsUrl(longUrl);
      console.log(`Backend: Hasil extractLatLngFromGoogleMapsUrl:`, coords); // ✨ LOG INI ✨
      if (coords) {
        return { ...coords, longUrl };
      }
    }
    console.warn(`Backend: Tidak dapat mengekstrak koordinat dari URL final: ${longUrl}`); // ✨ LOG INI ✨
    return null;
  } catch (error) {
    console.error(`Backend: Gagal meresolve URL pendek ${shortUrl}:`, error.message);
    if (error.response) {
      console.error(`Backend: Status respons: ${error.response.status}`);
      console.error(`Backend: Data respons: ${JSON.response.data}`);
    }
    return null;
  }
};

module.exports = {
  extractLatLngFromGoogleMapsUrl,
  resolveShortMapsUrl,
};
