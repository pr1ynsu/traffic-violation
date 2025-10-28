// src/utils/mockFetcher.js
// thin wrapper to match RecordsTable expected fetcher signature
import { apiGetRecords } from "../api/apiClient";

export default async function mockFetcher({ type, owner, page, q }) {
  return apiGetRecords({ type, owner, page, q });
}
