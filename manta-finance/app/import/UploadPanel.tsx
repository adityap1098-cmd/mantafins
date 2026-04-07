"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";

interface UploadPanelProps {
  periodId: string;
}

interface UploadResult {
  type: "success" | "warning" | "error";
  message: string;
  warnings?: string[];
}

interface PreviewData {
  headers: string[];
  rows: string[][];
}

export default function UploadPanel({ periodId }: UploadPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function readPreview(file: File): Promise<PreviewData | null> {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) return null;
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
      if (rows.length === 0) return null;
      const MAX_COLS = 6;
      const rawHeaders = (rows[0] as unknown[]).map((h) => String(h ?? ""));
      const headers = rawHeaders.slice(0, MAX_COLS);
      const hasMoreCols = rawHeaders.length > MAX_COLS;
      if (hasMoreCols) headers.push("...");
      const dataRows = rows.slice(1, 6).map((row) => {
        const cells = (row as unknown[]).map((c) => String(c ?? ""));
        const sliced = cells.slice(0, MAX_COLS);
        if (hasMoreCols) sliced.push("...");
        return sliced;
      });
      return { headers, rows: dataRows };
    } catch {
      return null;
    }
  }

  async function handleFile(file: File) {
    setUploading(true);
    setResult(null);
    setPreviewData(null);

    const preview = await readPreview(file);
    if (preview) setPreviewData(preview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/upload/sales?periodId=${periodId}`, {
        method: "POST",
        body: formData,
      });
      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server error: respons tidak valid. Coba lagi.");
      }
      if (!res.ok) throw new Error((data.error as string) ?? "Upload gagal");

      if (data.count !== undefined) {
        const hasWarnings = Array.isArray(data.warnings) && data.warnings.length > 0;
        setResult({
          type: hasWarnings ? "warning" : "success",
          message: `Berhasil import ${data.count} transaksi${hasWarnings ? ` (${(data.warnings as string[]).length} produk tidak cocok)` : ""}`,
          warnings: data.warnings as string[],
        });
      } else {
        throw new Error((data.error as string) ?? "Upload gagal");
      }
    } catch (err) {
      setResult({ type: "error", message: String(err) });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mr-card p-6">
      <h2 className="text-sm font-semibold text-[var(--text-1)] mb-4">Upload Laporan Penjualan</h2>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "opacity-60" : "cursor-pointer"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <p className="text-[var(--text-3)] text-sm">Mengunggah...</p>
        ) : (
          <div className="text-center">
            <p className="text-[var(--text-2)] text-sm font-medium">Klik atau drag & drop file Sales Excel (.xlsx)</p>
            <p className="text-[var(--text-3)] text-xs mt-1">Kolom: Tanggal, No Referensi, Konsumen, Produk (Qty), Grand Total, Terbayar, Balance, Status</p>
          </div>
        )}
      </div>

      {result && (
        <div className={`mt-3 p-3 rounded-lg text-sm
          ${result.type === "success" ? "bg-[var(--green-bg)] text-[var(--green-t)]" : ""}
          ${result.type === "warning" ? "bg-[var(--orange-bg)] text-[var(--orange-t)]" : ""}
          ${result.type === "error" ? "bg-[var(--red-bg)] text-[var(--red-t)]" : ""}`}
        >
          <p>{result.message}</p>
          {result.warnings && result.warnings.length > 0 && (
            <ul className="mt-2 list-disc list-inside">
              {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          )}
        </div>
      )}

      {previewData && (
        <div className="mt-3">
          <p className="text-xs text-[var(--text-3)] mb-1 font-medium">Preview: 5 baris pertama</p>
          <div className="overflow-x-auto">
            <table className="mr-table w-full text-xs">
              <thead>
                <tr>
                  {previewData.headers.map((h, i) => (
                    <th key={i} className="text-left px-2 py-1 text-[var(--text-2)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1 text-[var(--text-3)]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
