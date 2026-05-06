// src/models/productModel.ts
export interface Produk {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  harga_per_ml: number;
  stok_ml: number;
  created_at: string;
}