// src/pages/Gov/Violations.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher";

export default function Violations() {
  const columns = [
    { key: "vehicle", label: "Vehicle No." },
    { key: "violation", label: "Violation" },
    { key: "timestamp", label: "Timestamp" },
    { key: "ownerName", label: "Owner" },
    { key: "ownerPhone", label: "Phone" },
  ];
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="violations" role="gov" />;
}
