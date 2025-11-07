// src/pages/Gov/Challan.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher";

export default function Challan() {
  const columns = [
    { key: "id", label: "ID" },
    { key: "vehicle_number", label: "Vehicle No." },
    { key: "challan_rupees", label: "Challan (₹)" },
    { key: "violation_text", label: "Violation" },
    { key: "offender_name", label: "Owner" },
    { key: "timestamp", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
    { key: "verified", label: "Status", render: (row) => row.verified ? "Verified" : "Pending" }
  ];
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="all" role="gov" />;
}
