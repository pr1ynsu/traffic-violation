// src/pages/User/Credits.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher";

export default function Credits() {
  const columns = [
    { key: "id", label: "ID" },
    { key: "vehicle_number", label: "Vehicle No." },
    { key: "credits_rupees", label: "Credits (₹)" },
    { key: "violation_text", label: "Violation" },
    { key: "timestamp", label: "Timestamp", render: (row) => new Date(row.timestamp).toLocaleString() },
    { key: "verified", label: "Status", render: (row) => row.verified ? "Verified" : "Pending" }
  ];
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="credits" role="user" />;
}
