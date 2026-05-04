import { useCallback, useEffect, useState } from "react";
import * as courtsApi from "../api/courtsApi";

export default function useCourts(ownerId) {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCourts = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const data = await courtsApi.getOwnerCourts(ownerId);
      setCourts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Unable to load courts");
      setCourts([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  const addCourt = async (courtData) => {
    const court = await courtsApi.createCourt(courtData);
    setCourts((prev) => [...prev, court]);
    return court;
  };

  const updateCourt = async (id, courtData) => {
    const updated = await courtsApi.updateCourt(id, courtData);
    setCourts((prev) =>
      prev.map((court) =>
        court.id === id || court._id === id ? updated : court,
      ),
    );
    return updated;
  };

  const deleteCourt = async (id) => {
    await courtsApi.deleteCourt(id);
    setCourts((prev) => prev.filter((court) => court.id !== id && court._id !== id));
  };

  return {
    courts,
    loading,
    error,
    addCourt,
    updateCourt,
    deleteCourt,
    refresh: loadCourts,
  };
}
