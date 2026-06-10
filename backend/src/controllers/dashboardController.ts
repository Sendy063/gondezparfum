import { Request, Response } from "express";
import { db } from "../config/db";

export const getDashboardData =
async (
req: Request,
res: Response
) => {
try {
const [produk]: any =
await db.query(`           SELECT COUNT(*) total_produk
          FROM produk
        `);

  const [penjualan]: any =
    await db.query(`
      SELECT
        SUM(total_harga) total_penjualan
      FROM transaksi
    `);

  const [stokMenipis]: any =
    await db.query(`
      SELECT COUNT(*) total
      FROM produk
      WHERE stok_ml <= 100
    `);

  const [laba]: any =
    await db.query(`
      SELECT
        SUM(
          (
            dt.harga_per_ml
            -
            p.harga_beli_per_ml
          )
          * dt.qty_ml
        ) total_laba
      FROM detail_transaksi dt
      JOIN produk p
      ON p.id = dt.produk_id
    `);

  const [produkTerlaris]: any =
    await db.query(`
      SELECT
        p.nama,
        SUM(dt.qty_ml) total_terjual
      FROM detail_transaksi dt
      JOIN produk p
      ON p.id = dt.produk_id
      GROUP BY p.id
      ORDER BY total_terjual DESC
      LIMIT 5
    `);

  res.json({
    total_produk:
      produk[0].total_produk || 0,

    total_penjualan:
      penjualan[0]
        .total_penjualan || 0,

    total_laba:
      laba[0].total_laba || 0,

    stok_menipis:
      stokMenipis[0].total || 0,

    produk_terlaris:
      produkTerlaris,
  });
} catch (err: any) {
  res.status(500).json({
    error: err.message,
  });
}

};
