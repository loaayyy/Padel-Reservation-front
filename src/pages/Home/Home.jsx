import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CourtCard from "../../components/CourtCard";
import { getPublicCourts } from "../../features/courts/api/courtsApi";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    location: "",
    name: "",
    price: "",
  });

  const fetchCourts = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPublicCourts({
        location: activeFilters.location,
        price: activeFilters.price,
      });

      const filtered = activeFilters.name
        ? data.filter((c) =>
            c.name.toLowerCase().includes(activeFilters.name.toLowerCase())
          )
        : data;

      setCourts(filtered);
    } catch (err) {
      console.error(err);
      setError("Backend is not running or failed to load courts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts(filters);
  }, []); // load once

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourts(filters);
  };

  const handleClear = () => {
    const empty = { location: "", name: "", price: "" };
    setFilters(empty);
    fetchCourts(empty);
  };

  const hasFilters = filters.location || filters.name || filters.price;

  return (
    <>
      {/* HERO */}
      <div className="hero">
        <h1>Find & Book Your Perfect Padel Court</h1>
        <p>Browse courts and book instantly</p>

        <button onClick={() => navigate("/register")}>
          Get Started
        </button>
      </div>

      {/* FILTERS */}
      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Location"
        />

        <input
          name="name"
          value={filters.name}
          onChange={handleChange}
          placeholder="Court name"
        />

        <input
          name="price"
          type="number"
          value={filters.price}
          onChange={handleChange}
          placeholder="Max price"
        />

        <button type="submit">Search</button>

        {hasFilters && (
          <button type="button" onClick={handleClear}>
            Clear
          </button>
        )}
      </form>

      {/* STATES */}
      {loading && <p>Loading courts...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* GRID */}
      {!loading && !error && (
        <div className="grid">
          {courts.map((court) => (
            <CourtCard key={court._id} court={court} />
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && courts.length === 0 && (
        <p>No courts found</p>
      )}
    </>
  );
}