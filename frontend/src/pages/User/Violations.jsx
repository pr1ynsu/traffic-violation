// src/pages/User/Violations.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher";

export default function Violations() {
  const columns = [
    { key: "vehicle", label: "Vehicle No." },
    { key: "violation", label: "Violation" },
    { key: "timestamp", label: "Timestamp" },
  ];
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="violations" role="user" />;
}

