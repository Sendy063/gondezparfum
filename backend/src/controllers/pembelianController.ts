import { Request, Response } from "express";
import { db } from "../config/db";

// ==========================================
// 1. CREATE PEMBELIAN (DENGAN TRANSACTION)
// ==========================================
export const createPembelian = async (req: Request, res: Response) => {
  // Menggunakan koneksi khusus dari pool untuk menghandle database transaction
  const connection = await db.getConnection();

  try {
    const { supplier_id, items, total_harga } = req.body;
    const invoice = `PB-${Date.now()}`;

    // Mulai transaksi database aman
    await connection.beginTransaction();

    // Insert ke tabel induk pembelian
    const [result]: any = await connection.query(
      `
      INSERT INTO pembelian (invoice_pembelian, supplier_id, total_harga)
      VALUES (?, ?, ?)
      `,
      [invoice, supplier_id, total_harga],
    );

    const pembelianId = result.insertId;

    // Loop data item belanja
    for (const item of items) {
      // Insert detail transaksi item
      await connection.query(
        `
        INSERT INTO detail_pembelian (pembelian_id, produk_id, qty_ml, harga_beli_per_ml, subtotal)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          pembelianId,
          item.produk_id,
          item.qty_ml,
          item.harga_beli_per_ml,
          item.subtotal,
        ],
      );

      // Otomatis restock tambahkan stok parfum ke tabel produk
      await connection.query(
        `
        UPDATE produk 
        SET stok_ml = stok_ml + ? 
        WHERE id = ?
        `,
        [item.qty_ml, item.produk_id],
      );
    }

    // Jika seluruh proses aman tanpa error, simpan permanen ke database
    await connection.commit();

    res.json({
      message: "Pembelian dan restock produk berhasil disimpan",
    });
  } catch (err: any) {
    // Jika ada satu saja baris yang gagal, batalkan seluruh rangkaian database diatas
    await connection.rollback();

    res.status(500).json({
      error: err.message,
    });
  } finally {
    // Kembalikan koneksi ke pool
    connection.release();
  }
};

// ==========================================
// 2. GET PEMBELIAN (DISESUAIKAN UNTUK FRONTEND)
// ==========================================
export const getPembelian = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        p.id,
        p.invoice_pembelian AS invoice_no,
        p.created_at,
        p.supplier_id,
        p.total_harga,
        s.nama_supplier AS supplier_nama,
        (SELECT COUNT(*) FROM detail_pembelian dp WHERE dp.pembelian_id = p.id) AS items_count
      FROM pembelian p
      JOIN supplier s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// Tambahkan di file controller yang sama

export const getPembelianById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Header transaksi
    const [pembelianRows]: any = await db.query(
      `
      SELECT 
        p.id,
        p.invoice_pembelian AS invoice_no,
        p.created_at,
        p.supplier_id,
        p.total_harga,
        s.nama_supplier AS supplier_nama
      FROM pembelian p
      JOIN supplier s ON p.supplier_id = s.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (pembelianRows.length === 0) {
      return res.status(404).json({ error: "Pembelian tidak ditemukan" });
    }

    const pembelian = pembelianRows[0];

    // Detail items - perhatikan alias `nama` dari tabel produk
    const [detailRows]: any = await db.query(
      `
      SELECT 
        dp.id,
        dp.produk_id,
        dp.qty_ml AS quantity_ml,
        dp.harga_beli_per_ml AS harga_satuan,
        dp.subtotal,
        pr.nama AS produk_nama
      FROM detail_pembelian dp
      JOIN produk pr ON dp.produk_id = pr.id
      WHERE dp.pembelian_id = ?
      `,
      [id]
    );

    pembelian.items = detailRows;

    res.json(pembelian);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
