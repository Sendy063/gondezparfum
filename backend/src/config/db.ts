// src/config/db.ts
import mysql from "mysql2";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "gondez_db",
});