# Requirements: Manta Racing Finance Dashboard

**Defined:** 2026-03-19
**Core Value:** User bisa upload 2 file Excel dan langsung dapat laporan keuangan lengkap — margin, HPP, piutang — tanpa hitung manual.

## v1 Requirements

### Import & Periode

- [x] **IMP-01**: User dapat membuat periode baru (nama bulan/tahun)
- [x] **IMP-02**: User dapat upload file Products Excel → data stock & HPP disimpan sebagai ProductSnapshot untuk periode tersebut
- [x] **IMP-03**: User dapat upload file Sales Report Excel → transaksi di-parse dan disimpan sebagai Sale + SaleItem
- [x] **IMP-04**: Sistem mem-parsing format produk di Sales Report: `"Nama Produk (QTY.0000)"` → `{productName, qty}`
- [x] **IMP-05**: Sistem melakukan matching nama produk (case-insensitive) ke ProductSnapshot untuk mendapatkan HPP per item
- [x] **IMP-06**: User dapat melihat status import (sukses, warning produk tidak cocok, error)

### Kalkulasi Keuangan

- [x] **CALC-01**: Sistem menghitung HPP total per transaksi dari SaleItem
- [x] **CALC-02**: Sistem menghitung diskon per transaksi: `diskon = SUM(harga×qty) - grand_total`
- [x] **CALC-03**: Sistem menghitung laba kotor per transaksi: `laba = grand_total - total_hpp`
- [x] **CALC-04**: Sistem menghitung margin persen per transaksi
- [x] **CALC-05**: Sistem menghitung ringkasan keuangan per periode: total penjualan, total HPP, laba kotor, total diskon, piutang aktif, sudah terbayar

### Dashboard Utama

- [ ] **DASH-01**: User dapat melihat kartu ringkasan periode berjalan (penjualan, HPP, laba kotor, diskon, piutang, terbayar, margin %)
- [ ] **DASH-02**: User dapat melihat bar chart penjualan per konsumen
- [ ] **DASH-03**: User dapat melihat pie chart komposisi penjualan per kategori produk
- [ ] **DASH-04**: User dapat melihat bar chart top 10 produk terlaris (by qty)
- [ ] **DASH-05**: User dapat memilih periode yang ditampilkan di dashboard

### Manajemen Stock

- [ ] **STOK-01**: User dapat melihat tabel stock: SKU, nama, kategori, HPP, harga jual, stock, margin/unit, margin %
- [ ] **STOK-02**: User dapat mengurutkan tabel stock dengan klik header kolom
- [ ] **STOK-03**: User dapat filter stock by kategori, range HPP, range stock
- [ ] **STOK-04**: User dapat search produk by nama atau SKU
- [ ] **STOK-05**: User dapat inline edit jumlah stock (koreksi manual)
- [ ] **STOK-06**: User dapat melihat ringkasan inventory: total nilai HPP, total nilai harga jual, potensi profit
- [ ] **STOK-07**: Sistem menampilkan alert untuk produk stock < 50 (warning kuning) dan < 10 (warning merah)

### Laporan Penjualan

- [ ] **SALE-01**: User dapat melihat tabel transaksi: tanggal, no ref, konsumen, jumlah item, grand total, HPP total, laba kotor, diskon, status bayar
- [ ] **SALE-02**: User dapat expand baris transaksi untuk melihat detail item (produk, qty, HPP unit, harga unit)
- [ ] **SALE-03**: User dapat filter transaksi by konsumen, status pembayaran, range tanggal
- [ ] **SALE-04**: User dapat mengurutkan transaksi by tanggal, total, margin

### Dashboard Finance

- [ ] **FIN-01**: User dapat melihat laporan keuangan lengkap (P&L style): pendapatan, biaya, profitabilitas, piutang, inventory
- [ ] **FIN-02**: User dapat melihat tabel margin per produk (HPP vs harga jual vs harga aktual per transaksi)
- [ ] **FIN-03**: User dapat melihat tabel piutang per konsumen (siapa yang belum bayar berapa)
- [ ] **FIN-04**: User dapat melihat tabel diskon per konsumen (rata-rata diskon ke masing-masing)
- [ ] **FIN-05**: User dapat input biaya operasional manual untuk perhitungan laba bersih

### Piutang & Konsumen

- [ ] **PIUT-01**: User dapat melihat tabel piutang per konsumen: total transaksi, grand total, terbayar, piutang, avg diskon %
- [ ] **PIUT-02**: User dapat mencatat pembayaran piutang (cicilan atau pelunasan) per transaksi
- [ ] **PIUT-03**: User dapat melihat history pembelian per konsumen
- [ ] **PIUT-04**: Balance piutang otomatis terupdate setelah pembayaran dicatat

### Export

- [ ] **EXPT-01**: User dapat memilih data yang mau di-export (checklist: laporan keuangan, transaksi, detail item, piutang, stock, margin produk, margin konsumen)
- [ ] **EXPT-02**: User dapat filter data sebelum export (range tanggal, konsumen, kategori, status bayar)
- [ ] **EXPT-03**: Sistem generate file Excel dengan format rapi: header bisnis, judul sheet+periode, format Rupiah, auto-width, warna header, sub-total & grand total

### Auth & Keamanan

- [x] **AUTH-01**: Aplikasi dilindungi dengan password (single-user auth)
- [x] **AUTH-02**: Session persists across browser refresh

## v2 Requirements

### Perbandingan Antar Periode

- **COMP-01**: User dapat melihat line chart trend penjualan antar periode
- **COMP-02**: User dapat melihat perbandingan metrik keuangan antar periode (bulan-over-bulan)

### Notifikasi & Otomasi

- **NOTF-01**: Notifikasi Telegram bot untuk piutang jatuh tempo (opsional)
- **NOTF-02**: Alert tenggat piutang per konsumen

### Export Lanjutan

- **EXPT-04**: Export laporan ke PDF (print-ready)
- **EXPT-05**: Export perbandingan antar periode

### UX

- **UX-01**: Optimasi mobile responsive
- **UX-02**: Dark mode

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user / role management | Internal tool single-user, tidak dibutuhkan v1 |
| Akuntansi lengkap (jurnal, neraca, arus kas) | Fokus pada closing operasional saja |
| Real-time sync / WebSocket | Data batch upload, tidak perlu real-time |
| Mobile app native | Web responsive cukup |
| Integrasi POS / marketplace langsung | Data masih via Excel upload |
| Manajemen supplier / pembelian | Diluar scope closing penjualan |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| IMP-01 | Phase 2 | Complete |
| IMP-02 | Phase 2 | Complete |
| IMP-03 | Phase 2 | Complete |
| IMP-04 | Phase 2 | Complete |
| IMP-05 | Phase 2 | Complete |
| IMP-06 | Phase 2 | Complete |
| CALC-01 | Phase 2 | Complete |
| CALC-02 | Phase 2 | Complete |
| CALC-03 | Phase 2 | Complete |
| CALC-04 | Phase 2 | Complete |
| CALC-05 | Phase 2 | Complete |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| STOK-01 | Phase 4 | Pending |
| STOK-02 | Phase 4 | Pending |
| STOK-03 | Phase 4 | Pending |
| STOK-04 | Phase 4 | Pending |
| STOK-05 | Phase 4 | Pending |
| STOK-06 | Phase 4 | Pending |
| STOK-07 | Phase 4 | Pending |
| SALE-01 | Phase 4 | Pending |
| SALE-02 | Phase 4 | Pending |
| SALE-03 | Phase 4 | Pending |
| SALE-04 | Phase 4 | Pending |
| FIN-01 | Phase 5 | Pending |
| FIN-02 | Phase 5 | Pending |
| FIN-03 | Phase 5 | Pending |
| FIN-04 | Phase 5 | Pending |
| FIN-05 | Phase 5 | Pending |
| PIUT-01 | Phase 5 | Pending |
| PIUT-02 | Phase 5 | Pending |
| PIUT-03 | Phase 5 | Pending |
| PIUT-04 | Phase 5 | Pending |
| EXPT-01 | Phase 6 | Pending |
| EXPT-02 | Phase 6 | Pending |
| EXPT-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 — all 41 requirements mapped to phases by roadmapper*
