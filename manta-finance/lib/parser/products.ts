import * as XLSX from "xlsx";

export interface ProductRow {
  sku: string;
  name: string;
  category: string;
  hpp: number;
  hargaJual: number;
  stock: number;
}

export const CATEGORY_NAMES: Record<string, string> = {
  '001': 'Klep',
  '002': 'Blok Silinder',
  '003': 'Sensor TPS',
  '004': 'Retainer',
  '005': 'Shim',
  '006': 'Rocker Arm',
  '007': 'Tensioner',
  '008': 'Timing Gear',
}

export function resolveCategory(code: string): string {
  return CATEGORY_NAMES[code] ?? code
}

export function parseProducts(buffer: Buffer): ProductRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const results: ProductRow[] = [];

  for (const row of rows) {
    const name = String(row["Nama"] ?? "").trim();
    const sku = String(row["Code"] ?? "").trim();
    const category = String(row["Kode Kategori"] ?? "").trim();
    const hpp = parseFloat(String(row["Biaya"] ?? "0")) || 0;
    const hargaJual = parseFloat(String(row["Harga"] ?? "0")) || 0;
    const stock = parseInt(String(row["Kuantitas"] ?? "0"), 10) || 0;

    // Skip rows without a product name
    if (!name) continue;

    results.push({ sku, name, category, hpp, hargaJual, stock });
  }

  return results;
}
