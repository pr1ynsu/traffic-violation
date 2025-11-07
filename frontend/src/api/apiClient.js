// src/api/apiClient.js
// API client for backend integration
import { io } from "socket.io-client";

const API_BASE = "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGetRecords({ type = "violations", owner, page = 1, q = "" } = {}) {
  const params = new URLSearchParams({ type, page, q });
  if (owner) params.append("owner", owner);

  const res = await fetch(`${API_BASE}/api/violations?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiGetUserByRole(role) {
  const res = await fetch(`${API_BASE}/api/auth/user?role=${role}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Socket.IO integration for forum
let socket = null;

export function initSocket(token) {
  if (socket) socket.disconnect();
  socket = io(`${API_BASE}/forum`, {
    auth: { token },
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export async function apiGetForumMessages() {
  const res = await fetch(`${API_BASE}/api/forum`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiSendForumMessage({ roomId, text, meta }) {
  const res = await fetch(`${API_BASE}/api/forum`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ roomId, text, meta }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
