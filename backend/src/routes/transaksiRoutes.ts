import express from "express";
import {
  createTransaksi,
  getTransaksi,
  getStatistikPenjualan,
} from "../controllers/transaksiController";


const router = express.Router();

router.post("/", createTransaksi);
router.get("/", getTransaksi);
router.get("/statistik", getStatistikPenjualan);

export default router;