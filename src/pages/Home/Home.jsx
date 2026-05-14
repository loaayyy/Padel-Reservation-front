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
      setError("Failed to load courts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts(filters);
  }, []);

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
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero__bg">
          <div className="home-hero__orb home-hero__orb--1" />
          <div className="home-hero__orb home-hero__orb--2" />
          <div className="home-hero__orb home-hero__orb--3" />
        </div>
        <div className="home-hero__content">
          <div className="home-hero__badge">🎾 Egypt's #1 Padel Platform</div>
          <h1 className="home-hero__title">
            Find &amp; Book Your<br />
            <span className="home-hero__accent">Perfect Court</span>
          </h1>
          <p className="home-hero__sub">
            Browse top-rated padel courts across Cairo and book your session instantly.
          </p>
          <div className="home-hero__actions">
            <button className="home-hero__cta" onClick={() => navigate("/register")}>
              Get Started
              <span className="home-hero__cta-arrow">→</span>
            </button>
            <button className="home-hero__secondary" onClick={() => document.getElementById('courts').scrollIntoView({ behavior: 'smooth' })}>
              Browse Courts
            </button>
          </div>
          <div className="home-hero__stats">
            <div className="home-hero__stat">
              <span className="home-hero__stat-num">50+</span>
              <span className="home-hero__stat-label">Courts</span>
            </div>
            <div className="home-hero__stat-divider" />
            <div className="home-hero__stat">
              <span className="home-hero__stat-num">1k+</span>
              <span className="home-hero__stat-label">Bookings</span>
            </div>
            <div className="home-hero__stat-divider" />
            <div className="home-hero__stat">
              <span className="home-hero__stat-num">4.8★</span>
              <span className="home-hero__stat-label">Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURTS SECTION ── */}
      <section className="home-courts" id="courts">
        <div className="home-courts__inner">

          {/* Section Header */}
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">Available Courts</h2>
              <p className="home-section-sub">Pick your court and lock in your slot</p>
            </div>
            {!loading && !error && (
              <span className="home-count">
                <strong>{courts.length}</strong> court{courts.length !== 1 ? "s" : ""} found
              </span>
            )}
          </div>

          {/* Filter Bar */}
          <form className="home-filter-bar" onSubmit={handleSearch}>
            <div className="home-filter-field">
              <span className="home-filter-icon">📍</span>
              <input
                className="home-filter-input"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="Location"
              />
            </div>

            <div className="home-filter-field">
              <span className="home-filter-icon">🏟️</span>
              <input
                className="home-filter-input"
                name="name"
                value={filters.name}
                onChange={handleChange}
                placeholder="Court name"
              />
            </div>

            <div className="home-filter-field">
              <span className="home-filter-icon">💰</span>
              <input
                className="home-filter-input"
                name="price"
                type="number"
                value={filters.price}
                onChange={handleChange}
                placeholder="Max price (EGP)"
              />
            </div>

            <button className="home-filter-search" type="submit">
              Search
            </button>

            {hasFilters && (
              <button className="home-filter-clear" type="button" onClick={handleClear}>
                Clear
              </button>
            )}
          </form>

          {/* Loading */}
          {loading && (
            <div className="home-state">
              <div className="home-spinner" />
              <h3>Finding courts…</h3>
              <p>Just a moment</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="home-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && courts.length > 0 && (
            <div className="home-grid">
              {courts.map((court) => (
                <CourtCard key={court._id} court={court} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && courts.length === 0 && (
            <div className="home-state">
              <div className="home-state__icon">🎾</div>
              <h3>No courts found</h3>
              <p>Try adjusting your filters or clear them to see all courts.</p>
              {hasFilters && (
                <button className="home-state__btn" onClick={handleClear}>
                  Clear Filters
                </button>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
