import * as XLSX from "xlsx";

export interface SaleItemRow {
  productName: string;
  qty: number;
}

export interface SaleRow {
  date: Date;
  refNo: string;
  supplier: string;
  customer: string;
  grandTotal: number;
  paid: number;
  balance: number;
  status: string;
  items: SaleItemRow[];
}

const ITEM_REGEX = /(.+?)\s*\((\d+\.?\d*)\)/;

function parseItemsCell(cell: string): SaleItemRow[] {
  if (!cell) return [];
  const lines = cell.split("\n");
  const items: SaleItemRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = ITEM_REGEX.exec(trimmed);
    if (!match) continue;
    const productName = match[1].trim();
    const qty = Math.round(parseFloat(match[2]));
    items.push({ productName, qty });
  }

  return items;
}

function parseDateCell(cell: unknown): Date {
  // Handle Excel numeric date serial or string "DD/MM/YYYY HH:mm"
  if (typeof cell === "number") {
    // Excel date serial — convert using XLSX date utility
    const dateInfo = XLSX.SSF.parse_date_code(cell);
    return new Date(
      dateInfo.y,
      dateInfo.m - 1,
      dateInfo.d,
      dateInfo.H,
      dateInfo.M,
      dateInfo.S
    );
  }
  const str = String(cell ?? "").trim();
  // Format: DD/MM/YYYY HH:mm
  const [datePart, timePart = "00:00"] = str.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

export function parseSales(buffer: Buffer): SaleRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const results: SaleRow[] = [];

  for (const row of rows) {
    const dateCell = row["Tanggal"];
    const refNo = String(row["No Referensi"] ?? "").trim();
    const supplier = String(row["Pemasok"] ?? "").trim();
    const customer = String(row["Konsumen"] ?? "").trim();
    const itemsCell = String(row["Produk (Qty)"] ?? "").trim();
    const grandTotal = parseFloat(String(row["Grand Total"] ?? "0")) || 0;
    const paid = parseFloat(String(row["Terbayar"] ?? "0")) || 0;
    const balance = parseFloat(String(row["Balance"] ?? "0")) || 0;
    const status = String(row["Status Terbayar"] ?? "").trim();

    // Skip header rows or empty rows
    if (!refNo && !customer) continue;

    const date = parseDateCell(dateCell);
    const items = parseItemsCell(itemsCell);

    results.push({
      date,
      refNo,
      supplier,
      customer,
      grandTotal,
      paid,
      balance,
      status,
      items,
    });
  }

  return results;
}
