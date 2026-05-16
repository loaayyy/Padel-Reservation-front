import React, { useEffect, useState } from "react";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function CourtForm({ court, onSave, onCancel }) {
  const [courtData, setCourtData] = useState({
    name: "",
    location: "",
    pricePerHour: "",
    description: "",
    imageUrl: "",
    secondaryImages: [],
    imageFile: null,
    secondaryFiles: [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!court) return;
    setCourtData({
      name: court.name || "",
      location: court.location || "",
      pricePerHour: court.pricePerHour || "",
      description: court.description || "",
      imageUrl: court.imageUrl || "",
      secondaryImages: Array.isArray(court.secondaryImages)
        ? court.secondaryImages
        : (court.secondaryImages || []),
      imageFile: null,
      secondaryFiles: [],
    });
  }, [court]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCourtData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setCourtData((prev) => ({ ...prev, imageFile: file }));
  };

  const handleSecondaryFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    setCourtData((prev) => ({ ...prev, secondaryFiles: files }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!courtData.name || !courtData.location || !courtData.pricePerHour) {
      setMessage("Name, location, and price are required.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const imageUrl = courtData.imageFile
        ? await fileToDataUrl(courtData.imageFile)
        : courtData.imageUrl;
      const secondaryImages = courtData.secondaryFiles.length > 0
        ? await Promise.all(courtData.secondaryFiles.map(fileToDataUrl))
        : courtData.secondaryImages;

      const payload = {
        name: courtData.name,
        location: courtData.location,
        pricePerHour: Number(courtData.pricePerHour),
        description: courtData.description,
        imageUrl,
        secondaryImages,
      };

      await onSave(court.id ?? court._id, payload);
      setMessage("Court updated successfully.");
    } catch (error) {
      setMessage(error?.message || "Failed to update court.");
    } finally {
      setSaving(false);
    }
  };

  if (!court) {
    return null;
  }

  return (
    <div className="card mb-4 border-warning">
      <div className="card-body">
        <h5 className="card-title">Edit Court</h5>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Court Name</label>
            <input
              type="text"
              name="name"
              value={courtData.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={courtData.location}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Price per hour</label>
            <input
              type="number"
              min="0"
              name="pricePerHour"
              value={courtData.pricePerHour}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={courtData.description}
              onChange={handleChange}
              className="form-control"
              rows="3"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Main Court Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
            {courtData.imageFile ? (
              <small className="text-muted">Selected file: {courtData.imageFile.name}</small>
            ) : courtData.imageUrl ? (
              <small className="text-muted">Current image already set.</small>
            ) : null}
          </div>
          <div className="mb-3">
            <label className="form-label">Secondary Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleSecondaryFilesChange}
              className="form-control"
            />
            {courtData.secondaryFiles.length > 0 ? (
              <small className="text-muted">{courtData.secondaryFiles.length} file(s) selected</small>
            ) : (courtData.secondaryImages?.length > 0 ? (
              <small className="text-muted">{courtData.secondaryImages.length} existing image(s) retained</small>
            ) : null)}
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
