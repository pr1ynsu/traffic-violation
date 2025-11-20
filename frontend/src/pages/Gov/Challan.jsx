// src/pages/Gov/Challan.jsx
import React from "react";
import RecordsTable from "../../components/RecordsTable";
import govFetcher from "../../utils/govFetcher";

export default function Challan() {
  const columns = [
    { key: "id", label: "ID" },
    { key: "timestamp", label: "Timestamp" },
    { key: "vehicleNumber", label: "Vehicle No." },
    { key: "violationCode", label: "Violation Code" },
    { key: "violationText", label: "Violation" },
    { key: "offenderName", label: "Offender" },
    { key: "challanRupees", label: "Challan (₹)" },
    { key: "creditsRupees", label: "Credits (₹)" },
  ];
  return <RecordsTable columns={columns} fetcher={govFetcher} type="all" role="gov" />;
}
