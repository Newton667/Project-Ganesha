import React, { useState } from 'react';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'developer' // Default role
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally handle the signup process
    // For example, send the data to your backend
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'developer'
    });
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-header">
          <h1 className="signup-title">Join Odera</h1>
          <p className="signup-slogan">Build Your Future. One Project at a Time.</p>
        </div>
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          
          <div className="form-group">
            <label>I am a:</label>
            <div className="role-selection">
              <div className="role-option">
                <input
                  type="radio"
                  id="developer"
                  name="role"
                  value="developer"
                  checked={formData.role === 'developer'}
                  onChange={handleChange}
                />
                <label htmlFor="developer">Developer (Student/CS Major)</label>
              </div>
              
              <div className="role-option">
                <input
                  type="radio"
                  id="client"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={handleChange}
                />
                <label htmlFor="client">Client (Looking for developers)</label>
              </div>
              
              <div className="role-option">
                <input
                  type="radio"
                  id="both"
                  name="role"
                  value="both"
                  checked={formData.role === 'both'}
                  onChange={handleChange}
                />
                <label htmlFor="both">Both (I want to develop and hire)</label>
              </div>
            </div>
          </div>
          
          <button type="submit" className="signup-button">Create Account</button>
        </form>
        
        <div className="login-redirect">
          Already have an account? <a href="/login">Log In</a>
        </div>
      </div>
      
      <div className="signup-benefits">
        <h2>Why Join Odera?</h2>
        <div className="benefits-list">
          <div className="benefit-item">
            <div className="benefit-icon">💼</div>
            <div className="benefit-content">
              <h3>Real-World Experience</h3>
              <p>Build your portfolio with actual projects that matter</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">💰</div>
            <div className="benefit-content">
              <h3>Earn While You Learn</h3>
              <p>Get paid for your coding skills as you develop them</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">🚀</div>
            <div className="benefit-content">
              <h3>Launch Your Career</h3>
              <p>Stand out to employers with proven project experience</p>
            </div>
          </div>
          
          <div className="benefit-item">
            <div className="benefit-icon">🤝</div>
            <div className="benefit-content">
              <h3>Support Network</h3>
              <p>Connect with fellow students and mentors in tech</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;