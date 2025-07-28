const { getAllUMKMs, createUMKM, updateUMKM, deleteUMKM, getUMKMById } = require("../models/umkmModel"); // ✨ IMPORT FUNGSI BARU INI! ✨

const getAll = async (req, res) => {
  try {
    const data = await getAllUMKMs();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✨ TAMBAHKAN FUNGSI INI! ✨
const getById = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari parameter URL
    const data = await getUMKMById(id);
    if (!data) {
      // Jika data tidak ditemukan
      return res.status(404).json({ error: "UMKM tidak ditemukan." });
    }
    res.json(data);
  } catch (err) {
    console.error("Error getting UMKM by ID:", err); // Tambahkan logging
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await createUMKM(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await updateUMKM(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const data = await deleteUMKM(req.params.id);
    res.json({ message: "Deleted", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUMKM: getAll,
  getUMKMById: getById, // ✨ EKSPOR FUNGSI BARU INI! ✨
  createUMKM: create,
  updateUMKM: update,
  deleteUMKM: remove,
};
