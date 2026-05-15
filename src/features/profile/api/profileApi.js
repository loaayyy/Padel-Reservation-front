import axios from "axios";

const API_BASE = "http://localhost:5000";

const getAuthHeaders = () => {
  try {
    const userStr = localStorage.getItem("padel-user");
    if (!userStr) return { "Content-Type": "application/json" };
    const user = JSON.parse(userStr);
    const token = user.token || user.data?.token;
    if (!token) return { "Content-Type": "application/json" };
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  } catch {
    return { "Content-Type": "application/json" };
  }
};

export async function getMyBookings(userId) {
  const response = await axios.get(`${API_BASE}/bookings/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data.bookings ?? response.data;
}

export async function getMyProfile() {
  const response = await axios.get(`${API_BASE}/user/me`, {
    headers: getAuthHeaders(),
  });
  return response.data.user ?? response.data;
}

export async function updateMyProfile(data) {
  const response = await axios.put(`${API_BASE}/user/me`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.user ?? response.data;
}

export async function updatePassword(data) {
  const response = await axios.put(`${API_BASE}/user/me/password`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function submitReview({ courtId, rating, comment }) {
  const response = await axios.post(
    `${API_BASE}/reviews`,
    { courtId, rating, comment },
    { headers: getAuthHeaders() },
  );
  return response.data;
}

export async function cancelBooking(bookingId) {
  const response = await axios.put(
    `${API_BASE}/bookings/${bookingId}/cancel`,
    {},
    { headers: getAuthHeaders() },
  );
  return response.data;
}
