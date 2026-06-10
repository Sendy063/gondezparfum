import { Request, Response } from "express";
import { db } from "../config/db";

// GET ALL
export const getSupplier = async (
  req: Request,
  res: Response
) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM supplier ORDER BY id DESC"
    );

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// CREATE
export const createSupplier = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      nama_supplier,
      telepon,
      alamat,
    } = req.body;

    await db.query(
      `
      INSERT INTO supplier
      (
        nama_supplier,
        telepon,
        alamat
      )
      VALUES (?, ?, ?)
      `,
      [
        nama_supplier,
        telepon,
        alamat,
      ]
    );

    res.json({
      message:
        "Supplier berhasil ditambahkan",
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// UPDATE
export const updateSupplier = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      nama_supplier,
      telepon,
      alamat,
    } = req.body;

    await db.query(
      `
      UPDATE supplier
      SET
      nama_supplier=?,
      telepon=?,
      alamat=?
      WHERE id=?
      `,
      [
        nama_supplier,
        telepon,
        alamat,
        id,
      ]
    );

    res.json({
      message:
        "Supplier berhasil diubah",
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// DELETE
export const deleteSupplier = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM supplier WHERE id=?",
      [id]
    );

    res.json({
      message:
        "Supplier berhasil dihapus",
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
    });
  }
};