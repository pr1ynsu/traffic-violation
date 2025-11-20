// src/pages/User/Challan.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher"; // your existing mock fetcher (optional)

export default function Challan() {
  const columns = [
    { key: "vehicle_number", label: "Vehicle No." },
    { key: "challan_rupees", label: "Challan" },
    { key: "violation_text", label: "Violation" },
    { key: "timestamp", label: "Timestamp" },
  ];

  // If you want to use real backend at runtime, pass fetcher={null}
  // or omit fetcher so RecordsTable will try /api/violations/... endpoints.
  // You can pass your mockFetcher for local testing.
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="user-challan" role="user" />;
}
