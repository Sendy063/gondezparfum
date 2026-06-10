import { Request, Response } from "express";
import { db } from "../config/db";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// ======================
// LAPORAN PENJUALAN
// ======================

export const getLaporanPenjualan =
async (
req: Request,
res: Response
) => {
try {
  const {
    startDate,
    endDate,
  } = req.query;

  let query = `
    SELECT *
    FROM transaksi
  `;

  const params: any[] = [];

  if (
    startDate &&
    endDate
  ) {
    query += `
      WHERE DATE(created_at)
      BETWEEN ? AND ?
    `;

    params.push(
      startDate,
      endDate
    );
  }

  query += `
    ORDER BY created_at DESC
  `;

  const [rows]: any =
    await db.query(
      query,
      params
    );

  res.json(rows);

} catch (err: any) {

  res.status(500).json({
    error:
      err.message,
  });
}
};


// ======================
// LAPORAN LABA RUGI
// ======================

export const getLaporanLabaRugi = async (
req: Request,
res: Response
) => {
try {
const [rows]: any = await db.query(`
SELECT
dt.nama_produk,
dt.qty_ml,
p.harga_beli_per_ml,
dt.harga_per_ml,

    (p.harga_beli_per_ml * dt.qty_ml) AS modal,

    (dt.harga_per_ml * dt.qty_ml) AS penjualan,

    (
      (dt.harga_per_ml - p.harga_beli_per_ml)
      * dt.qty_ml
    ) AS laba

  FROM detail_transaksi dt
  JOIN produk p
  ON dt.produk_id = p.id
`);

const totalModal =
  rows.reduce(
    (acc: number, item: any) =>
      acc + Number(item.modal),
    0
  );

const totalPenjualan =
  rows.reduce(
    (acc: number, item: any) =>
      acc + Number(item.penjualan),
    0
  );

const totalLaba =
  rows.reduce(
    (acc: number, item: any) =>
      acc + Number(item.laba),
    0
  );

res.json({
  total_modal: totalModal,
  total_penjualan: totalPenjualan,
  total_laba: totalLaba,
  detail: rows,
});

} catch (err: any) {
res.status(500).json({
error: err.message,
});
}
};


// ======================
// HELPER: LOGIKA FILTER WAKTU UNTUK SQL
// ======================
const dapatkanKueriFilterWaktu = (filterType: string) => {
  let kondisiSaring = "";

  switch (filterType) {
    case "day":
      // Filter khusus hari ini saja
      kondisiSaring = "WHERE DATE(created_at) = CURDATE()";
      break;
    case "week":
      // Filter dari hari Minggu/Senin awal minggu ini sampai hari ini
      kondisiSaring = "WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)";
      break;
    case "month":
      // Filter khusus bulan berjalan di tahun berjalan
      kondisiSaring = "WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
      break;
    case "year":
      // Filter khusus tahun berjalan saja
      kondisiSaring = "WHERE YEAR(created_at) = YEAR(CURDATE())";
      break;
    default:
      // Jika "all" atau kosong, tidak perlu menambahkan klausa WHERE (ambil semua data)
      kondisiSaring = "";
      break;
  }

  return kondisiSaring;
};

// ======================
// EXPORT EXCEL (TERFILTER)
// ======================
export const exportExcel = async (req: Request, res: Response) => {
  try {
    // 1. Ambil parameter filter dari URL (contoh: /export-excel?filter=month)
    const filterType = (req.query.filter as string) || "all";
    const klausaSaring = dapatkanKueriFilterWaktu(filterType);

    // 2. Masukkan klausa saring dinamis ke dalam query SQL
    const [rows]: any = await db.query(`
      SELECT 
        invoice,
        nama_customer,
        total_harga,
        total_item,
        metode_pembayaran,
        created_at
      FROM transaksi
      ${klausaSaring}
      ORDER BY created_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Penjualan");

    worksheet.columns = [
      { header: "Invoice", key: "invoice", width: 25 },
      { header: "Customer", key: "nama_customer", width: 25 },
      { header: "Total Harga", key: "total_harga", width: 20 },
      { header: "Total Item", key: "total_item", width: 15 },
      { header: "Metode", key: "metode_pembayaran", width: 20 },
      { header: "Tanggal", key: "created_at", width: 25 },
    ];

    rows.forEach((item: any) => {
      worksheet.addRow(item);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan_penjualan_${filterType}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================
// EXPORT PDF (TERFILTER)
// ======================
export const exportPDF = async (req: Request, res: Response) => {
  try {
    // 1. Ambil parameter filter dari URL (contoh: /export-pdf?filter=day)
    const filterType = (req.query.filter as string) || "all";
    const klausaSaring = dapatkanKueriFilterWaktu(filterType);

    // 2. Jalankan query SQL dengan filter dinamis
    const [rows]: any = await db.query(`
      SELECT 
        invoice,
        nama_customer,
        total_harga
      FROM transaksi
      ${klausaSaring}
      ORDER BY created_at DESC
    `);

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan_penjualan_${filterType}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Laporan Penjualan Gondez Parfum", { align: "center" });
    doc.fontSize(12).text(`Kategori Filter: ${filterType.toUpperCase()}`, { align: "center" });
    doc.moveDown();

    rows.forEach((item: any) => {
      doc.text(
        `${item.invoice} | ${item.nama_customer} | Rp ${Number(item.total_harga).toLocaleString("id-ID")}`
      );
    });

    doc.end();
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};