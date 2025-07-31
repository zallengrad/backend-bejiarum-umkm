// backend/utils/supabaseClient.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Memastikan variabel lingkungan dari .env dibaca

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Kunci penting untuk backend

// Log untuk debugging (bisa dihapus nanti jika sudah yakin)
console.log("\n--- DEBUG BACKEND SUPABASE CLIENT ---");
console.log("Variabel Lingkungan (.env) yang Terbaca:");
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? "[Key Ada]" : "[Key TIDAK ADA!]");
console.log("SUPABASE_SERVICE_KEY:", supabaseServiceKey ? "[Key Ada]" : "[Key TIDAK ADA!]");

if (!supabaseUrl || !supabaseServiceKey) {
  // Pastikan service key ada untuk backend
  console.error("🚨🚨 ERROR: Pastikan SUPABASE_URL dan SUPABASE_SERVICE_KEY ada di file .env backend Anda!");
  // Disarankan untuk menghentikan proses jika konfigurasi penting tidak ada
  // process.exit(1);
}

// Gunakan service_role key untuk backend karena memiliki izin admin penuh dan bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("Supabase Client Backend Terinisialisasi.");
console.log("--- END DEBUG BACKEND SUPABASE CLIENT ---\n");

module.exports = supabase;
