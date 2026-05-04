import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isOwner } = useAuth();

  return (
    <nav className="main-nav">
      <div className="nav-left">
        <Link className="nav-logo" to="/">
          Padel<span>Club</span>
        </Link>
      </div>

      <div className="nav-center">
        {user && (
          <Link className="nav-link" to="/home">
            Home
          </Link>
        )}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            {isOwner && (
              <Link className="nav-link" to="/owner">
                Owner Dashboard
              </Link>
            )}
            <Link className="nav-link" to="/profile">
              Profile
            </Link>
            <button className="nav-logout" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/login">
              Login
            </Link>
            <Link className="nav-link" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

