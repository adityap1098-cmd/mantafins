"use client";

import { useState } from "react";
import PeriodManager from "./PeriodManager";
import UploadPanel from "./UploadPanel";

export default function ImportPage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Import Data</h1>
        <PeriodManager onPeriodSelect={setSelectedPeriodId} />
        <UploadPanel periodId={selectedPeriodId} />
      </div>
    </div>
  );
}
