# Manta Racing Finance Dashboard

## What This Is

Aplikasi web internal untuk **Manta Racing Official** yang berfungsi sebagai sistem closing bulanan — dashboard keuangan dan inventory. User meng-upload 2 file Excel per bulan (Products & Sales Report), lalu sistem otomatis menghitung seluruh metrik: HPP, margin, laba kotor, laba bersih, diskon reseller, dan piutang. Data bisa di-filter, di-sortir, dan di-export ke Excel dengan format rapi.

## Core Value

User bisa upload 2 file Excel dan langsung dapat laporan keuangan lengkap — margin, HPP, piutang — tanpa hitung manual.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User dapat upload file Products Excel → data stock & HPP tersimpan per periode
- [ ] User dapat upload file Sales Report Excel → transaksi parsed & di-match ke produk
- [ ] Sistem otomatis menghitung HPP, margin, diskon, dan laba kotor per transaksi
- [ ] User dapat melihat dashboard ringkasan keuangan (total penjualan, HPP, laba, piutang)
- [ ] User dapat melihat tabel stock dengan filter, sort, dan inline edit
- [ ] User dapat melihat tabel transaksi penjualan dengan detail per item
- [ ] User dapat melihat laporan keuangan lengkap (P&L style) per periode
- [ ] User dapat melihat piutang per konsumen beserta status pembayaran
- [ ] User dapat mencatat pembayaran piutang (cicilan/pelunasan)
- [ ] User dapat export laporan ke Excel dengan format rapi
- [ ] Data terisolasi per periode bulan (historical data tidak berubah)
- [ ] Aplikasi dilindungi dengan auth sederhana (single-user password)

### Out of Scope

- Telegram bot notifikasi — kompleksitas tidak sepadan untuk v1
- PDF export — Excel cukup untuk kebutuhan closing bulanan
- Multi-user / role management — single user, tidak butuh
- Mobile app native — web responsive cukup
- Real-time sync / WebSocket — data batch upload, tidak perlu real-time
- Akuntansi lengkap (jurnal, neraca, arus kas) — fokus pada closing operasional

## Context

- Data sumber: 2 file Excel per bulan — Products (stock master) dan Sales Report (transaksi)
- **32 SKU** aktif dalam 8 kategori produk
- **Diskon reseller** tidak eksplisit di Excel — harus dihitung: `diskon = SUM(harga×qty) - grand_total`
- Nama produk di Sales Report harus di-match ke ProductSnapshot by name (case-insensitive)
- Grand Total di Sales Report sudah nett (setelah diskon)
- Piutang aktif saat ini ~79% dari total penjualan — fitur tracking piutang kritis
- Contoh data: penjualan Maret 2026 = Rp 23.830.960, HPP = Rp 14.027.321, Laba = Rp 9.803.639

## Constraints

- **Budget**: VPS Rp 200.000/bulan — pakai SQLite, tidak ada external DB server
- **Tech Stack**: Next.js 14 (App Router) + Prisma + SQLite + Tailwind CSS — sudah ditetapkan
- **Deployment**: VPS budget (Contabo S ~Rp 100.000/bulan) + Nginx + PM2 + SSL Let's Encrypt
- **Scale**: Single-user internal tool, tidak butuh skalabilitas tinggi
- **Excel parsing**: SheetJS (xlsx) untuk parse upload; ExcelJS untuk generate export
- **No external DB**: SQLite file-based, backup via cron ke local + rclone ke Google Drive

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js fullstack (frontend + API routes) | Satu project, tidak perlu separate backend | — Pending |
| SQLite via Prisma | Gratis, ringan, file-based mudah backup, cukup single-user | — Pending |
| Period-based data isolation | HPP/harga bisa berubah antar bulan — historis harus akurat | — Pending |
| Diskon dihitung per transaksi (bukan per item) | Grand Total sudah nett, tidak ada diskon per-item di data | — Pending |
| Match produk by name (case-insensitive) | SKU tidak ada di Sales Report, hanya nama produk | — Pending |
| Auth sederhana (single password) | Internal tool single-user, tidak perlu auth kompleks | — Pending |

---
*Last updated: 2026-03-19 after initialization*
