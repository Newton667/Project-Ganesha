import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
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
            <button>Join Now</button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;