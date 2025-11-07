// src/pages/User/Violations.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher";

export default function Violations() {
  const columns = [
    { key: "id", label: "ID" },
    { key: "vehicle_number", label: "Vehicle No." },
    { key: "violation_text", label: "Violation" },
    { key: "violation_code", label: "Code" },
    { key: "challan_rupees", label: "Challan (₹)" },
    { key: "credits_rupees", label: "Credits (₹)" },
    { key: "timestamp", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
    { key: "verified", label: "Status", render: (row) => row.verified ? "Verified" : "Pending" }
  ];
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="violations" role="user" />;
}

