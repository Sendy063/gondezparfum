// src/controllers/produkController.ts
import { Request, Response } from "express";
import { db } from "../config/db";

// GET semua produk
export const getProduk = (req: Request, res: Response) => {
  db.query("SELECT * FROM produk ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET produk by ID
export const getProdukById = (req: Request, res: Response) => {
  const id = req.params.id;

  db.query("SELECT * FROM produk WHERE id = ?", [id], (err, results: any) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json(results[0]);
  });
};

// CREATE produk (dengan gambar)
export const createProduk = (req: any, res: Response) => {
  const { nama, kategori, deskripsi, harga_per_ml, stok_ml } = req.body;

  // ambil file gambar
  const image = req.file ? req.file.filename : null;

  if (!nama || !harga_per_ml) {
    return res.status(400).json({ message: "Nama & harga wajib diisi" });
  }

  db.query(
    `INSERT INTO produk 
    (nama, kategori, deskripsi, harga_per_ml, stok_ml, image) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [nama, kategori, deskripsi, harga_per_ml, stok_ml, image],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Produk berhasil ditambahkan" });
    }
  );
};

//Update produk (dengan gambar)
export const updateProduk = (req: any, res: Response) => {
  const id = req.params.id;

  const {
    nama,
    kategori,
    deskripsi,
    harga_per_ml,
    stok_ml,
  } = req.body;

  const image = req.file ? req.file.filename : null;

  let query = `UPDATE produk SET 
    nama = COALESCE(?, nama),
    kategori = COALESCE(?, kategori),
    deskripsi = COALESCE(?, deskripsi),
    harga_per_ml = COALESCE(?, harga_per_ml),
    stok_ml = COALESCE(?, stok_ml)
  `;

  let values: any[] = [
    nama,
    kategori,
    deskripsi,
    harga_per_ml,
    stok_ml,
  ];

  if (image) {
    query += ", image = ?";
    values.push(image);
  }

  query += " WHERE id = ?";
  values.push(id);

  db.query(query, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({ message: "Update berhasil" });
  });
};

// DELETE produk
export const deleteProduk = (req: Request, res: Response) => {
  const id = req.params.id;

  db.query("DELETE FROM produk WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Produk berhasil dihapus" });
  });
};