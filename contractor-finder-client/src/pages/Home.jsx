import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        {/* Animated Icon */}
        <div className="icon-wrapper">
          <svg className="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        {/* Header */}
        <div className="home-header">
          <h1 className="home-title">Contractor Finder</h1>
          <p className="home-subtitle">
            Find trusted professionals for your next project
          </p>
        </div>

        {/* About Section */}
        <div className="about-section">
          <h2 className="section-heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About This Project
          </h2>
          <p className="about-text">
            Contractor Finder is a revolutionary platform where users can easily find and book
            contractors, explore available machines, and leave ratings. It's
            designed to make hiring <span className="highlight">simple</span>, <span className="highlight">transparent</span>, and <span className="highlight">efficient</span>.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find Experts</h3>
            <p>Search and discover verified contractors in your area</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Top Rated</h3>
            <p>Quality guaranteed professionals with real reviews</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🚜</div>
            <h3>View Machines</h3>
            <p>Browse available equipment and machinery</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Easy Booking</h3>
            <p>Simple and fast contractor hiring process</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Rate & Review</h3>
            <p>Share your experience and help others decide</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Platform</h3>
            <p>Safe and trusted booking environment</p>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="get-started-section">
          <h2 className="section-heading get-started-heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Started
          </h2>
          <p className="get-started-text">Choose an option below to begin your journey:</p>
          
          <div className="action-buttons">
            <Link to="/signup" className="action-btn signup-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Sign Up</span>
              <div className="btn-glow"></div>
            </Link>
            
            <Link to="/login" className="action-btn login-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Login</span>
              <div className="btn-glow"></div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="home-footer">
          <p>🏗️ Join thousands of satisfied users today</p>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
    </div>
  );
}