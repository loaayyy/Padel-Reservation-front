import React, { useState } from "react";
import AddCourtForm from "../../features/courts/components/AddCourtForm";
import CourtCard from "../../features/courts/components/CourtCard";
import CourtForm from "../../features/courts/components/CourtForm";
import useCourts from "../../features/courts/hooks/useCourts";
import { useAuth } from "../../context/AuthContext";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { courts, loading, error, addCourt, updateCourt, deleteCourt } = useCourts();
  const [editingCourt, setEditingCourt] = useState(null);

  const handleEdit = (court) => {
    setEditingCourt(court);
  };

  const handleDelete = async (courtId) => {
    if (!window.confirm("Delete this court?")) {
      return;
    }

    await deleteCourt(courtId);
    if (editingCourt?.id === courtId) {
      setEditingCourt(null);
    }
  };

  const handleSave = async (id, courtData) => {
    await updateCourt(id, courtData);
    setEditingCourt(null);
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2>Owner Dashboard</h2>
        <p className="text-muted">Manage your courts and owner listings from one place.</p>
      </div>

      <div className="row">
        <div className="col-lg-5">
          <AddCourtForm onAdd={addCourt} ownerId={user?.id} />
          {editingCourt && (
            <CourtForm court={editingCourt} onSave={handleSave} onCancel={() => setEditingCourt(null)} />
          )}
        </div>

        <div className="col-lg-7">
          {loading && <div className="alert alert-info">Loading your courts...</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {courts.length === 0 && !loading ? (
            <div className="alert alert-secondary">No courts found. Add your first court.</div>
          ) : (
            courts.map((court) => (
              <CourtCard key={court.id || court._id} court={court} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
