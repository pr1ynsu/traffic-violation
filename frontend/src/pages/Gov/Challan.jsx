// src/pages/Gov/Challan.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher";

export default function Challan() {
  const columns = [
    { key: "vehicle", label: "Vehicle No." },
    { key: "challan", label: "Challan" },
    { key: "violation", label: "Violation" },
    { key: "ownerName", label: "Owner" },
    { key: "timestamp", label: "Timestamp" },
  ];
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="all" role="gov" />;
}
