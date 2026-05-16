import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCourtById } from "../../features/courts/api/courtsApi";
import { bookingService } from "../../features/bookings/api/bookingService";
import { useAuth } from "../../context/AuthContext";
import PaymentModal from "../../components/payment";
import { submitReview } from "../../features/profile/api/profileApi";
import "./CourtDetails.css";

// Fix leaflet marker icon bug in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80";
const CAIRO_CENTER = [30.0444, 31.2357];

const PROMO_CODES = {
  PADEL10: 10,
  WELCOME20: 20,
  CAIRO15: 15,
};

function CourtMap({ locationText, courtName }) {
  const [coords, setCoords] = useState(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!locationText) return;
    const query = encodeURIComponent(`${locationText}, Cairo, Egypt`);
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setCoords(CAIRO_CENTER);
        }
      })
      .catch(() => {
        setCoords(CAIRO_CENTER);
        setMapError(true);
      });
  }, [locationText]);

  if (!coords) {
    return (
      <div className="cd-map-loading">
        <div className="cd-spinner" />
        <p>Loading map…</p>
      </div>
    );
  }

  return (
    <div className="cd-map-wrapper">
      {mapError && (
        <p className="cd-map-note">
          ⚠️ Exact location not found — showing Cairo center
        </p>
      )}
      <MapContainer
        center={coords}
        zoom={15}
        style={{ height: "300px", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>{courtName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

function Stars({ rating = 0, size = "md" }) {
  const filled = Math.round(rating);
  return (
    <div className={`stars stars--${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${n <= filled ? "star--filled" : "star--empty"}`}
        >
          ★
        </span>
      ))}
      {rating > 0 && (
        <span className="rating-number">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}

// Interactive star picker for review form
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: 32,
            color: n <= (hovered || value) ? "#f97316" : "#d1d5db",
            transition: "color 0.12s, transform 0.1s",
            transform: n <= (hovered || value) ? "scale(1.15)" : "scale(1)",
            display: "inline-block",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
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
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const date = new Date(review.createdAt).toLocaleDateString("en-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              style={{
                color: n <= review.rating ? "#f97316" : "#e5e7eb",
                fontSize: "1rem",
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      {review.comment && <p className="review-comment">{review.comment}</p>}
    </div>
  );
}

// ── Inline Review Form Component ──────────────────────────────────────────────
function ReviewForm({ courtId, onSuccess, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    setError("");
    try {
      await submitReview({ courtId, rating, comment });
      setDone(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit review. Make sure you have a completed booking for this court.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="cd-review-form cd-review-form--success">
        <div style={{ fontSize: 40 }}>✅</div>
        <p style={{ fontWeight: 700, color: "#16a34a", margin: "8px 0 0" }}>
          Review submitted — thank you!
        </p>
      </div>
    );
  }

  return (
    <div className="cd-review-form">
      <h3 className="cd-review-form__title">Write a Review</h3>

      <div className="cd-review-form__field">
        <label className="cd-label">Your Rating *</label>
        <StarPicker value={rating} onChange={setRating} />
        {!rating && (
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            Tap a star to rate
          </p>
        )}
      </div>

      <div className="cd-review-form__field">
        <label className="cd-label">Comment (optional)</label>
        <textarea
          className="cd-input"
          rows={3}
          placeholder="How was the court? Tell other players…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ resize: "none", fontFamily: "inherit" }}
        />
      </div>

      {error && (
        <p
          style={{
            color: "#dc2626",
            fontSize: 13,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="cd-book-btn"
          onClick={handleSubmit}
          disabled={!rating || submitting}
          style={{
            flex: 1,
            background: rating ? "#f97316" : "#e5e7eb",
            color: rating ? "#fff" : "#9ca3af",
            cursor: rating ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 600,
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Cancel
        </button>
      </div>
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
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchCourt = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourtById(id);
      setCourt(data.court || data);
    } catch (err) {
      setError("Failed to load court");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchCourt();
  }, [id, fetchCourt]);

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setDiscount(PROMO_CODES[code]);
      setPromoSuccess(`✅ "${code}" applied — ${PROMO_CODES[code]}% off!`);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code. Try PADEL10, WELCOME20, or CAIRO15.");
      setPromoSuccess("");
      setDiscount(0);
    }
  };

  const finalPrice = court
    ? Math.round(court.pricePerHour * (1 - discount / 100))
    : 0;

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
        totalPrice: finalPrice,
        promoCode: promoCode || null,
        discountPercent: discount,
      });
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      setBookingError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    handleBooking();
  };

  // After review submitted: hide form + reload court so new review appears
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchCourt();
  };

  if (loading)
    return (
      <div className="cd-loader">
        <div className="cd-spinner" />
        <p>Loading court details…</p>
      </div>
    );
  if (error)
    return (
      <div className="cd-error">
        <span>⚠️</span> {error}
      </div>
    );
  if (!court) return <div className="cd-error">No court found</div>;

  const heroImage =
    court.imageUrl && court.imageUrl.trim() !== ""
      ? court.imageUrl
      : DEFAULT_IMAGE;
  const secondaryImages = Array.isArray(court.secondaryImages)
    ? court.secondaryImages.filter((img) => img && img.trim() !== "")
    : [];
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
          amount={finalPrice}
          courtName={court.name}
          date={new Date(selectedDate).toLocaleDateString("en-EG", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
          time={`${selectedTime} – ${String(Number(selectedTime.split(":")[0]) + 1).padStart(2, "0")}:00`}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* HERO */}
      <div className="cd-hero">
        <div
          className="cd-hero__image"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="cd-hero__overlay" />
          <div className="cd-hero__content">
            <button className="cd-back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div className="cd-hero__badge">Padel Court</div>
            <h1 className="cd-hero__title">{court.name}</h1>
            <div className="cd-hero__meta">
              <span className="cd-hero__location">📍 {court.location}</span>
              {court.avgRating ? (
                <Stars rating={court.avgRating} size="sm" />
              ) : (
                <span className="cd-hero__no-rating">No ratings yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {secondaryImages.length > 0 && (
        <div className="cd-secondary-gallery">
          {secondaryImages.map((src, index) => (
            <div
              key={index}
              className="cd-secondary-image"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      )}

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
                  <p className="cd-stat__value">
                    {court.avgRating
                      ? Number(court.avgRating).toFixed(1)
                      : "N/A"}
                  </p>
                  <p className="cd-stat__label">
                    Rating{" "}
                    {court.reviewCount > 0 ? `(${court.reviewCount})` : ""}
                  </p>
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
                {court.description ||
                  "A premium padel court ready for your next match. Book your session and enjoy a world-class playing experience."}
              </p>
            </div>

            <div className="cd-section">
              <h2 className="cd-section__title">Amenities</h2>
              <div className="cd-amenities">
                {amenities.map((a) => (
                  <AmenityBadge key={a.label} icon={a.icon} label={a.label} />
                ))}
              </div>
            </div>

            {/* LOCATION + MAP */}
            <div className="cd-section">
              <h2 className="cd-section__title">Location</h2>
              <div className="cd-location-box">
                <span className="cd-location-icon">📍</span>
                <div>
                  <p className="cd-location-name">{court.location}</p>
                  <p className="cd-location-sub">Cairo, Egypt</p>
                </div>
              </div>
              <CourtMap locationText={court.location} courtName={court.name} />
            </div>

            {/* ── REVIEWS SECTION ────────────────────────────────────────── */}
            <div className="cd-section">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <h2 className="cd-section__title" style={{ margin: 0 }}>
                  Reviews
                  {reviews.length > 0 && (
                    <span className="cd-reviews-count">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h2>

                {/* Show "Write a Review" only to logged-in players, and only if form is hidden */}
                {user && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    style={{
                      background: "#f97316",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "9px 20px",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "background 0.15s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#ea580c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#f97316")
                    }
                  >
                    ⭐ Write a Review
                  </button>
                )}
              </div>

              {/* Inline review form */}
              {showReviewForm && (
                <ReviewForm
                  courtId={id}
                  onSuccess={handleReviewSuccess}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}

              {reviews.length === 0 && !showReviewForm ? (
                <div className="cd-no-reviews">
                  <span className="cd-no-reviews__icon">💬</span>
                  <p>No reviews yet. Be the first to review this court!</p>
                </div>
              ) : (
                <div className="cd-reviews-list">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Booking Card */}
          <div className="cd-right">
            <div className="cd-booking-card">
              <div className="cd-booking-card__header">
                <span className="cd-booking-card__price">
                  {court.pricePerHour} EGP
                </span>
                <span className="cd-booking-card__per">/hour</span>
              </div>
              {court.avgRating ? (
                <Stars rating={court.avgRating} size="lg" />
              ) : (
                <p className="cd-no-rating-text">No ratings yet</p>
              )}

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

                {/* PROMO CODE */}
                <label className="cd-label">Promo Code</label>
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <input
                    className="cd-input"
                    placeholder="e.g. PADEL10"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError("");
                      setPromoSuccess("");
                      setDiscount(0);
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      background: "#f97316",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0 16px",
                      fontWeight: "700",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontSize: "14px",
                    }}
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    {promoError}
                  </p>
                )}
                {promoSuccess && (
                  <p
                    style={{
                      color: "green",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    {promoSuccess}
                  </p>
                )}

                {/* SUMMARY */}
                {selectedDate && selectedTime && (
                  <div className="cd-summary">
                    <div className="cd-summary__row">
                      <span>Date</span>
                      <span>
                        {new Date(selectedDate).toLocaleDateString("en-EG", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="cd-summary__row">
                      <span>Time</span>
                      <span>
                        {selectedTime} –{" "}
                        {String(
                          Number(selectedTime.split(":")[0]) + 1,
                        ).padStart(2, "0")}
                        :00
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="cd-summary__row">
                        <span>Discount</span>
                        <span style={{ color: "green" }}>-{discount}%</span>
                      </div>
                    )}
                    <div className="cd-summary__row cd-summary__row--total">
                      <span>Total</span>
                      <span>
                        {discount > 0 && (
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#aaa",
                              marginRight: "8px",
                              fontSize: "13px",
                            }}
                          >
                            {court.pricePerHour} EGP
                          </span>
                        )}
                        {finalPrice} EGP
                      </span>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.85rem",
                      marginBottom: "8px",
                    }}
                  >
                    {bookingError}
                  </p>
                )}

                <button
                  className={`cd-book-btn ${!selectedDate || !selectedTime ? "cd-book-btn--disabled" : ""}`}
                  onClick={() => setShowPayment(true)}
                  disabled={!selectedDate || !selectedTime || bookingLoading}
                >
                  {bookingLoading
                    ? "Booking..."
                    : bookingSuccess
                      ? "✅ Booking Confirmed!"
                      : "Book Now"}
                </button>

                {(!selectedDate || !selectedTime) && (
                  <p className="cd-booking-hint">
                    Please select a date and time to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
