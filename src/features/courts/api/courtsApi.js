import axios from "axios";

const API_BASE = "http://localhost:5000";

// ─── Auth headers ─────────────────────────
const getAuthHeaders = () => {
  const user = localStorage.getItem("padel-user");
  const token = user ? JSON.parse(user).token : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ─── PUBLIC COURTS ─────────────────────────

export async function getPublicCourts(filters = {}) {
  try {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== "" && v !== null && v !== undefined
      )
    );

    const response = await axios.get(`${API_BASE}/courts`, {
      params,
    });

    return Array.isArray(response.data)
      ? response.data
      : response.data.courts || [];
  } catch (err) {
    console.log("ERROR:", err.message);
    throw err;
  }
}

// ─── COURT DETAILS ─────────────────────────

export async function getCourtById(id) {
  const response = await axios.get(`${API_BASE}/courts/${id}`);
  return response.data;
}

// ─── OWNER COURTS ─────────────────────────

export async function getOwnerCourts() {
  const response = await axios.get(`${API_BASE}/owner/courts`, {
    headers: getAuthHeaders(),
  });

  return response.data.courts || response.data;
}

export async function createCourt(data) {
  const response = await axios.post(
    `${API_BASE}/owner/courts`,
    data,
    { headers: getAuthHeaders() }
  );

  return response.data;
}

export async function updateCourt(id, data) {
  const response = await axios.put(
    `${API_BASE}/owner/courts/${id}`,
    data,
    { headers: getAuthHeaders() }
  );

  return response.data;
}

export async function deleteCourt(id) {
  const response = await axios.delete(
    `${API_BASE}/owner/courts/${id}`,
    { headers: getAuthHeaders() }
  );

  return response.data;
}