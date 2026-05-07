import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const getAuthHeaders = () => {
  const userStr = localStorage.getItem("padel-user");
  if (!userStr) return { "Content-Type": "application/json" };

  try {
    const user = JSON.parse(userStr);
    const token = user.token || user.data?.token;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  } catch (err) {
    console.error("Error parsing auth token:", err);
    return { "Content-Type": "application/json" };
  }
};

const normalizeBookings = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.bookings)) return data.bookings;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

export default function CourtCard({ court, onEdit, onDelete }) {
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  const courtId = court.id ?? court._id;

  const fetchBookings = async () => {
    if (!courtId) return;

    setBookingsLoading(true);
    setBookingsError(null);

    try {
      const response = await axios.get(`${API_BASE}/owner/courts/${courtId}/bookings`, {
        headers: getAuthHeaders(),
      });
      setBookings(normalizeBookings(response.data));
    } catch (error) {
      setBookings([]);
      setBookingsError(error.response?.data?.message || error.message || "Unable to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (showBookings) {
      fetchBookings();
    }
  }, [showBookings, courtId]);

  const toggleBookings = () => {
    setShowBookings((prev) => !prev);
  };

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="card-title">{court.name}</h5>
            <p className="card-text text-muted mb-1">{court.location}</p>
          </div>
          <div className="text-end">
            <span className="badge bg-primary">{court.surface || "Padel"}</span>
          </div>
        </div>
        <p className="mb-1">{court.description || "No description added yet."}</p>
        <p className="mb-2">
          <strong>Price:</strong> ${court.pricePerHour || 0}/hr
        </p>

        <div className="d-flex gap-2 mb-3">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(court)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(courtId)}
          >
            Delete
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-info"
            onClick={toggleBookings}
          >
            {showBookings ? "Hide Bookings" : "Show Bookings"}
          </button>
        </div>

        {showBookings && (
          <div className="bookings-section">
            <h6>Bookings</h6>
            {bookingsLoading && <div className="text-muted">Loading bookings...</div>}
            {bookingsError && <div className="text-danger">Error: {bookingsError}</div>}
            {!bookingsLoading && !bookingsError && bookings.length === 0 && (
              <div className="text-muted">No bookings found for this court.</div>
            )}
            {!bookingsLoading && !bookingsError && bookings.length > 0 && (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id || booking._id} className="booking-item border rounded p-2 mb-2">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{booking.user?.name || booking.user?.email || 'Unknown User'}</strong>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <div className="mt-1">
                      <small>
                        Time: {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                      <br />
                      <small>
                        Status:{' '}
                        <span className={`badge ${booking.status === 'Completed' ? 'bg-success' : booking.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                          {booking.status || 'Upcoming'}
                        </span>
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
