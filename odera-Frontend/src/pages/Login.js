import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally handle the login process
    // For example, send the data to your backend
    console.log('Login attempt:', formData);
    // You would typically authenticate with your backend here
    // and redirect to the appropriate page on success
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <h1 className="login-title">Welcome Back to Odera</h1>
          <p className="login-subtitle">Log in to your account to continue your journey</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
              placeholder="Enter your password"
            />
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>
          
          <button type="submit" className="login-button">Log In</button>
        </form>
        
        <div className="signup-redirect">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
      
      <div className="login-image">
        <div className="login-overlay">
          <div className="login-quote">
            <h2>"Build experience. Grow skills. Launch your career."</h2>
            <p>Join Odera's community of student developers and clients</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;