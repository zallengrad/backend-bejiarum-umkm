// backend/models/umkmModel.js
const supabase = require("../utils/supabaseClient"); // Pastikan ini mengimpor instance Supabase

// Get all UMKMs (tidak berubah)
const getAllUMKMs = async () => {
  const { data, error } = await supabase.from("umkms").select("*").order("id", { ascending: true });
  if (error) throw error;
  return data;
};

// Get UMKM by ID (tidak berubah)
const getUMKMById = async (id) => {
  const { data, error } = await supabase.from("umkms").select("*").eq("id", id).single();
  if (error) {
    console.error("Error fetching UMKM by ID in model:", error);
    throw error;
  }
  return data;
};

// Create new UMKM (tidak berubah)
const createUMKM = async (newData) => {
  const { data, error } = await supabase.from("umkms").insert([newData]).select();
  if (error) throw error;
  return data[0];
};

// Update UMKM by id (tidak berubah)
const updateUMKM = async (id, updatedData) => {
  const { data, error } = await supabase.from("umkms").update(updatedData).eq("id", id).select();
  if (error) throw error;
  return data[0];
};

// ✨ REVISI FUNGSI deleteUMKM UNTUK MENGHAPUS FOTO DARI STORAGE DAN DEBUGGING! ✨
const deleteUMKM = async (id) => {
  console.log("\n--- DEBUG UMKM MODEL (deleteUMKM) ---");
  console.log(`Memulai proses penghapusan UMKM dengan ID: ${id}`);

  // Langkah 1: Ambil data UMKM terlebih dahulu untuk mendapatkan URL fotonya
  const { data: umkmToDelete, error: fetchError } = await supabase
    .from("umkms")
    .select("photos") // Hanya ambil kolom 'photos'
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("🚨 Error fetching UMKM for photo deletion:", fetchError);
    throw fetchError;
  }
  if (!umkmToDelete) {
    console.warn(`⚠️ UMKM dengan ID ${id} tidak ditemukan di database.`);
    throw new Error("UMKM tidak ditemukan untuk dihapus.");
  }

  const photoUrls = umkmToDelete.photos;
  const UPLOAD_BUCKET = "umkm-photos"; // ✨ PASTIKAN NAMA BUCKET INI SAMA PERSIS DI SUPABASE STORAGE-MU! ✨
  // Contoh: 'your-bucket-name'

  console.log("UMKM yang ditemukan untuk dihapus:", umkmToDelete);
  console.log("URL Foto dari database:", photoUrls);
  console.log("Bucket yang akan digunakan untuk penghapusan:", UPLOAD_BUCKET);

  // Langkah 2: Hapus foto-foto dari Supabase Storage
  if (photoUrls && photoUrls.length > 0) {
    const filePathsToDelete = [];
    photoUrls.forEach((url) => {
      // Ekstrak path file dari URL publik
      // Contoh URL: https://bzdzdskxewmbogjwcale.supabase.co/storage/v1/object/public/umkm-photos/umkm/12345-foto.jpg
      // Kita butuh bagian 'umkm/12345-foto.jpg'
      const pathSegments = url.split("/");
      const publicIndex = pathSegments.indexOf("public");
      const bucketIndex = pathSegments.indexOf(UPLOAD_BUCKET); // Pastikan UPLOAD_BUCKET ada di path

      if (publicIndex !== -1 && bucketIndex !== -1 && bucketIndex > publicIndex && pathSegments.length > bucketIndex + 1) {
        // Gabungkan segmen path setelah nama bucket (misal: 'umkm/12345-foto.jpg')
        const filePath = pathSegments.slice(bucketIndex + 1).join("/");
        filePathsToDelete.push(filePath);
      } else {
        console.warn(`⚠️ Gagal mengekstrak path file dari URL: ${url}. Pastikan URL formatnya benar dan mengandung '/public/${UPLOAD_BUCKET}/'.`);
      }
    });

    console.log("Path file yang diekstrak untuk dihapus:", filePathsToDelete);

    if (filePathsToDelete.length > 0) {
      console.log(`⏳ Mencoba menghapus ${filePathsToDelete.length} file dari Supabase Storage...`);
      const { error: storageError } = await supabase.storage.from(UPLOAD_BUCKET).remove(filePathsToDelete);

      if (storageError) {
        console.error("🚨 Error menghapus foto dari Storage:", storageError);
        console.error("Detail Storage Error Code:", storageError.code);
        console.error("Detail Storage Error Message:", storageError.message);
        // Penting: Throw error ini untuk menghentikan proses jika penghapusan storage gagal.
        throw new Error(`Gagal menghapus foto dari Storage: ${storageError.message || "Unknown Storage error"}`);
      }
      console.log("✅ Foto-foto berhasil dihapus dari Supabase Storage.");
    } else {
      console.log("Tidak ada file foto yang valid untuk dihapus dari Storage.");
    }
  } else {
    console.log("Tidak ada URL foto yang ditemukan di data UMKM ini.");
  }

  // Langkah 3: Hapus data UMKM dari database
  console.log(`⏳ Mencoba menghapus data UMKM dengan ID ${id} dari database...`);
  const { data, error } = await supabase.from("umkms").delete().eq("id", id).select();

  if (error) {
    console.error("🚨 Error menghapus UMKM dari database:", error);
    throw error;
  }
  console.log("✅ Data UMKM berhasil dihapus dari database.");
  console.log("--- END DEBUG UMKM MODEL (deleteUMKM) ---\n");
  return data[0];
};

module.exports = {
  getAllUMKMs,
  getUMKMById,
  createUMKM,
  updateUMKM,
  deleteUMKM,
};
module.exports = {
  getAllUMKMs,
  getUMKMById,
  createUMKM,
  updateUMKM,
  deleteUMKM,
};
