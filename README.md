# 🛍️ AI Customer Service Assistant – Bertha Store

> **Capstone Project — IBM SkillsBuild University Education**
> Topic: AI Customer Service Assistant

---

## 📖 Deskripsi Project

Bertha Store Customer Service Assistant adalah aplikasi web berbasis AI yang membantu pelanggan toko online fashion dan aksesoris **Bertha Store** mendapatkan informasi secara cepat dan mudah.

Aplikasi ini mengimplementasikan **knowledge-based response engine** yang mampu memahami berbagai variasi pertanyaan dalam Bahasa Indonesia tanpa memerlukan API key eksternal, sehingga langsung dapat dijalankan melalui browser.

---

## 🎯 Tujuan Aplikasi

- Menyediakan layanan customer service berbasis AI yang responsif dan informatif.
- Membantu pelanggan mendapatkan informasi produk, pemesanan, pembayaran, pengiriman, dan pengembalian barang secara instan.
- Mendemonstrasikan implementasi AI Customer Service sederhana menggunakan teknologi web standar.
- Menyediakan fondasi yang dapat dikembangkan menjadi solusi berbasis LLM di masa mendatang.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 💬 Chat Interface | Antarmuka percakapan real-time dengan animasi bubble |
| 🤖 AI Response Engine | Pencocokan intent berbasis keyword dengan fallback yang sopan |
| ⚡ Quick Reply Buttons | Tombol pertanyaan cepat untuk topik umum |
| ⌨️ Typing Indicator | Animasi tiga titik saat asisten memproses jawaban |
| 🔄 New Chat Button | Tombol untuk memulai percakapan baru |
| 📱 Responsive Design | Tampilan optimal di laptop dan smartphone |
| 🏪 Knowledge Base | Data lengkap produk, pemesanan, pembayaran, pengiriman, retur |
| 🎨 Modern UI | Desain biru tua profesional dengan sidebar informasi toko |

---

## 🧠 Kemampuan Asisten

Asisten dapat menjawab pertanyaan seputar:

- **Produk & Harga** — Kaos, Kemeja, Hoodie, Topi, Tas beserta harganya
- **Cara Pemesanan** — Langkah-langkah melakukan order
- **Metode Pembayaran** — Transfer bank, e-wallet, virtual account, QRIS
- **Estimasi Pengiriman** — 2–5 hari kerja, kurir yang tersedia, free ongkir
- **Kebijakan Retur** — Syarat, prosedur, dan batas waktu pengembalian
- **Informasi Toko** — Jam operasional, kontak, email
- **Sapaan & Percakapan Umum** — Greeting, terima kasih, pamit

---

## 🗂️ Struktur Folder

```
bertha-store/
├── index.html   ← Struktur HTML & layout utama
├── style.css    ← Styling lengkap (sidebar, chat, responsive)
├── script.js    ← Knowledge base & response engine & UI controller
└── README.md    ← Dokumentasi project ini
```

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| **HTML5** | Struktur halaman & semantic markup |
| **CSS3** | Styling modern, animasi, layout flexbox, responsive |
| **Vanilla JavaScript (ES6+)** | Response engine, DOM manipulation, event handling |
| **Local Knowledge Base** | Data toko & FAQ tersimpan dalam objek JS |

> ✅ **Tidak memerlukan:** framework, library eksternal, database, backend, atau API key.

---

## 🚀 Cara Menjalankan Aplikasi

### Metode 1 — Buka Langsung di Browser (Paling Mudah)

1. Download atau clone folder project ini.
2. Buka file `index.html` langsung di browser (klik dua kali atau drag ke browser).
3. Aplikasi langsung berjalan — tidak perlu instalasi apa pun.

### Metode 2 — Via Live Server (VS Code)

1. Buka folder project di **Visual Studio Code**.
2. Install ekstensi **Live Server** (jika belum ada).
3. Klik kanan `index.html` → **Open with Live Server**.
4. Browser akan otomatis terbuka di `http://127.0.0.1:5500`.

### Metode 3 — Via Python HTTP Server

```bash
# Python 3
python -m http.server 8080

# Buka browser ke:
# http://localhost:8080
```

### Metode 4 — Via Node.js

```bash
npx serve .

# Buka browser ke URL yang ditampilkan terminal
```

---

## 🧪 Contoh Pertanyaan untuk Pengujian

Coba ketik pertanyaan-pertanyaan berikut untuk menguji kemampuan asisten:

### Produk & Harga
```
Apa saja produk yang dijual?
Berapa harga hoodie?
Hoodie dijual berapa?
Aku mau tahu harga kemeja
Harga topi berapa ya?
Produk apa yang ada di Bertha Store?
```

### Pemesanan
```
Bagaimana cara memesan?
Gimana cara order di Bertha Store?
Langkah-langkah belanja
Cara checkout
```

### Pembayaran
```
Apa saja metode pembayaran?
Bisa bayar pakai GoPay?
Cara bayar transfer bank
Apakah ada QRIS?
```

### Pengiriman
```
Berapa lama estimasi pengiriman?
Kurir apa yang dipakai?
Ada gratis ongkir?
Kapan pesanan saya sampai?
```

### Retur & Pengembalian
```
Bagaimana kebijakan retur?
Cara mengembalikan barang rusak
Produk saya tidak sesuai pesanan
Syarat retur barang
```

### Informasi Toko
```
Jam buka Bertha Store?
Nomor kontak Bertha Store
Email customer service
Bertha Store itu toko apa?
```

### Percakapan Umum
```
Halo
Selamat pagi
Terima kasih
Sampai jumpa
```

---

## 🏗️ Arsitektur Kode

```
script.js
├── KB (Knowledge Base Object)     ← Data toko, produk, kebijakan
├── INTENTS (Array)                ← Definisi intent + keyword + responder
├── getResponse(userInput)         ← Response engine (decoupled dari UI)
└── UI (Object)
    ├── init()                     ← Inisialisasi DOM & events
    ├── submitMessage(text)        ← Dispatch pesan
    ├── addMessage(role, text)     ← Render chat bubble
    ├── showTyping() / hideTyping()← Typing indicator
    └── renderWelcome()            ← Welcome card
```

Pemisahan `getResponse()` dari `UI` memudahkan integrasi LLM API di masa mendatang — cukup ganti fungsi `getResponse()` dengan pemanggilan API tanpa mengubah logika UI.

---

## 🔮 Pengembangan Selanjutnya

- [ ] Integrasi dengan LLM API (IBM watsonx, OpenAI, Google Gemini)
- [ ] Backend Node.js / Python untuk session management
- [ ] Database produk yang dinamis
- [ ] Sistem login pelanggan
- [ ] Riwayat percakapan yang persisten
- [ ] Notifikasi status pesanan real-time
- [ ] Dukungan gambar produk


---

## 📄 Lisensi

Project ini dibuat untuk keperluan edukasi sebagai bagian dari program **IBM SkillsBuild University Education × Hacktiv8**.

---

*Bertha Store Customer Service Assistant — Powered by AI Knowledge Base*
