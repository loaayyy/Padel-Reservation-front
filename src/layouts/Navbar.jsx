import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../features/auth/hooks/useAuth";

export default function Navbar() {
  const { isOwner } = useAuth();

  return (
    <>
      <nav style={{ padding: "16px", backgroundColor: "#111" }}>
        <Link style={{ color: "white", marginRight: "16px" }} to="/">
          Padel Reservation
        </Link>

        <Link style={{ color: "white", marginRight: "16px" }} to="/home">
          Home
        </Link>

        {isOwner && (
          <Link style={{ color: "white", marginRight: "16px" }} to="/owner">
            Owner Dashboard
          </Link>
        )}

        <Link style={{ color: "white", marginRight: "16px" }} to="/login">
          Login
        </Link>

        <Link style={{ color: "white", marginRight: "16px" }} to="/register">
          Register
        </Link>

        <Link style={{ color: "white", marginRight: "16px" }} to="/profile">
          Profile
        </Link>
      </nav>
    </>
  );
}
