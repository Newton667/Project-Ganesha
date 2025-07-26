import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
//import Footer from '../components/Footer';
import './About.css';

const About = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('mission');
  
  // Set active section based on URL hash or default to mission
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'team') {
      setActiveSection('team');
    } else {
      setActiveSection('mission');
    }
  }, [location]);

  // Scroll to section when it changes
  useEffect(() => {
    const element = document.getElementById(activeSection);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSection]);

  // Animation on scroll functionality
  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
          element.classList.add('animate');
        }
      });
    };
    
    // Run once on load
    animateOnScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
    };
  }, []);

  return (
    <div className="about-container">
      {/* About Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="animate-on-scroll fade-in">About Odera</h1>
          <p className="animate-on-scroll fade-in delay-1">
            Building bridges between talented CS students and real-world opportunities
          </p>
        </div>
      </section>
      
      {/* About Navigation */}
      <nav className="about-nav">
        <div className="about-nav-container">
          <Link 
            to="#mission" 
            className={`about-nav-link ${activeSection === 'mission' ? 'active' : ''}`}
            onClick={() => setActiveSection('mission')}
          >
            Our Mission
          </Link>
          <Link 
            to="#team" 
            className={`about-nav-link ${activeSection === 'team' ? 'active' : ''}`}
            onClick={() => setActiveSection('team')}
          >
            Meet the Team
          </Link>
        </div>
      </nav>
      
      {/* Mission Section */}
      <section id="mission" className="about-section mission-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll slide-up">Our Mission</h2>
          
          <div className="mission-content">
            <div className="mission-text animate-on-scroll slide-right">
              <p className="mission-paragraph">
                At Odera, we're on a mission to bridge the gap between education and industry. 
                We've experienced firsthand the challenges that computer science and tech students 
                face when trying to enter the job market after graduation.
              </p>
              
              <p className="mission-paragraph">
                Our platform was born from a simple yet powerful idea: students need real-world 
                experience to land jobs, but can't get jobs without experience. This catch-22 
                leaves many talented graduates struggling to launch their careers.
              </p>
              
              <p className="mission-paragraph">
                By connecting students with freelancing opportunities, we're creating a pathway 
                for emerging tech talent to build portfolios, gain practical experience, and earn 
                income—all while completing their education.
              </p>
              
              <div className="mission-values animate-on-scroll slide-up delay-1">
                <h3>Our Core Values</h3>
                <ul className="values-list">
                  <li>
                    <span className="value-icon">🌱</span>
                    <span className="value-text">Growth through practical experience</span>
                  </li>
                  <li>
                    <span className="value-icon">🤝</span>
                    <span className="value-text">Community support and mentorship</span>
                  </li>
                  <li>
                    <span className="value-icon">💡</span>
                    <span className="value-text">Innovation and problem-solving</span>
                  </li>
                  <li>
                    <span className="value-icon">🔄</span>
                    <span className="value-text">Creating sustainable opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mission-image-container animate-on-scroll fade-in delay-2">
              <div className="mission-image">
                <img src="/mission-image.jpg" alt="Students collaborating" />
              </div>
            </div>
          </div>
          
          <div className="mission-stats animate-on-scroll fade-in delay-3">
            <div className="stat-item">
              <span className="stat-number count-up" data-target="67">0</span>
              <span className="stat-label">CS graduates struggle to find relevant jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number count-up" data-target="94">0</span>
              <span className="stat-label">Employers value practical experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number count-up" data-target="78">0</span>
              <span className="stat-label">Students want to build portfolios before graduating</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section id="team" className="about-section team-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll slide-up">Meet the Team</h2>
          <p className="team-intro animate-on-scroll fade-in delay-1">
            We're a group of passionate tech graduates who experienced the challenges of the modern job market firsthand. 
            That's why we created Odera—to help students like us build meaningful careers.
          </p>
          
          <div className="team-grid">
            {/* Your Profile */}
            <div className="team-member animate-on-scroll slide-up delay-2">
              <div className="member-image">
                <img src="/Newton.jpg" alt="Newton" />
              </div>
              <div className="member-info">
                <h3 className="member-name">Newton</h3>
                <p className="member-title">Co-Owner & Developer</p>
                <p className="member-bio">
                  A December 2024 graduate from Towson University who experienced the challenges 
                  of the current tech job market firsthand. Passionate about creating opportunities 
                  for fellow CS students and helping them overcome the same hurdles.
                </p>
                <div className="member-social">
                  <a href="https://www.linkedin.com/in/newton-nguyen-ntn/" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="https://github.com/Newton667" className="social-link" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Placeholder for Co-Owner 2 */}
            <div className="team-member animate-on-scroll slide-up delay-3">
              <div className="member-image">
                <div className="placeholder-image">
                  <span>JS</span>
                </div>
              </div>
              <div className="member-info">
                <h3 className="member-name">Co-Owner</h3>
                <p className="member-title">Co-Owner & Designer</p>
                <p className="member-bio">
                  Tech enthusiast with a passion for creating intuitive user experiences. 
                  Collaborated on developing Odera to bridge the gap between education and 
                  industry for tech students.
                </p>
                <div className="member-social">
                  <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="#github" className="social-link" aria-label="GitHub">
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Placeholder for Co-Owner 3 */}
            <div className="team-member animate-on-scroll slide-up delay-4">
              <div className="member-image">
                <div className="placeholder-image">
                  <span>TG</span>
                </div>
              </div>
              <div className="member-info">
                <h3 className="member-name">Co-Owner</h3>
                <p className="member-title">Co-Owner & Business Lead</p>
                <p className="member-bio">
                  Dedicated to creating pathways for emerging tech talent to succeed in 
                  a competitive industry. Brings business expertise to Odera's mission of 
                  connecting students with real-world opportunities.
                </p>
                <div className="member-social">
                  <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="#github" className="social-link" aria-label="GitHub">
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="team-cta animate-on-scroll fade-in delay-5">
            <h3>Interested in our mission?</h3>
            <p>Join our community today and be part of the change in tech education and employment.</p>
            <Link to="/signup" className="cta-button">Join Odera</Link>
          </div>
        </div>
      </section>
      
      {/* Company Story Section */}
      <section className="company-story animate-on-scroll fade-in">
        <div className="section-container">
          <h2 className="section-title">Our Story</h2>
          <div className="story-timeline">
            <div className="timeline-item animate-on-scroll slide-right delay-1">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>The Idea</h3>
                <p>
                  Frustrated by the challenges of finding meaningful tech work after graduation, 
                  three friends recognized a pattern: CS students everywhere were facing the same 
                  struggle. The idea for Odera was born—a platform that would create opportunities 
                  for students to gain real-world experience while still in school.
                </p>
              </div>
            </div>
            
            <div className="timeline-item animate-on-scroll slide-left delay-2">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Building the Platform</h3>
                <p>
                  We developed Odera as a solution we wished we had during our studies—a freelancing 
                  marketplace specifically designed for CS students and early career developers to 
                  showcase their skills and connect with clients needing technical solutions.
                </p>
              </div>
            </div>
            
            <div className="timeline-item animate-on-scroll slide-right delay-3">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Growing the Community</h3>
                <p>
                  What started as a solution for our own career challenges has grown into a 
                  community of students, educators, and businesses all working together to 
                  redefine how tech education translates to career success.
                </p>
              </div>
            </div>
            
            <div className="timeline-item animate-on-scroll slide-left delay-4">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>The Future</h3>
                <p>
                  Our vision extends beyond just connecting students with freelance opportunities. 
                  We're building a comprehensive ecosystem where education and industry seamlessly 
                  integrate, creating more pathways for emerging tech talent to thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      
      {/* JavaScript for animations */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Count-up animation for statistics
          document.addEventListener('DOMContentLoaded', () => {
            const countUpElements = document.querySelectorAll('.count-up');
            
            countUpElements.forEach(element => {
              const target = parseInt(element.getAttribute('data-target'));
              const duration = 2000; // ms
              const step = Math.ceil(target / (duration / 16)); // 60fps
              
              let current = 0;
              const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                  element.textContent = target + '%';
                  clearInterval(timer);
                } else {
                  element.textContent = current + '%';
                }
              }, 16);
            });
          });
        `
      }} />
    </div>
  );
};

export default About;