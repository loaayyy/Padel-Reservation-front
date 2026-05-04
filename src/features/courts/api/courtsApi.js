import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getCourtList(params) {
  const response = await http.get("/courts", { params });
  return response.data;
}

export async function getOwnerCourts(ownerId) {
  return getCourtList({ ownerId });
}

export async function createCourt(court) {
  const response = await http.post("/courts", court);
  return response.data;
}

export async function updateCourt(id, court) {
  const response = await http.put(`/courts/${id}`, court);
  return response.data;
}

export async function deleteCourt(id) {
  const response = await http.delete(`/courts/${id}`);
  return response.data;
}
