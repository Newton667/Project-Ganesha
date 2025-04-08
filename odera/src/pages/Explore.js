import React from 'react';
import './Explore.css';

function Explore() {
  return (
    <div className="explore-page">
      <h1>Explore Opportunities</h1>
      <p>Discover the latest opportunities to gain valuable experience and get paid while doing it.</p>
      
      <div className="opportunity-grid">
        <div className="opportunity-card">
          <h3>Web Development</h3>
          <p>Build responsive websites and web applications for real clients.</p>
          <button className="learn-more-btn">Learn More</button>
        </div>
        
        <div className="opportunity-card">
          <h3>UI/UX Design</h3>
          <p>Create beautiful and intuitive user interfaces for digital products.</p>
          <button className="learn-more-btn">Learn More</button>
        </div>
        
        <div className="opportunity-card">
          <h3>Content Writing</h3>
          <p>Develop compelling content for blogs, websites, and social media.</p>
          <button className="learn-more-btn">Learn More</button>
        </div>
        
        <div className="opportunity-card">
          <h3>Digital Marketing</h3>
          <p>Run campaigns and grow online presence for businesses.</p>
          <button className="learn-more-btn">Learn More</button>
        </div>
      </div>
      
      <div className="featured-section">
        <h2>Featured Opportunity</h2>
        <div className="featured-card">
          <h3>E-commerce Platform Development</h3>
          <p>Work with a team to build a full-featured e-commerce platform for a local business. Gain experience with React, Node.js, and payment processing.</p>
          <div className="details">
            <span>Duration: 3 months</span>
            <span>Compensation: $20-25/hr</span>
            <span>Remote: Yes</span>
          </div>
          <button className="apply-btn">Apply Now</button>
        </div>
      </div>
    </div>
  );
}

export default Explore;