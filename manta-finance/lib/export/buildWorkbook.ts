import ExcelJS from 'exceljs'
import { buildLaporanKeuanganSheet, FinanceSummary } from './sheets/laporanKeuangan'
import { buildTransaksiSheet, SaleRow } from './sheets/transaksi'
import { buildDetailItemSheet } from './sheets/detailItem'
import { buildPiutangSheet, CustomerRow } from './sheets/piutang'
import { buildStockSheet, StockItem } from './sheets/stock'
import { buildMarginProdukSheet, ProductMarginRow } from './sheets/marginProduk'
import { buildMarginKonsumenSheet, CustomerDiscountRow } from './sheets/marginKonsumen'

export interface ExportConfig {
  periodId: string
  periodLabel: string
  sheets: string[]
  filters: {
    dateFrom?: string
    dateTo?: string
    customer?: string
    category?: string
    paymentStatus?: 'all' | 'paid' | 'unpaid'
  }
}

export interface ExportData {
  summary?: FinanceSummary
  saleRows?: SaleRow[]
  customerRows?: CustomerRow[]
  stockItems?: StockItem[]
  productMarginRows?: ProductMarginRow[]
  customerDiscountRows?: CustomerDiscountRow[]
}

export async function buildWorkbook(
  config: ExportConfig,
  data: ExportData
): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Manta Racing'
  wb.created = new Date()

  const { sheets, filters, periodLabel } = config

  if (sheets.includes('laporanKeuangan') && data.summary) {
    buildLaporanKeuanganSheet(wb, data.summary, periodLabel)
  }

  if (sheets.includes('transaksi') && data.saleRows) {
    buildTransaksiSheet(wb, data.saleRows, {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      customer: filters.customer,
      paymentStatus: filters.paymentStatus,
    })
  }

  if (sheets.includes('detailItem') && data.saleRows) {
    buildDetailItemSheet(wb, data.saleRows, {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      customer: filters.customer,
    })
  }

  if (sheets.includes('piutang') && data.customerRows) {
    buildPiutangSheet(wb, data.customerRows, {
      customer: filters.customer,
      paymentStatus: filters.paymentStatus,
    })
  }

  if (sheets.includes('stock') && data.stockItems) {
    buildStockSheet(wb, data.stockItems, {
      category: filters.category,
    })
  }

  if (sheets.includes('marginProduk') && data.productMarginRows) {
    buildMarginProdukSheet(wb, data.productMarginRows, {
      category: filters.category,
    })
  }

  if (sheets.includes('marginKonsumen') && data.customerDiscountRows) {
    buildMarginKonsumenSheet(wb, data.customerDiscountRows)
  }

  return wb
}
