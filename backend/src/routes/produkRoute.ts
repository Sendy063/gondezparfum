// src/routes/produkRoute.ts

import { Router } from "express";

import { upload } from "../middleware/upload";

import {
  getProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  restockProduk,
} from "../controllers/produkController";

const router = Router();

router.get("/", getProduk);

router.get("/:id", getProdukById);

router.post("/", upload.single("image"), createProduk);

router.put("/:id", upload.single("image"), updateProduk);

router.patch("/:id/restock", restockProduk);

router.delete("/:id", deleteProduk);

export default router;
