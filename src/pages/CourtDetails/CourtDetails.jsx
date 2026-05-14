import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourtById } from "../../features/courts/api/courtsApi";
import { bookingService } from '../../features/bookings/api/bookingService';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../../components/payment';
import "./CourtDetails.css";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80";

function Stars({ rating = 0, size = "md" }) {
  const filled = Math.round(rating);
  return (
    <div className={`stars stars--${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star ${n <= filled ? "star--filled" : "star--empty"}`}>★</span>
      ))}
      {rating > 0 && <span className="rating-number">{Number(rating).toFixed(1)}</span>}
    </div>
  );
}

function AmenityBadge({ icon, label }) {
  return (
    <div className="amenity-badge">
      <span className="amenity-icon">{icon}</span>
      <span className="amenity-label">{label}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  const userName = review.user?.name || "Anonymous";
  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const date = new Date(review.createdAt).toLocaleDateString("en-EG", {
    day: "numeric", month: "short", year: "numeric"
  });
  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-avatar">{initials}</div>
        <div className="review-meta">
          <p className="review-name">{userName}</p>
          <p className="review-date">{date}</p>
        </div>
        <div className="review-stars">
          {[1,2,3,4,5].map(n => (
            <span key={n} style={{ color: n <= review.rating ? "#f97316" : "#e5e7eb", fontSize: "1rem" }}>★</span>
          ))}
        </div>
      </div>
      {review.comment && <p className="review-comment">{review.comment}</p>}
    </div>
  );
}

export default function CourtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        setLoading(true);
        const data = await getCourtById(id);
        setCourt(data.court || data);
      } catch (err) {
        setError("Failed to load court");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourt();
  }, [id]);

  const timeSlots = [
    "08:00","09:00","10:00","11:00","12:00","13:00","14:00",
    "15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00",
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setBookingLoading(true);
    setBookingError("");

    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endTime = new Date(`${selectedDate}T${selectedTime}:00`);
      endTime.setHours(endTime.getHours() + 1);

      await bookingService.createBooking({
        courtId: id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPrice: court.pricePerHour,
      });

      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    handleBooking();
  };

  if (loading) return (
    <div className="cd-loader">
      <div className="cd-spinner" />
      <p>Loading court details…</p>
    </div>
  );
  if (error) return <div className="cd-error"><span>⚠️</span> {error}</div>;
  if (!court) return <div className="cd-error">No court found</div>;

  const heroImage = court.imageUrl && court.imageUrl.trim() !== "" ? court.imageUrl : DEFAULT_IMAGE;
  const reviews = court.reviews || [];

  const amenities = [
    { icon: "🚿", label: "Showers" },
    { icon: "🅿️", label: "Parking" },
    { icon: "💡", label: "Floodlights" },
    { icon: "🎽", label: "Equipment Rental" },
    { icon: "🥤", label: "Refreshments" },
    { icon: "🔒", label: "Lockers" },
  ];

  return (
    <div className="cd-page">

      {/* PAYMENT MODAL */}
      {showPayment && (
        <PaymentModal
          amount={court.pricePerHour}
          courtName={court.name}
          date={new Date(selectedDate).toLocaleDateString("en-EG", {
            weekday: "short", day: "numeric", month: "short"
          })}
          time={`${selectedTime} – ${String(Number(selectedTime.split(":")[0]) + 1).padStart(2, "0")}:00`}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* HERO */}
      <div className="cd-hero">
        <div className="cd-hero__image" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="cd-hero__overlay" />
          <div className="cd-hero__content">
            <button className="cd-back-btn" onClick={() => navigate(-1)}>← Back</button>
            <div className="cd-hero__badge">Padel Court</div>
            <h1 className="cd-hero__title">{court.name}</h1>
            <div className="cd-hero__meta">
              <span className="cd-hero__location">📍 {court.location}</span>
              {court.avgRating
                ? <Stars rating={court.avgRating} size="sm" />
                : <span className="cd-hero__no-rating">No ratings yet</span>}
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="cd-body">
        <div className="cd-grid">
          {/* LEFT */}
          <div className="cd-left">
            <div className="cd-stats">
              <div className="cd-stat">
                <span className="cd-stat__icon">💰</span>
                <div>
                  <p className="cd-stat__value">{court.pricePerHour} EGP</p>
                  <p className="cd-stat__label">Per Hour</p>
                </div>
              </div>
              <div className="cd-stat">
                <span className="cd-stat__icon">⭐</span>
                <div>
                  <p className="cd-stat__value">{court.avgRating ? Number(court.avgRating).toFixed(1) : "N/A"}</p>
                  <p className="cd-stat__label">Rating {court.reviewCount > 0 ? `(${court.reviewCount})` : ""}</p>
                </div>
              </div>
              <div className="cd-stat">
                <span className="cd-stat__icon">🕒</span>
                <div>
                  <p className="cd-stat__value">1 hr</p>
                  <p className="cd-stat__label">Min. Booking</p>
                </div>
              </div>
              <div className="cd-stat">
                <span className="cd-stat__icon">👥</span>
                <div>
                  <p className="cd-stat__value">4</p>
                  <p className="cd-stat__label">Max Players</p>
                </div>
              </div>
            </div>

            <div className="cd-section">
              <h2 className="cd-section__title">About this Court</h2>
              <p className="cd-section__text">
                {court.description || "A premium padel court ready for your next match. Book your session and enjoy a world-class playing experience."}
              </p>
            </div>

            <div className="cd-section">
              <h2 className="cd-section__title">Amenities</h2>
              <div className="cd-amenities">
                {amenities.map((a) => <AmenityBadge key={a.label} icon={a.icon} label={a.label} />)}
              </div>
            </div>

            <div className="cd-section">
              <h2 className="cd-section__title">Location</h2>
              <div className="cd-location-box">
                <span className="cd-location-icon">📍</span>
                <div>
                  <p className="cd-location-name">{court.location}</p>
                  <p className="cd-location-sub">Cairo, Egypt</p>
                </div>
              </div>
            </div>

            <div className="cd-section">
              <h2 className="cd-section__title">
                Reviews
                {reviews.length > 0 && (
                  <span className="cd-reviews-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                )}
              </h2>
              {reviews.length === 0 ? (
                <div className="cd-no-reviews">
                  <span className="cd-no-reviews__icon">💬</span>
                  <p>No reviews yet. Be the first to review this court!</p>
                </div>
              ) : (
                <div className="cd-reviews-list">
                  {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Booking Card */}
          <div className="cd-right">
            <div className="cd-booking-card">
              <div className="cd-booking-card__header">
                <span className="cd-booking-card__price">{court.pricePerHour} EGP</span>
                <span className="cd-booking-card__per">/hour</span>
              </div>
              {court.avgRating
                ? <Stars rating={court.avgRating} size="lg" />
                : <p className="cd-no-rating-text">No ratings yet</p>}

              <div className="cd-booking-form">
                <label className="cd-label">Select Date</label>
                <input
                  type="date"
                  className="cd-input"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />

                <label className="cd-label">Select Time Slot</label>
                <div className="cd-time-grid">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      className={`cd-time-btn ${selectedTime === t ? "cd-time-btn--active" : ""}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {selectedDate && selectedTime && (
                  <div className="cd-summary">
                    <div className="cd-summary__row">
                      <span>Date</span>
                      <span>{new Date(selectedDate).toLocaleDateString("en-EG", { weekday: "short", day: "numeric", month: "short" })}</span>
                    </div>
                    <div className="cd-summary__row">
                      <span>Time</span>
                      <span>{selectedTime} – {String(Number(selectedTime.split(":")[0]) + 1).padStart(2, "0")}:00</span>
                    </div>
                    <div className="cd-summary__row cd-summary__row--total">
                      <span>Total</span>
                      <span>{court.pricePerHour} EGP</span>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "8px" }}>
                    {bookingError}
                  </p>
                )}

                <button
                  className={`cd-book-btn ${!selectedDate || !selectedTime ? "cd-book-btn--disabled" : ""}`}
                  onClick={() => setShowPayment(true)}
                  disabled={!selectedDate || !selectedTime || bookingLoading}
                >
                  {bookingLoading ? "Booking..." : bookingSuccess ? "✅ Booking Confirmed!" : "Book Now"}
                </button>

                {(!selectedDate || !selectedTime) && (
                  <p className="cd-booking-hint">Please select a date and time to continue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
