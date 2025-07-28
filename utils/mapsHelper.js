// backend/utils/mapsHelper.js
const axios = require("axios"); // Kita akan pakai axios untuk request HTTP, instal dulu kalau belum: npm install axios

/**
 * Mengekstrak latitude dan longitude dari berbagai format URL Google Maps (termasuk hasil redirect).
 * Fungsi ini sama dengan yang di frontend, tapi kita juga butuh di backend.
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
    // Melakukan HEAD request untuk mengikuti redirect tanpa mengunduh konten
    const response = await axios.head(shortUrl, {
      maxRedirects: 10, // Batasi jumlah redirect yang diikuti
      validateStatus: (status) => status >= 200 && status < 400, // Ikuti hanya status redirect yang valid
    });

    const longUrl = response.request.res.responseUrl || response.headers.location; // Ambil URL final setelah redirect
    console.log(`Backend: URL panjang ditemukan: ${longUrl}`);

    if (longUrl) {
      const coords = extractLatLngFromGoogleMapsUrl(longUrl);
      if (coords) {
        return { ...coords, longUrl }; // Mengembalikan koordinat dan URL panjangnya
      }
    }
    return null; // Tidak dapat mengekstrak koordinat
  } catch (error) {
    console.error(`Backend: Gagal meresolve URL pendek ${shortUrl}:`, error.message);
    return null;
  }
};

module.exports = {
  extractLatLngFromGoogleMapsUrl, // Mungkin tidak terpakai langsung, tapi bagus untuk konsistensi
  resolveShortMapsUrl,
};
