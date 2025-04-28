import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Footer from '../components/Footer';

function Home() {
  // Add class to body to help with styling
  useEffect(() => {
    document.body.classList.add('home-page');
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100vw';
    document.body.style.overflowX = 'hidden';
    
    // Cleanup function
    return () => {
      document.body.classList.remove('home-page');
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.width = '';
      document.body.style.overflowX = '';
    };
  }, []);

  return (
    <>
      <div className="banner">
        <img src="/Untitled_design.png" alt="Banner" />
        
        {/* Home-specific navbar */}
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
        
        <div className="banner-content">
          <h2>Gain experience to put on your resume, and get paid!</h2>
          <button className="banner-join-btn">Join Now</button>
        </div>
      </div>
      
      <div className="home-content">
        <div className="future-leaders-section">
          <h2>Let future leaders take it from here</h2>
          <div className="search-container">
            <input type="text" placeholder="Search for coding services..." />
            <button className="search-btn">Search</button>
          </div>
        </div>
        
        <div className="designed-by">
          <h2>Designed by College Students, for College Students</h2>
        </div>
        
        <section className="our-goal">
          <div className="goal-container">
            <div className="goal-image">
              <img src="/pen.jpg" alt="Pen" />
            </div>
            <div className="goal-text">
              <h2>Our Goal</h2>
              <ul>
                <li>Our goal is simple, get you some much-needed experience in the tech field before college ends</li>
                <li>Finding employment that gives you proper experience can be hard, especially when the job market is not doing well</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create a Profile</h3>
              <p>Sign up and build your profile showcasing your skills and interests.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Explore Opportunities</h3>
              <p>Browse through various projects and positions that match your skills.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Apply & Connect</h3>
              <p>Apply to opportunities and connect with companies looking for talent.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Gain Experience</h3>
              <p>Work on real projects, build your portfolio, and get paid for your contributions.</p>
            </div>
          </div>
        </section>
        
        <section className="benefits">
          <h2>Why Choose Odera</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>Real Experience</h3>
              <p>Work on actual projects for real businesses and organizations.</p>
            </div>
            <div className="benefit-card">
              <h3>Get Paid</h3>
              <p>Earn while you learn with competitive compensation for your work.</p>
            </div>
            <div className="benefit-card">
              <h3>Build Portfolio</h3>
              <p>Create a professional portfolio showcasing your accomplishments.</p>
            </div>
            <div className="benefit-card">
              <h3>Networking</h3>
              <p>Connect with industry professionals and expand your network.</p>
            </div>
          </div>
        </section>
        
        {/* New freelancing CTA section with laptop image */}
        <section className="freelancing-cta">
          <div className="laptop-image">
            <img src="/laptop.png" alt="Laptop" />
            <div className="cta-content">
              <h2>Ready to kick-start your freelancing journey?</h2>
              <button className="cta-join-btn">Join Now</button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}

export default Home;