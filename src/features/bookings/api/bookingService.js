import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Helper to get auth headers
// ✅ Put this instead
const authHeaders = () => {
  const user = JSON.parse(localStorage.getItem('padel-user'));
  const token = user?.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const bookingService = {
  // Get bookings by date and courtId
  getBookingsByDate: async (date, courtId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings`, {
        params: { date, courtId },
        ...authHeaders()
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
      const response = await axios.post(
        `${API_BASE_URL}/bookings`,
        bookingData,
        authHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get all bookings for authenticated user
  getAllBookings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings`, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/bookings/${bookingId}/cancel`,
        {},
        authHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  // Update booking
  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/bookings/${bookingId}`,
        bookingData,
        authHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }
};