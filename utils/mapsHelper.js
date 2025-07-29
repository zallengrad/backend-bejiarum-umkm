// backend/utils/mapsHelper.js
const axios = require("axios");

// Fungsi yang sudah ada (untuk URL Maps standar)
const extractLatLngFromGoogleMapsUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  let lat = null;
  let lng = null;

  // Pola yang sudah ada: /@lat,lng,zoom, ?q=lat,lng, /place/.../@lat,lng
  const coordsMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/) || url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/) || url.match(/\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);

  if (coordsMatch && coordsMatch.length >= 3) {
    lat = parseFloat(coordsMatch[1]);
    lng = parseFloat(coordsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`  Extracted from standard format: ${lat}, ${lng}`);
      return { lat, lng };
    }
  }

  // Pola untuk query=lat,lng (misal dari googleusercontent redirect)
  const googleSearchQueryMatch = url.match(/[?&]query=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (googleSearchQueryMatch && googleSearchQueryMatch.length >= 3) {
    lat = parseFloat(googleSearchQueryMatch[1]);
    lng = parseFloat(googleSearchQueryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`  Extracted from Google Search Query format: ${lat}, ${lng}`);
      return { lat, lng };
    }
  }

  return null;
};

// Fungsi Geocoding menggunakan OpenStreetMap Nominatim (sudah ada)
const geocodeWithNominatim = async (query) => {
  if (!query || query.trim() === "") {
    return null;
  }
  console.log(`  Attempting geocoding with Nominatim for query: "${query}"`);
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await axios.get(nominatimUrl, {
      headers: {
        "User-Agent": "UMKMMapsBejiarumApp/1.0 (contact@your-email.com)", // Penting untuk Nominatim! Ganti email
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`  Nominatim successful: ${lat}, ${lng} for "${query}"`);
        return { lat, lng };
      }
    }
    console.warn(`  Nominatim failed to find coordinates for "${query}".`);
    return null;
  } catch (error) {
    console.error(`  Error calling Nominatim API for "${query}":`, error.message);
    return null;
  }
};

const resolveShortMapsUrl = async (shortUrl) => {
  try {
    console.log(`Backend: Mencoba meresolve URL pendek: ${shortUrl}`);
    const response = await axios.get(shortUrl, {
      maxRedirects: 10,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const longUrl = response.request.res.responseUrl || response.request.responseURL || response.headers.location;
    console.log(`Backend: URL panjang final setelah redirect: ${longUrl}`);

    if (longUrl) {
      let coords = extractLatLngFromGoogleMapsUrl(longUrl);
      console.log(`Backend: Hasil extractLatLngFromGoogleMapsUrl (langsung):`, coords);

      if (coords) {
        return { ...coords, longUrl };
      }

      // ✨ BARU: Jika ekstraksi langsung gagal, coba ekstrak nama/alamat dan pakai Nominatim ✨
      let potentialQuery = null;
      try {
        const urlObj = new URL(longUrl);
        // Coba ekstrak dari path, misal '/place/Nama+Tempat'
        const pathSegments = urlObj.pathname.split("/").filter((s) => s);
        if (pathSegments.length > 1 && pathSegments[0].toLowerCase() === "place" && pathSegments[1]) {
          potentialQuery = decodeURIComponent(pathSegments[1].replace(/\+/g, " "));
        } else if (pathSegments.length > 0) {
          // Coba segmen terakhir jika terlihat seperti nama (bukan koordinat)
          const lastSegment = pathSegments[pathSegments.length - 1];
          if (!lastSegment.match(/^-?\d+\.\d+,-?\d+\.\d+$/) && lastSegment.length > 3) {
            potentialQuery = decodeURIComponent(lastSegment.replace(/\+/g, " "));
          }
        }
        // Coba ekstrak dari query parameter 'q'
        const queryParamQ = urlObj.searchParams.get("q");
        if (queryParamQ) {
          potentialQuery = queryParamQ;
        }
      } catch (e) {
        console.warn("Backend: Gagal mengurai URL untuk Nominatim query:", e.message);
      }

      if (potentialQuery) {
        console.log(`Backend: Potensi query untuk Nominatim: "${potentialQuery}"`);
        coords = await geocodeWithNominatim(potentialQuery);
        if (coords) {
          return { ...coords, longUrl };
        }
      }
    }
    console.warn(`Backend: Tidak dapat mengekstrak koordinat dari URL final (setelah semua upaya): ${longUrl}`);
    return null;
  } catch (error) {
    console.error(`Backend: Gagal meresolve URL pendek ${shortUrl}:`, error.message);
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
