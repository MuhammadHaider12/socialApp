import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiCompass, FiHeart, FiMessageCircle, FiUser, FiLogOut, FiMenu, FiX, FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  if (!token) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="navbar-desktop">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8" />
              <circle cx="17.5" cy="6.5" r="1.5" />
            </svg>
            <span className="brand-name">Social</span>
          </Link>
        </div>

        <nav className="navbar-menu">
          <Link to="/" className="nav-item" title="Home">
            <FiHome className="nav-icon" />
            <span className="nav-label">Home</span>
          </Link>
          <Link to="/explore" className="nav-item" title="Explore">
            <FiCompass className="nav-icon" />
            <span className="nav-label">Explore</span>
          </Link>
          <Link to="/notifications" className="nav-item" title="Notifications">
            <FiHeart className="nav-icon" />
            <span className="nav-label">Notifications</span>
          </Link>
          <Link to="/messages" className="nav-item" title="Messages">
            <FiMessageCircle className="nav-icon" />
            <span className="nav-label">Messages</span>
          </Link>
          <Link to={`/profile/${user?._id || user?.id}`} className="nav-item" title="Profile">
            <FiUser className="nav-icon" />
            <span className="nav-label">Profile</span>
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Top Navigation */}
      <header className="navbar-mobile">
        <Link to="/" className="mobile-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8" />
            <circle cx="17.5" cy="6.5" r="1.5" />
          </svg>
        </Link>

        <div className="mobile-search">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {mobileMenuOpen && (
          <nav className="mobile-menu">
            <Link to="/" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <FiHome /> Home
            </Link>
            <Link to="/" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <FiCompass /> Explore
            </Link>
            <Link to="/" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <FiHeart /> Notifications
            </Link>
            <Link to="/" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <FiMessageCircle /> Messages
            </Link>
            <Link to={`/profile/${user?._id || user?.id}`} className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
              <FiUser /> Profile
            </Link>
            <button className="mobile-logout" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </nav>
        )}
      </header>
    </>
  );
};

export default Navbar;