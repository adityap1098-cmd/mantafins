"use client";

import { useState, useRef } from "react";

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
    <div className="border border-gray-200 rounded-lg p-5">
      <h3 className="font-medium text-gray-700 mb-3">{label}</h3>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${disabled ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-blue-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"}
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
        {uploading ? (
          <p className="text-gray-500 text-sm">Mengunggah...</p>
        ) : disabled ? (
          <p className="text-gray-400 text-sm">Pilih periode terlebih dahulu</p>
        ) : (
          <p className="text-gray-500 text-sm">
            Klik atau drag &amp; drop file Excel (.xlsx)
          </p>
        )}
      </div>

      {result && (
        <div
          className={`mt-3 p-3 rounded text-sm
            ${result.type === "success" ? "bg-green-50 text-green-700" : ""}
            ${result.type === "warning" ? "bg-yellow-50 text-yellow-700" : ""}
            ${result.type === "error" ? "bg-red-50 text-red-700" : ""}`}
        >
          <p>{result.message}</p>
          {result.warnings && result.warnings.length > 0 && (
            <ul className="mt-2 list-disc list-inside">
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload File</h2>
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
