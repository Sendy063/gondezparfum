import { Request, Response } from "express";

import { db } from "../config/db";

// ======================
// GET SEMUA PRODUK
// ======================

export const getProduk = async (req: Request, res: Response) => {
  try {
    const [results]: any = await db.query(
      "SELECT * FROM produk ORDER BY id DESC",
    );

    res.json(results);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================
// GET PRODUK BY ID
// ======================

export const getProdukById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const [results]: any = await db.query("SELECT * FROM produk WHERE id = ?", [
      id,
    ]);

    if (results.length === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    res.json(results[0]);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================
// CREATE PRODUK
// ======================

export const createProduk = async (req: any, res: Response) => {
  try {
    const {
      nama,
      kategori,
      deskripsi,
      harga_per_ml,
      harga_beli_per_ml,
      stok_ml,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    // VALIDASI

    if (
      !nama ||
      harga_beli_per_ml === undefined ||
      harga_beli_per_ml === "" ||
      harga_beli_per_ml === null
    ) {
      return res.status(400).json({
        message: "Nama & harga beli wajib diisi",
      });
    }

    // INSERT

    await db.query(
      `
      INSERT INTO produk
      (
        nama,
        kategori,
        deskripsi,
        harga_per_ml,
        harga_beli_per_ml,
        stok_ml,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nama,
        kategori,
        deskripsi,
        harga_per_ml,
        harga_beli_per_ml,
        stok_ml,
        image,
      ],
    );

    res.json({
      message: "Produk berhasil ditambahkan",
    });
  } catch (err: any) {
    console.error("CREATE PRODUK ERROR:");
    console.error(err);

    res.status(500).json({
      error: err.message,
      sqlMessage: err.sqlMessage,
      code: err.code,
    });
  }
};

// ======================
// UPDATE PRODUK
// ======================

export const updateProduk = async (req: any, res: Response) => {
  try {
    const id = req.params.id;

    const { nama, kategori, deskripsi, harga_per_ml, stok_ml } = req.body;

    const image = req.file ? req.file.filename : null;

    let query = `
      UPDATE produk SET
        nama = COALESCE(?, nama),
        kategori = COALESCE(?, kategori),
        deskripsi = COALESCE(?, deskripsi),
        harga_per_ml = COALESCE(?, harga_per_ml),
        stok_ml = COALESCE(?, stok_ml)
    `;

    let values: any[] = [nama, kategori, deskripsi, harga_per_ml, stok_ml];

    // UPDATE IMAGE

    if (image) {
      query += ", image = ?";

      values.push(image);
    }

    // WHERE

    query += " WHERE id = ?";

    values.push(id);

    await db.query(query, values);

    res.json({
      message: "Produk berhasil diupdate",
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================
// RESTOCK PRODUK
// ======================

export const restockProduk = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const { stok_ml } = req.body;

    // VALIDASI

    if (!stok_ml) {
      return res.status(400).json({
        message: "Jumlah restock wajib diisi",
      });
    }

    // UPDATE STOK

    await db.query(
      `
      UPDATE produk
      SET stok_ml = stok_ml + ?
      WHERE id = ?
      `,
      [stok_ml, id],
    );

    res.json({
      message: "Restock berhasil",
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================
// DELETE PRODUK
// ======================

export const deleteProduk = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await db.query("DELETE FROM produk WHERE id=?", [id]);

    res.json({
      message: "Produk berhasil dihapus",
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};
