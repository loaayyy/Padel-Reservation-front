import React, { useState } from "react";
import { Badge, Spinner } from "react-bootstrap";
import StarRating from "./StarRating";

const STATUS_CONFIG = {
  confirmed: { bg: "#E8F5E2", color: "#2A6018", label: "Confirmed" },
  pending: { bg: "#FFF3E0", color: "#B86200", label: "Pending" },
  cancelled: { bg: "#FEE8E8", color: "#8C1F1F", label: "Cancelled" },
  completed: { bg: "#E5F0FF", color: "#1A3D8C", label: "Completed" },
};

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-EG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" })
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {cfg.label}
    </span>
  );
}

export default function BookingHistoryCard({ booking, onCancel, onReview }) {
  const [cancelling, setCancelling] = useState(false);

  const court = booking.court || {};
  const status = booking.status?.toLowerCase();
  const isCompleted = status === "completed";
  const isCancellable = status === "confirmed" || status === "pending";
  const hasReview = !!booking.reviewed;

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    setCancelling(true);
    await onCancel(booking._id);
    setCancelling(false);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #F0EDE8",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 14,
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
        {/* Left: court info */}
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#FFF3E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🎾
          </div>
          <div>
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 2,
              }}
            >
              {court.name || "Court"}
            </p>
            <p style={{ fontSize: 13, color: "#5A5752", marginBottom: 2 }}>
              📍 {court.location || "Cairo, Egypt"}
            </p>
            {court.avgRating > 0 && (
              <StarRating value={Math.round(court.avgRating)} size={14} />
            )}
          </div>
        </div>

        {/* Right: status */}
        <StatusBadge status={booking.status} />
      </div>

      {/* Details row */}
      <div
        className="d-flex flex-wrap gap-4 mt-3"
        style={{ fontSize: 13, color: "#5A5752" }}
      >
        <div>
          <span style={{ fontWeight: 600, color: "#0F0F0F" }}>Start </span>
          {formatDateTime(booking.startTime)}
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#0F0F0F" }}>End </span>
          {formatDateTime(booking.endTime)}
        </div>
        {booking.totalPrice != null && (
          <div>
            <span style={{ fontWeight: 600, color: "#0F0F0F" }}>Total </span>
            <span style={{ color: "#E07B00", fontWeight: 700 }}>
              {booking.totalPrice} EGP
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {(isCancellable || (isCompleted && !hasReview)) && (
        <div className="d-flex gap-2 mt-3 flex-wrap">
          {isCancellable && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                background: "transparent",
                border: "1px solid #DDD9D2",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "#5A5752",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {cancelling ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Cancel Booking"
              )}
            </button>
          )}
          {isCompleted && !hasReview && (
            <button
              onClick={() => onReview(booking)}
              style={{
                background: "#E07B00",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ⭐ Leave a Review
            </button>
          )}
        </div>
      )}

      {isCompleted && hasReview && (
        <p style={{ fontSize: 12, color: "#999690", marginTop: 10 }}>
          ✅ You reviewed this booking
        </p>
      )}
    </div>
  );
}
