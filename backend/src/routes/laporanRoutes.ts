import express from "express";

import {
getLaporanPenjualan,
getLaporanLabaRugi,
exportExcel,
exportPDF,
} from "../controllers/laporanController";

const router = express.Router();

router.get(
"/penjualan",
getLaporanPenjualan
);

router.get(
"/laba-rugi",
getLaporanLabaRugi
);

router.get(
"/export-excel",
exportExcel
);

router.get(
"/export-pdf",
exportPDF
);

export default router;
