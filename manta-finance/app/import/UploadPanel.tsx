"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

interface UploadPanelProps {
  periodId: string;
}

interface UploadResult {
  type: "success" | "warning" | "error";
  message: string;
  warnings?: string[];
}

function FileUploadArea({
  label,
  accept,
  disabled,
  onUpload,
}: {
  label: string;
  accept: string;
  disabled: boolean;
  onUpload: (file: File) => Promise<UploadResult>;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setResult(null);
    try {
      const uploadResult = await onUpload(file);
      setResult(uploadResult);
    } catch (err) {
      setResult({ type: "error", message: String(err) });
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="border border-border rounded-xl p-5 bg-card/50">
      <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        {label}
      </h3>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${disabled ? "border-border/50 bg-muted/30 cursor-not-allowed" : "border-primary/30 hover:border-primary hover:bg-primary/5 cursor-pointer"}
          ${uploading ? "opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled || uploading}
          className="hidden"
        />
        <Upload className={`h-10 w-10 mx-auto mb-3 ${disabled ? "text-muted-foreground/50" : "text-primary/70"}`} />
        {uploading ? (
          <p className="text-muted-foreground text-sm">Mengunggah...</p>
        ) : disabled ? (
          <p className="text-muted-foreground/70 text-sm">Pilih periode terlebih dahulu</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Klik atau drag &amp; drop file Excel (.xlsx)
          </p>
        )}
      </div>

      {result && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm
            ${result.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : ""}
            ${result.type === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : ""}
            ${result.type === "error" ? "bg-destructive/10 text-destructive border border-destructive/20" : ""}`}
        >
          <p>{result.message}</p>
          {result.warnings && result.warnings.length > 0 && (
            <ul className="mt-2 list-disc list-inside opacity-80">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadPanel({ periodId }: UploadPanelProps) {
  async function uploadProducts(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/upload/products?periodId=${periodId}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload gagal");
    if (data.count !== undefined) {
      return {
        type: "success",
        message: `Berhasil import ${data.count} produk`,
      };
    }
    throw new Error(data.error ?? "Upload gagal");
  }

  async function uploadSales(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/upload/sales?periodId=${periodId}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload gagal");
    if (data.count !== undefined) {
      const hasWarnings = data.warnings && data.warnings.length > 0;
      return {
        type: hasWarnings ? "warning" : "success",
        message: `Berhasil import ${data.count} transaksi${hasWarnings ? ` (${data.warnings.length} produk tidak cocok)` : ""}`,
        warnings: data.warnings,
      };
    }
    throw new Error(data.error ?? "Upload gagal");
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Upload File</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadArea
          label="1. Data Produk (Products Excel)"
          accept=".xlsx,.xls"
          disabled={!periodId}
          onUpload={uploadProducts}
        />
        <FileUploadArea
          label="2. Laporan Penjualan (Sales Report Excel)"
          accept=".xlsx,.xls"
          disabled={!periodId}
          onUpload={uploadSales}
        />
      </div>
    </div>
  );
}
