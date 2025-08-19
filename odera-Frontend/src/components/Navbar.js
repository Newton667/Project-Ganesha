import React from 'react';
import { Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { session, loading } = UserAuth();

  const firstName = session?.user?.user_metadata?.firstName || null;
  const isLoggedIn = !!session;

  return (
    <header>
      <div className="navbar-container">
        <nav className="navbar">
          <div className="logo">
            <Link to="/">Odera</Link>
          </div>

          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/explore" className="nav-link">Explore</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          <div className="join-button">
            {loading ? (
              // Small non-jumpy placeholder while auth state resolves
              <button disabled aria-busy="true" aria-label="Loading">
                …
              </button>
            ) : isLoggedIn ? (
              <Link to="/dashboard">
                <button>
                  {firstName ? `Dashboard • ${firstName}` : 'Dashboard'}
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button>Sign In</button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
