import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

/* ROUTES */
import produkRoute from "./src/routes/produkRoute";
import aiRoutes from "./src/routes/aiRoutes";
import transaksiRoutes from "./src/routes/transaksiRoutes";
import authRoutes from "./src/routes/authRoutes";
import adminAiRoutes from "./src/routes/adminAiRoutes";
import supplierRoutes from "./src/routes/supplierRoutes";
import pembelianRoutes from "./src/routes/pembelianRoutes";
import laporanRoutes from "./src/routes/laporanRoutes";
import dashboardRoutes from "./src/routes/dashboardRoutes";


const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin-ai", adminAiRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/produk", produkRoute);

app.use("/api/transaksi", transaksiRoutes);

app.use("/api", aiRoutes);

app.use("/api/supplier", supplierRoutes);

app.use("/api/pembelian", pembelianRoutes);

app.use("/api/laporan", laporanRoutes);

app.use("/api/dashboard", dashboardRoutes);
// console.log("AI routes loaded");

export default app;
