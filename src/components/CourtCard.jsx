import React from "react";
import { useNavigate } from "react-router-dom";

function Stars({ rating = 0 }) {
  const full = Math.round(rating);

  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            color: n <= full ? "var(--orange)" : "var(--gray-200)",
            fontSize: "14px",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function CourtCard({ court }) {
  const navigate = useNavigate();

  const surface = court.surface || "Padel";

  let badgeClass = "tag tag-orange";
  if (surface.toLowerCase().includes("grass")) badgeClass = "tag tag-green";
  else if (surface.toLowerCase().includes("indoor")) badgeClass = "tag tag-blue";

  const handleNavigate = (e) => {
    e.stopPropagation();
    navigate(`/courts/${court._id}`);
  };

  return (
    <article
      onClick={handleNavigate}
      style={{
        background: "var(--white)",
        border: "1px solid var(--gray-200)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Banner */}
      <div
        style={{
          height: "155px",
          background: "linear-gradient(135deg, #0F0F0F 0%, #2a2825 55%, #3d2200 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span style={{ fontSize: "50px" }}>🏓</span>

        <span className={badgeClass} style={{ position: "absolute", top: 12, left: 12 }}>
          {surface}
        </span>

        {court.isActive !== false && (
          <span className="tag tag-green" style={{ position: "absolute", top: 12, right: 12 }}>
            ● Available
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3>{court.name}</h3>
        <p>📍 {court.location}</p>

        <div>
          <Stars rating={court.avgRating || 0} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #eee",
            paddingTop: "10px",
          }}
        >
          <span style={{ color: "var(--orange)", fontWeight: "bold" }}>
            {court.pricePerHour} EGP/hr
          </span>

          <button
            onClick={handleNavigate}
            className="btn btn-primary btn-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}