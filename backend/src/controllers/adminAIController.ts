// import { Request, Response } from "express";
// import { db } from "../config/db";

// export const adminAIChat = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const {
//       message,
//       sessionId,
//     } = req.body;

//     // =========================
//     // SIMPAN CHAT USER
//     // =========================
//     await db.query(
//       `
//       INSERT INTO chat_messages
//       (session_id, sender, message)
//       VALUES (?, ?, ?)
//       `,
//       [sessionId, "user", message]
//     );

//     // =========================
//     // PRODUK TERLARIS
//     // =========================
//     const [bestSelling]: any =
//       await db.query(`
//         SELECT
//           p.nama,
//           SUM(dt.qty_ml) total_terjual
//         FROM detail_transaksi dt
//         JOIN produk p
//           ON p.id = dt.produk_id
//         GROUP BY p.id
//         ORDER BY total_terjual DESC
//         LIMIT 5
//       `);

//     // =========================
//     // STOK MENIPIS
//     // =========================
//     const [lowStock]: any =
//       await db.query(`
//         SELECT
//           nama,
//           stok_ml
//         FROM produk
//         WHERE stok_ml <= 20
//         ORDER BY stok_ml ASC
//       `);

//     // =========================
//     // OMZET
//     // =========================
//     const [sales]: any =
//       await db.query(`
//         SELECT
//           SUM(total_harga) total
//         FROM transaksi
//       `);

//     // =========================
//     // TOTAL TRANSAKSI
//     // =========================
//     const [trx]: any =
//       await db.query(`
//         SELECT COUNT(*) total
//         FROM transaksi
//       `);

//     // =========================
//     // FORMAT DATA
//     // =========================
//     const bestSellingText =
//       bestSelling
//         .map(
//           (p: any) =>
//             `${p.nama} = ${p.total_terjual} ml`
//         )
//         .join("\n");

//     const lowStockText =
//       lowStock
//         .map(
//           (p: any) =>
//             `${p.nama} = ${p.stok_ml} ml`
//         )
//         .join("\n");

//     // =========================
//     // HISTORY CHAT
//     // =========================
//     const [history]: any =
//       await db.query(
//         `
//         SELECT sender, message
//         FROM chat_messages
//         WHERE session_id = ?
//         ORDER BY id DESC
//         LIMIT 10
//         `,
//         [sessionId]
//       );

//     const historyText =
//       history
//         .reverse()
//         .map(
//           (h: any) =>
//             `${h.sender}: ${h.message}`
//         )
//         .join("\n");

//     // =========================
//     // PROMPT AI
//     // =========================
//     const prompt = `
// Anda adalah AI Business Assistant
// untuk toko parfum refill.

// === PRODUK TERLARIS ===
// ${bestSellingText}

// === STOK MENIPIS ===
// ${lowStockText}

// === TOTAL OMZET ===
// Rp ${Number(
//       sales[0].total || 0
//     ).toLocaleString("id-ID")}

// === TOTAL TRANSAKSI ===
// ${trx[0].total}

// === HISTORY CHAT ===
// ${historyText}

// ATURAN:
// - Jawaban singkat
// - Profesional
// - Bahasa Indonesia
// - Fokus bisnis parfum
// - Jangan gunakan markdown

// PERTANYAAN ADMIN:
// ${message}
// `;

// // =========================
// // GEMINI API
// // =========================
// const response = await fetch(
//   `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       contents: [
//         {
//           parts: [
//             {
//               text: prompt,
//             },
//           ],
//         },
//       ],
//     }),
//   }
// );

// const data: any = await response.json();

// const aiReply =
//   data.candidates?.[0]
//     ?.content?.parts?.[0]?.text ||
//   "AI tidak merespon.";

// // =========================
// // SIMPAN JAWABAN AI
// // =========================
// await db.query(
//   `
//   INSERT INTO chat_messages
//   (session_id, sender, message)
//   VALUES (?, ?, ?)
//   `,
//   [sessionId, "bot", aiReply]
// );

// // =========================
// // RESPONSE
// // =========================
// res.json({
//   result: aiReply,
// });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({  error: "Terjadi kesalahan pada server" });
//   } finally {
//     // =========================
//     // HAPUS HISTORY CHAT OLDER DARI 1 HARI
//     // =========================
//     await db.query(
//       `
//       DELETE FROM chat_messages
//       WHERE created_at < NOW() - INTERVAL 1 DAY
//       `
//     );
//   }
// };

import { Request, Response } from "express";
import { db } from "../config/db";

export const adminAIChat = async (
req: Request,
res: Response
) => {
try {
const {
message,
sessionId,
} = req.body;

// =========================
// SIMPAN CHAT USER
// =========================

await db.query(
  `
  INSERT INTO chat_messages
  (session_id, sender, message)
  VALUES (?, ?, ?)
  `,
  [sessionId, "user", message]
);

// =========================
// PRODUK TERLARIS
// =========================

const [bestSelling]: any =
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

// =========================
// STOK MENIPIS
// =========================

const [lowStock]: any =
  await db.query(`
    SELECT
      nama,
      stok_ml
    FROM produk
    WHERE stok_ml <= 100
    ORDER BY stok_ml ASC
  `);

// =========================
// TOTAL OMZET
// =========================

const [sales]: any =
  await db.query(`
    SELECT
      SUM(total_harga) total
    FROM transaksi
  `);

// =========================
// TOTAL TRANSAKSI
// =========================

const [trx]: any =
  await db.query(`
    SELECT
      COUNT(*) total
    FROM transaksi
  `);

// =========================
// TOTAL LABA
// =========================

const [profit]: any =
  await db.query(`
    SELECT
      SUM(
        (
          dt.harga_per_ml
          -
          p.harga_beli_per_ml
        ) * dt.qty_ml
      ) AS total_laba
    FROM detail_transaksi dt
    JOIN produk p
      ON p.id = dt.produk_id
  `);

// =========================
// SUPPLIER TERAKTIF
// =========================

const [topSupplier]: any =
  await db.query(`
    SELECT
      s.nama_supplier,
      COUNT(*) total_pembelian
    FROM pembelian pb
    JOIN supplier s
      ON s.id = pb.supplier_id
    GROUP BY s.id
    ORDER BY total_pembelian DESC
    LIMIT 5
  `);

// =========================
// FORMAT DATA
// =========================

const bestSellingText =
  bestSelling
    .map(
      (p: any) =>
        `${p.nama} = ${p.total_terjual} ml`
    )
    .join("\n");

const lowStockText =
  lowStock
    .map(
      (p: any) =>
        `${p.nama} = ${p.stok_ml} ml`
    )
    .join("\n");

const supplierText =
  topSupplier
    .map(
      (s: any) =>
        `${s.nama_supplier} = ${s.total_pembelian} pembelian`
    )
    .join("\n");

// =========================
// HISTORY CHAT
// =========================

const [history]: any =
  await db.query(
    `
    SELECT sender, message
    FROM chat_messages
    WHERE session_id = ?
    ORDER BY id DESC
    LIMIT 10
    `,
    [sessionId]
  );

const historyText =
  history
    .reverse()
    .map(
      (h: any) =>
        `${h.sender}: ${h.message}`
    )
    .join("\n");

// =========================
// PROMPT AI
// =========================

const prompt = `

Anda adalah AI Business Assistant untuk toko parfum refill.

=== PRODUK TERLARIS ===
${bestSellingText}

=== STOK MENIPIS ===
${lowStockText}

=== TOTAL OMZET ===
Rp ${Number(
sales[0]?.total || 0
).toLocaleString("id-ID")}

=== TOTAL TRANSAKSI ===
${trx[0]?.total || 0}

=== TOTAL LABA ===
Rp ${Number(
profit[0]?.total_laba || 0
).toLocaleString("id-ID")}

=== SUPPLIER TERAKTIF ===
${supplierText}

=== HISTORY CHAT ===
${historyText}

ATURAN:

* Jawaban singkat
* Profesional
* Bahasa Indonesia
* Fokus bisnis parfum
* Jangan gunakan markdown

Anda dapat membantu admin untuk:

1. Analisis produk terlaris
2. Analisis stok menipis
3. Analisis omzet
4. Analisis laba
5. Analisis supplier
6. Rekomendasi restock
7. Rekomendasi promosi produk

PERTANYAAN ADMIN:
${message}
`;

// =========================
// GEMINI API
// =========================

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  }
);

const data: any =
  await response.json();

const aiReply =
  data.candidates?.[0]
    ?.content?.parts?.[0]?.text ||
  "AI tidak merespon.";

// =========================
// SIMPAN JAWABAN AI
// =========================

await db.query(
  `
  INSERT INTO chat_messages
  (session_id, sender, message)
  VALUES (?, ?, ?)
  `,
  [
    sessionId,
    "bot",
    aiReply,
  ]
);

// =========================
// RESPONSE
// =========================

res.json({
  result: aiReply,
});

} catch (error) {
console.error(error);

res.status(500).json({
  error:
    "Terjadi kesalahan pada server",
});

} finally {

// =========================
// HAPUS HISTORY > 1 HARI
// =========================

await db.query(`
  DELETE FROM chat_messages
  WHERE created_at <
  NOW() - INTERVAL 1 DAY
`);

}
};
