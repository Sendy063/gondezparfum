// src/app.ts
import express from "express";
import cors from "cors";
import produkRoute from "./src/routes/produkRoute";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/produk", produkRoute);
app.use("/uploads", express.static("uploads"));

export default app;
