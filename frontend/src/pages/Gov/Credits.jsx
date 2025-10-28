// src/pages/Gov/Credits.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import mockFetcher from "../../utils/mockFetcher";

export default function Credits() {
  const columns = [
    { key: "vehicle", label: "Vehicle No." },
    { key: "credits", label: "Credits" },
    { key: "timestamp", label: "Timestamp" },
    { key: "ownerName", label: "Owner" },
  ];
  return <RecordsTable columns={columns} fetcher={mockFetcher} type="credits" role="gov" />;
}
