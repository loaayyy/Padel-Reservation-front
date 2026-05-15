import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const userStr = localStorage.getItem("padel-user");

  if (!userStr) {
    console.error("No user found in localStorage");

    return {
      "Content-Type": "application/json"
    };
  }

  try {
    const user = JSON.parse(userStr);

    console.log("USER FROM STORAGE:", user);

    const token = user.token || user.data?.token;

    if (!token) {
      console.error("Token not found in user object");

      return {
        "Content-Type": "application/json"
      };
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

  } catch (err) {

    console.error("Error parsing user from localStorage", err);

    return {
      "Content-Type": "application/json"
    };
  }
};

export const bookingService = {

  // =========================
  // GET BOOKINGS BY DATE
  // =========================
  getBookingsByDate: async (date, courtId) => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/bookings/date`,
        {
          params: { date, courtId },
          headers: getAuthHeaders()
        }
      );

      return response.data;

    } catch (error) {

      console.log("FULL ERROR:", error.response);
      console.log("ERROR DATA:", error.response?.data);
      console.log("ERROR MESSAGE:", error.response?.data?.message);

      throw error;
    }
  },

  // =========================
  // CREATE BOOKING
  // =========================
  createBooking: async (bookingData) => {
    try {

      console.log("BOOKING DATA SENT:", bookingData);

      const response = await axios.post(
        `${API_BASE_URL}/bookings`,
        bookingData,
        {
          headers: getAuthHeaders()
        }
      );

      console.log("BOOKING SUCCESS:", response.data);

      return response.data;

    } catch (error) {

      console.log("FULL ERROR:", error.response);
      console.log("ERROR DATA:", error.response?.data);
      console.log("ERROR MESSAGE:", error.response?.data?.message);

      throw error;
    }
  },

  // =========================
  // GET ALL BOOKINGS
  // =========================
  getAllBookings: async () => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/bookings`,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data;

    } catch (error) {

      console.log("FULL ERROR:", error.response);
      console.log("ERROR DATA:", error.response?.data);
      console.log("ERROR MESSAGE:", error.response?.data?.message);

      throw error;
    }
  },

  // =========================
  // GET BOOKING BY ID
  // =========================
  getBookingById: async (bookingId) => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/bookings/${bookingId}`,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data;

    } catch (error) {

      console.log("FULL ERROR:", error.response);
      console.log("ERROR DATA:", error.response?.data);
      console.log("ERROR MESSAGE:", error.response?.data?.message);

      throw error;
    }
  },

  // =========================
  // CANCEL BOOKING
  // =========================
  cancelBooking: async (bookingId) => {
    try {

      const response = await axios.delete(
        `${API_BASE_URL}/bookings/${bookingId}`,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data;

    } catch (error) {

      console.log("FULL ERROR:", error.response);
      console.log("ERROR DATA:", error.response?.data);
      console.log("ERROR MESSAGE:", error.response?.data?.message);

      throw error;
    }
  },

  // =========================
  // UPDATE BOOKING
  // =========================
  updateBooking: async (bookingId, bookingData) => {
    try {

      const response = await axios.put(
        `${API_BASE_URL}/bookings/${bookingId}`,
        bookingData,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data;

    } catch (error) {

      console.log("FULL ERROR:", error.response);
      console.log("ERROR DATA:", error.response?.data);
      console.log("ERROR MESSAGE:", error.response?.data?.message);

      throw error;
    }
  },

  // =========================
  // GET COURT BY ID
  // =========================
  getCourtById: async (courtId) => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/courts/${courtId}`,
        {
          headers: getAuthHeaders()
        }
      );

      return response.data;

    } catch (error) {

      console.log("FULL ERROR:", error.response);
      console.log("ERROR DATA:", error.response?.data);
      console.log("ERROR MESSAGE:", error.response?.data?.message);

      throw error;
    }
  }
};