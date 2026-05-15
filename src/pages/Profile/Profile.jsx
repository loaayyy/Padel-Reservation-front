import React, { useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import useProfile from "../../features/profile/hooks/useProfile";
import useMyBookings from "../../features/profile/hooks/useMyBookings";
import {
  EditProfileForm,
  ChangePasswordForm,
} from "../../features/profile/components/ProfileForm";
import BookingHistoryCard from "../../features/profile/components/BookingHistoryCard";
import ReviewModal from "../../features/profile/components/ReviewModal";
import "./Profile.css";

const TABS = [
  { id: "bookings", label: "My Bookings", icon: "📅" },
  { id: "profile", label: "Profile Settings", icon: "👤" },
  { id: "security", label: "Security", icon: "🔒" },
];

const FILTER_OPTIONS = [
  "all",
  //"confirmed",
  "UpComing",
  "completed",
  "cancelled",
];

export default function Profile() {
  const { user } = useAuth();
  const {
    profile,
    loading: profileLoading,
    saving,
    error: profileError,
    saveProfile,
    changePassword,
  } = useProfile();
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    handleCancel,
    refetch,
  } = useMyBookings(user._id);

  const [activeTab, setActiveTab] = useState("bookings");
  const [filter, setFilter] = useState("all");
  const [reviewTarget, setReviewTarget] = useState(null);

  const initials = (profile?.name || user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status?.toLowerCase() === filter);

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status?.toLowerCase() === "confirmed")
      .length,
    completed: bookings.filter((b) => b.status?.toLowerCase() === "completed")
      .length,
    cancelled: bookings.filter((b) => b.status?.toLowerCase() === "cancelled")
      .length,
    pending: bookings.filter((b) => b.status?.toLowerCase() === "pending")
      .length,
  };

  return (
    <div className="profile-wrapper">
      {/* ── Header Card ──────────────────────────────────── */}
      <div className="profile-header-card">
        <div className="profile-avatar-circle">{initials}</div>
        <div className="profile-header-info">
          <h2 className="profile-display-name">
            {profile?.name || user?.name || "Player"}
          </h2>
          <p className="profile-display-email">
            {profile?.email || user?.email}
          </p>
          <div className="profile-meta-tags">
            <span className="meta-tag meta-tag--orange">
              {user?.role || "Player"}
            </span>
            <span className="meta-tag meta-tag--gray">
              🎾 {counts.completed} session{counts.completed !== 1 ? "s" : ""}{" "}
              played
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="profile-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? "profile-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      <div className="profile-content">
        {/* ===== BOOKINGS TAB ===== */}
        {activeTab === "bookings" && (
          <>
            {/* Summary stat pills */}
            <div className="booking-stats-row">
              {[
                { label: "Total", value: counts.all, color: "#0F0F0F" },
                {
                  label: "Confirmed",
                  value: counts.confirmed,
                  color: "#2A6018",
                },
                {
                  label: "Completed",
                  value: counts.completed,
                  color: "#1A3D8C",
                },
                {
                  label: "Cancelled",
                  value: counts.cancelled,
                  color: "#8C1F1F",
                },
              ].map((s) => (
                <div className="stat-pill" key={s.label}>
                  <span className="stat-pill__num" style={{ color: s.color }}>
                    {s.value}
                  </span>
                  <span className="stat-pill__label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="booking-filter-bar">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "filter-btn--active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {counts[f] !== undefined && counts[f] > 0 && (
                    <span className="filter-count">{counts[f]}</span>
                  )}
                </button>
              ))}
            </div>

            {bookingsLoading ? (
              <div className="loading-center">
                <Spinner animation="border" style={{ color: "#E07B00" }} />
                <p>Loading your bookings…</p>
              </div>
            ) : bookingsError ? (
              <Alert variant="danger">{bookingsError}</Alert>
            ) : filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📅</div>
                <h4>No {filter !== "all" ? filter : ""} bookings yet</h4>
                <p>
                  {filter === "all"
                    ? "Head to the Explore page to book your first padel session!"
                    : `No ${filter} bookings to show.`}
                </p>
                {filter === "all" && (
                  <a href="/explore" className="empty-cta">
                    Browse Courts →
                  </a>
                )}
              </div>
            ) : (
              <div>
                {filteredBookings.map((booking) => (
                  <BookingHistoryCard
                    key={booking._id}
                    booking={booking}
                    onCancel={handleCancel}
                    onReview={(b) => setReviewTarget(b)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== PROFILE SETTINGS TAB ===== */}
        {activeTab === "profile" && (
          <div className="settings-card">
            <h3 className="settings-card__title">Personal Information</h3>
            <p className="settings-card__subtitle">
              Update your name and email address.
            </p>
            <hr style={{ borderColor: "#F0EDE8", margin: "16px 0" }} />
            {profileLoading ? (
              <div className="loading-center">
                <Spinner animation="border" style={{ color: "#E07B00" }} />
              </div>
            ) : profileError ? (
              <Alert variant="danger">{profileError}</Alert>
            ) : (
              <EditProfileForm
                profile={profile}
                onSave={saveProfile}
                saving={saving}
              />
            )}
          </div>
        )}

        {/* ===== SECURITY TAB ===== */}
        {activeTab === "security" && (
          <div className="settings-card">
            <h3 className="settings-card__title">Change Password</h3>
            <p className="settings-card__subtitle">
              Choose a strong password with at least 6 characters.
            </p>
            <hr style={{ borderColor: "#F0EDE8", margin: "16px 0" }} />
            <ChangePasswordForm
              onChangePassword={changePassword}
              saving={saving}
            />
          </div>
        )}
      </div>

      {/* ── Review Modal ─────────────────────────────────── */}
      <ReviewModal
        show={!!reviewTarget}
        onHide={() => setReviewTarget(null)}
        booking={reviewTarget}
        onReviewSubmitted={refetch}
      />
    </div>
  );
}
