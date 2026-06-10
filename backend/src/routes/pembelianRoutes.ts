import express from "express";

import {
  createPembelian,
  getPembelian,
  getPembelianById,
} from "../controllers/pembelianController";

const router = express.Router();

router.get("/", getPembelian);

router.post("/", createPembelian);

router.get("/:id", getPembelianById);

export default router;