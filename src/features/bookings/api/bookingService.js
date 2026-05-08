import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
  const userStr = localStorage.getItem("padel-user");

  if (!userStr) return { "Content-Type": "application/json" };

  try {
    const user = JSON.parse(userStr);
    const token = user.token || user.data?.token; // Try both common paths
    
    if (!token) {
      console.error("Token not found in user object");
      return { "Content-Type": "application/json" };
    }

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  } catch (err) {
    console.error("Error parsing user from localStorage", err);
    return { "Content-Type": "application/json" };
  }
};

export const bookingService = {
  // Get bookings by date and courtId
  getBookingsByDate: async (date, courtId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/date`, { 
      params: { date, courtId },
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by date:', error);
    throw error;
  }
},

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get all bookings for authenticated user
  getAllBookings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {}, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  // Update booking
  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}`, bookingData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // get court by id
  getCourtById: async (courtId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/owner/courts/${courtId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching court by ID:', error);
      throw error;
    }
  }
};
