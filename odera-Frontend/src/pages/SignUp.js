import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {UserAuth} from '../context/AuthContext';
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const { session, signUpNewUser } = UserAuth();
  const navigate = useNavigate()
  console.log(session)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would normally handle the signup process
    // Data will be directly sent to supabase from frontend
    setLoading(true)
    setError('');

    try {
      const result = await signUpNewUser(formData.email, formData.password, formData.firstName, formData.lastName)

      if(result.success){
        const accessToken = result.session?.access_token;
        if (!accessToken) {
          // Logic for Email Verification Should go here
          throw new Error('No access token found after sign up.');
        }

        // Determine the endpoint based on role
        let endpoint = '';
        let dashboard = '';
        if (formData.role === 'developer' || formData.role === 'both') {
          endpoint = '/api/freelancerSignUp';
          dashboard = '/freelancers'
        } else if (formData.role === 'client') {
          endpoint = '/api/employerSignUp';
          dashboard = '/employers'
        }

        // Call backend to update the user profile in Supabase
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            Fname: formData.firstName,
            Lname: formData.lastName,
            email: formData.email
          })
        });

        const data = await response.json();

        // Throw an error if the request does not go through
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update profile');
        }

        // Navigate to the Dashboard
        navigate(dashboard)
      }
    } catch(err) {
      console.log(err)
      setError("an error occured");
    } finally {
      setLoading(false)
    }

    // Logging
    console.log('Form submitted:', formData);
    // Reset form after submission
    /*
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'developer'
    });
    */
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
          {error && <p className='text-red-600 text-center pt-4'>{error}</p>}
        </form>
        
        <div className="login-redirect">
          Already have an account? <Link to="/login">Log In</Link>
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