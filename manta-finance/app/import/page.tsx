"use client";

import { useState } from "react";
import Sidebar from "../_components/Sidebar";
import PeriodManager from "./PeriodManager";
import UploadPanel from "./UploadPanel";

export default function ImportPage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-8">Import Data</h1>
          <PeriodManager onPeriodSelect={setSelectedPeriodId} />
          <UploadPanel periodId={selectedPeriodId} />
        </div>
      </main>
    </div>
  );
}
