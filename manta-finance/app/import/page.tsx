"use client";

import { useState } from "react";
import Link from "next/link";
import PeriodManager from "./PeriodManager";
import UploadPanel from "./UploadPanel";

export default function ImportPage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manta Racing Finance</h1>
          <p className="text-xs text-gray-500">Dashboard Keuangan Internal</p>
        </div>
      </header>
      <nav className="bg-white border-b border-gray-100 px-6 py-2 flex gap-4">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Dashboard
        </Link>
        <Link
          href="/import"
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold border-b-2 border-blue-600"
        >
          Import Data
        </Link>
        <Link href="/stock" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Stock
        </Link>
        <Link href="/sales" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Penjualan
        </Link>
        <Link href="/finance" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Finance
        </Link>
        <Link href="/receivables" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Piutang
        </Link>
        <Link href="/export" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Export
        </Link>
      </nav>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Import Data</h1>
        <PeriodManager onPeriodSelect={setSelectedPeriodId} />
        <UploadPanel periodId={selectedPeriodId} />
      </div>
    </div>
  );
}
