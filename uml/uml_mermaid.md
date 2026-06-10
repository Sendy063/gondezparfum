# Gondez Parfum - UML Sequence Diagrams (Simplified)

Dokumen ini berisi UML Sequence Diagram yang disederhanakan untuk project **Gondez Parfum**, disesuaikan dengan format visual draw.io/clean-flow seperti gambar referensi Anda.

---

## 1. POS / Kasir Penjualan (Checkout Flow)

```mermaid
sequenceDiagram
    actor Admin
    participant POSPage
    participant TransaksiController
    database Database

    Admin->>POSPage: Pilih Produk
    Admin->>POSPage: Input Qty ML
    Admin->>POSPage: Checkout
    POSPage->>TransaksiController: Simpan Transaksi
    TransaksiController->>Database: INSERT Transaksi
    TransaksiController->>Database: INSERT Detail Transaksi
    TransaksiController->>Database: UPDATE Stok Produk
    Database-->>TransaksiController: Berhasil
    TransaksiController-->>POSPage: Invoice
    POSPage-->>Admin: Tampilkan Invoice
```

---

## 2. Autentikasi Admin (Login Flow)

```mermaid
sequenceDiagram
    actor Admin
    participant LoginPage
    participant AuthController
    database Database

    Admin->>LoginPage: Input Username & Password
    Admin->>LoginPage: Klik Login
    LoginPage->>AuthController: Request Login
    AuthController->>Database: SELECT * FROM admin
    Database-->>AuthController: Admin Data
    AuthController-->>LoginPage: Token & Admin Data
    LoginPage-->>Admin: Redirect Ke Dashboard
```

---

## 3. Pembelian / Restock Produk dari Supplier

```mermaid
sequenceDiagram
    actor Admin
    participant PembelianPage
    participant PembelianController
    database Database

    Admin->>PembelianPage: Pilih Supplier
    Admin->>PembelianPage: Tambah Produk & Qty ML
    Admin->>PembelianPage: Simpan Pembelian
    PembelianPage->>PembelianController: Simpan Pembelian
    PembelianController->>Database: INSERT Pembelian
    PembelianController->>Database: INSERT Detail Pembelian
    PembelianController->>Database: UPDATE Tambah Stok Produk
    Database-->>PembelianController: Berhasil
    PembelianController-->>PembelianPage: Response Berhasil
    PembelianPage-->>Admin: Tampilkan Status Berhasil
```

---

## 4. Kelola Data Produk (CRUD Produk)

```mermaid
sequenceDiagram
    actor Admin
    participant ProdukPage
    participant ProdukController
    database Database

    Admin->>ProdukPage: Input Data Produk Baru / Edit Data
    Admin->>ProdukPage: Klik Simpan / Hapus
    ProdukPage->>ProdukController: Simpan / Hapus Produk
    ProdukController->>Database: INSERT / UPDATE / DELETE Produk
    Database-->>ProdukController: Berhasil
    ProdukController-->>ProdukPage: Response Berhasil
    ProdukPage-->>Admin: Tampilkan Status & Refresh Daftar Produk
```

---

## 5. AI Asisten Bisnis Admin (Gondez AI)

```mermaid
sequenceDiagram
    actor Admin
    participant AIPage
    participant AdminAIController
    database Database
    participant GeminiAPI as Gemini API

    Admin->>AIPage: Input Pertanyaan Bisnis
    Admin->>AIPage: Klik Kirim
    AIPage->>AdminAIController: Request Chat
    AdminAIController->>Database: INSERT Chat Message (User)
    AdminAIController->>Database: SELECT Data Statistik Bisnis
    Database-->>AdminAIController: Data Statistik
    AdminAIController->>Database: SELECT Chat History
    Database-->>AdminAIController: Chat History
    AdminAIController->>GeminiAPI: Request Analisis Bisnis (Prompt)
    GeminiAPI-->>AdminAIController: Jawaban Analisis Bisnis
    AdminAIController->>Database: INSERT Chat Message (Bot)
    AdminAIController->>Database: DELETE Chat History (> 1 Hari)
    AdminAIController-->>AIPage: Jawaban AI
    AIPage-->>Admin: Tampilkan Jawaban AI
```

---

## 6. Public Chatbot Konsultan Parfum (Sisi User)

```mermaid
sequenceDiagram
    actor Pelanggan
    participant KatalogPage
    participant ChatbotWidget
    participant AIController
    database Database
    participant GeminiAPI as Gemini API

    KatalogPage->>Database: SELECT Data Produk
    Database-->>KatalogPage: Daftar Produk
    KatalogPage-->>Pelanggan: Tampilkan Katalog
    
    Pelanggan->>ChatbotWidget: Input Pertanyaan & Upload Gambar
    Pelanggan->>ChatbotWidget: Klik Kirim
    ChatbotWidget->>AIController: Request Chat (Prompt & Gambar)
    AIController->>GeminiAPI: Request Rekomendasi Parfum
    GeminiAPI-->>AIController: Jawaban Rekomendasi
    AIController-->>ChatbotWidget: Jawaban AI
    ChatbotWidget-->>Pelanggan: Tampilkan Jawaban Rekomendasi
```
