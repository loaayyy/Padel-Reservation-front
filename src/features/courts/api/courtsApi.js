import axios from "axios";

const API_BASE = "http://localhost:5000";

// Get auth token from localStorage
const getAuthHeaders = () => {
  const user = localStorage.getItem("padel-user");
  const token = user ? JSON.parse(user).token : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Add a new court (Owner only)
export async function createCourt(courtData) {
  const response = await axios.post(`${API_BASE}/owner/courts`, courtData, {
    headers: getAuthHeaders(),
  });
  return response.data.court || response.data;
}

// Get all courts for the logged-in owner
export async function getOwnerCourts() {
  const response = await axios.get(`${API_BASE}/owner/courts`, {
    headers: getAuthHeaders(),
  });
  return response.data.courts || response.data;
}

// Update court details
export async function updateCourt(courtId, courtData) {
  const response = await axios.put(`${API_BASE}/owner/courts/${courtId}`, courtData, {
    headers: getAuthHeaders(),
  });
  return response.data.court || response.data;
}

// Delete a court
export async function deleteCourt(courtId) {
  const response = await axios.delete(`${API_BASE}/owner/courts/${courtId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

// Get all courts (public endpoint)
export async function getCourtList(params) {
  const response = await axios.get(`${API_BASE}/courts/public`, { params });
  return response.data;
}
