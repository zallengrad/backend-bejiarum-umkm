// backend/utils/supabaseClient.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Pastikan dotenv sudah di-require untuk membaca .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // Umumnya pakai ini untuk anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Jika Anda punya service_role key untuk backend (lebih aman)

// ✨ TAMBAHKAN LOG INI! ✨
console.log("\n--- DEBUG BACKEND SUPABASE CLIENT ---");
console.log("Variabel Lingkungan (.env) yang Terbaca:");
console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? "[Key Ada]" : "[Key TIDAK ADA!]"); // Jangan tampilkan key penuh
console.log("SUPABASE_SERVICE_KEY:", supabaseServiceKey ? "[Key Ada]" : "[Key TIDAK ADA!]"); // Jangan tampilkan key penuh

if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
  console.error("🚨🚨 ERROR: Pastikan SUPABASE_URL dan minimal satu dari SUPABASE_ANON_KEY atau SUPABASE_SERVICE_KEY ada di file .env backend Anda!");
  // Anda bisa tambahkan process.exit(1); di sini agar server berhenti jika konfigurasi salah
}

// Gunakan key yang paling aman (service key) jika tersedia, jika tidak, gunakan anon key
const keyToUse = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, keyToUse);

console.log("Supabase Client Terinisialisasi.");
console.log("--- END DEBUG BACKEND SUPABASE CLIENT ---\n");

module.exports = supabase;
