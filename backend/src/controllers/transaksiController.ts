import { Request, Response } from "express";
import { db } from "../config/db";

// ======================
// CREATE TRANSAKSI
// ======================
export const createTransaksi = async (req: Request, res: Response) => {
  try {
    const {
      items,
      total_harga,
      total_item,
      metode_pembayaran,
      nama_customer,
      uang_bayar,
    } = req.body;

    // ======================
    // HITUNG KEMBALIAN
    // ======================
    const uang_kembalian = Number(uang_bayar) - Number(total_harga);

    if (uang_kembalian < 0) {
      return res.status(400).json({
        error: "Uang yang dibayarkan kurang!",
      });
    }

    // ======================
    // VALIDASI STOK (PROTEKSI MINUS)
    // ======================
    for (const item of items) {
      // PERBAIKAN: Mengambil kolom 'nama', BUKAN 'nama_produk'
      const [produkRows]: any = await db.query(
        "SELECT stok_ml, nama FROM produk WHERE id = ?",
        [item.id]
      );

      if (produkRows.length === 0) {
        return res.status(404).json({
          error: `Produk dengan ID ${item.id} tidak ditemukan.`,
        });
      }

      const produkAsli = produkRows[0];

      if (produkAsli.stok_ml < item.qty_ml) {
        return res.status(400).json({
          error: `Stok tidak mencukupi untuk parfum "${produkAsli.nama}". Sisa stok: ${produkAsli.stok_ml} ml, permintaan kasir: ${item.qty_ml} ml.`,
        });
      }
    }

    const invoice = `INV-${Date.now()}`;

    // ======================
    // INSERT TRANSAKSI
    // ======================
    const [result]: any = await db.query(
      `
      INSERT INTO transaksi 
      (
        invoice, 
        total_harga, 
        total_item, 
        metode_pembayaran, 
        nama_customer, 
        uang_bayar, 
        uang_kembalian
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        invoice,
        Number(total_harga),
        Number(total_item),
        metode_pembayaran,
        nama_customer || "General Customer",
        Number(uang_bayar),
        uang_kembalian,
      ]
    );

    const transaksiId = result.insertId;

    // ======================
    // INSERT DETAIL & UPDATE STOK
    // ======================
    for (const item of items) {
      // Ambil nama dari properti item.nama atau fallback item.nama_produk
      const namaProdukFix = item.nama || item.nama_produk || "Parfum";

      await db.query(
        `
        INSERT INTO detail_transaksi 
        (
          transaksi_id, 
          produk_id, 
          nama_produk, 
          qty_ml, 
          harga_per_ml, 
          subtotal
        ) 
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          transaksiId,
          item.id,
          namaProdukFix,
          Number(item.qty_ml),
          Number(item.harga_per_ml),
          Number(item.subtotal),
        ]
      );

      // Potong stok parfum
      await db.query(
        `
        UPDATE produk 
        SET stok_ml = stok_ml - ? 
        WHERE id = ?
        `,
        [Number(item.qty_ml), item.id]
      );
    }

    return res.json({
      message: "Transaksi berhasil",
      invoice,
      uang_kembalian,
    });
  } catch (err: any) {
    console.error("ERROR BACKEND CREATE TRANSAKSI:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
};

// ======================
// GET STATISTIK (DENGAN FILTER)
// ======================
export const getStatistikPenjualan = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string; // Membaca query dari frontend (?filter=day)
    let whereClause = "";

    if (filter === "day") {
      whereClause = "WHERE DATE(created_at) = CURDATE()";
    } else if (filter === "month") {
      whereClause = "WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())";
    }

    const [results]: any = await db.query(`
        SELECT 
          COUNT(*) as total_transaksi,
          IFNULL(SUM(total_harga), 0) as total_pendapatan,
          IFNULL(SUM(total_item), 0) as total_item
        FROM transaksi
        ${whereClause}
      `);

    res.json(results[0]);
  } catch (err: any) {
    console.error("ERROR BACKEND GET STATISTIK:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================
// GET TRANSAKSI (DENGAN FILTER)
// ======================
export const getTransaksi = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;
    let whereClause = "";

    if (filter === "day") {
      whereClause = "WHERE DATE(created_at) = CURDATE()";
    } else if (filter === "month") {
      whereClause = "WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())";
    }

    const [transaksiResults]: any = await db.query(`
        SELECT * FROM transaksi 
        ${whereClause}
        ORDER BY created_at DESC
      `);

    const transaksiWithItems = await Promise.all(
      transaksiResults.map(async (transaksi: any) => {
        const [detailResults]: any = await db.query(
          `
          SELECT 
            id,
            nama_produk,
            qty_ml,
            harga_per_ml,
            subtotal
          FROM detail_transaksi 
          WHERE transaksi_id = ?
          `,
          [transaksi.id]
        );

        return {
          ...transaksi,
          items: detailResults,
        };
      })
    );

    res.json(transaksiWithItems);
  } catch (err: any) {
    console.error("ERROR BACKEND GET TRANSAKSI:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};