// src/api/apiClient.js
// Facade that uses localDB mock & returns fetch-like shape: { data, meta }
import { localDB } from "../data/localDB.js";

function delay(ms = 150) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiGetRecords({ type = "violations", owner, page = 1, q = "" } = {}) {
  // simulate network latency
  await delay(120);

  // localDB returns enriched records already
  const data = localDB.getRecords({ type, owner });

  // simple client-side filter (q) for demo
  const filtered = q
    ? data.filter(
        (r) =>
          (r.vehicle && r.vehicle.toLowerCase().includes(q.toLowerCase())) ||
          (r.violation && r.violation.toLowerCase().includes(q.toLowerCase())) ||
          (r.ownerName && r.ownerName.toLowerCase().includes(q.toLowerCase()))
      )
    : data;

  // simple page (pageSize = 10)
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return { data: paged, meta: { total: filtered.length, page, pageSize } };
}

export async function apiGetUserByRole(role) {
  await delay(60);
  const u = localDB.getUserByRole(role);
  return u;
}
