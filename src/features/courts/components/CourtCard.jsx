import React from "react";

export default function CourtCard({ court, onEdit, onDelete }) {
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
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(court)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(court.id ?? court._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
