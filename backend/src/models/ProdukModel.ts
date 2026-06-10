export interface Produk {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  harga_per_ml: number;
  stok_ml: number;
  image?: string;
  created_at: string;
}