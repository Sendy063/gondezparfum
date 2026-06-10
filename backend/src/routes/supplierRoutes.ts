import express from "express";

import {
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController";

const router = express.Router();

router.get("/", getSupplier);

router.post("/", createSupplier);

router.put("/:id", updateSupplier);

router.delete("/:id", deleteSupplier);

export default router;