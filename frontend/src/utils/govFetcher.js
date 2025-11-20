// src/utils/govFetcher.js
// Fetcher for government pages that gets data from CSV via backend

export default async function govFetcher({ type, role }) {
  if (role !== 'gov') return [];

  try {
    const res = await fetch('/api/violations/csv');
    if (!res.ok) throw new Error('Failed to fetch CSV data');
    const data = await res.json();

    // For credits, filter to show only violations with credits > 0
    if (type === 'credits') {
      return data.filter(row => row.creditsRupees > 0);
    }

    // For violations, all, or any other type, return all data
    return data;
  } catch (error) {
    console.error('govFetcher error:', error);
    return [];
  }
}
