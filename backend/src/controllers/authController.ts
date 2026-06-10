import { Request, Response } from "express";

import jwt from "jsonwebtoken";

import { db } from "../config/db";

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      username,
      password,
    } = req.body;

    // ======================
    // CEK USERNAME
    // ======================

    const [results]: any =
      await db.query(
        `
        SELECT *
        FROM admin
        WHERE username = ?
        `,
        [username]
      );

    // USER TIDAK ADA

    if (results.length === 0) {
      return res.status(401).json({
        message:
          "Username tidak ditemukan",
      });
    }

    const admin = results[0];

    // ======================
    // CEK PASSWORD
    // ======================

    if (admin.password !== password) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    // ======================
    // TOKEN JWT
    // ======================

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
      },
      "SECRET_KEY",
      {
        expiresIn: "1d",
      }
    );

    // ======================
    // RESPONSE
    // ======================

    res.json({
      message: "Login berhasil",

      token,

      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      message:
        "Terjadi kesalahan server",

      error: err.message,
    });
  }
};