import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Createprojects.css';

const API_BASE = process.env.REACT_APP_API_BASE || ''; // "" if same origin, or "http://localhost:4000"

function CreateProjects() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDesc: '',
    jobCategory: '',
    urgency: '',
    budgetMin: '',
    budgetMax: '',
    duration: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Categories from SQL JobSkills table
  const categories = [
    'Web Development',
    'Mobile Apps',
    'Data Science',
    'AI & ML',
    'Game Dev',
    'Blockchain',
    'Desktop Apps',
    'DevOps'
  ];

  // Urgency levels
  const urgencyLevels = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.jobDesc.trim()) {
      newErrors.jobDesc = 'Job description is required';
    }

    if (!formData.jobCategory) {
      newErrors.jobCategory = 'Please select a category';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Please select urgency level';
    }

    // Budget validation
    const min = parseFloat(formData.budgetMin);
    const max = parseFloat(formData.budgetMax);
    if (isNaN(min) || min < 0) {
      newErrors.budgetMin = 'Invalid minimum budget';
    }
    if (isNaN(max) || max < 0) {
      newErrors.budgetMax = 'Invalid maximum budget';
    }
    if (min && max && min > max) {
      newErrors.budgetMax = 'Maximum budget must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobTitle: formData.jobTitle.trim(),
          jobDesc: formData.jobDesc.trim(),
          jobCat: formData.jobCategory,
          urgency: formData.urgency,
          budgetMin: parseFloat(formData.budgetMin) || 0,
          budgetMax: parseFloat(formData.budgetMax) || 0,
          duration: formData.duration || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create job');
      }

      // Redirect to job details or jobs list
      navigate('/explore');
    } catch (error) {
      console.error('Job creation error:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-project-container">
      <div className="navbar-area" />
      
      <header className="create-project-header">
        <h1>Create a New Project</h1>
        <p>Post a job and find the perfect developer for your project</p>
      </header>

      <form className="create-project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="jobTitle">Job Title</label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="Enter a clear, concise job title"
            className={errors.jobTitle ? 'input-error' : ''}
          />
          {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="jobDesc">Job Description</label>
          <textarea
            id="jobDesc"
            name="jobDesc"
            value={formData.jobDesc}
            onChange={handleChange}
            placeholder="Provide detailed information about your project"
            className={errors.jobDesc ? 'input-error' : ''}
          />
          {errors.jobDesc && <span className="error-message">{errors.jobDesc}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="jobCategory">Category</label>
            <select
              id="jobCategory"
              name="jobCategory"
              value={formData.jobCategory}
              onChange={handleChange}
              className={errors.jobCategory ? 'input-error' : ''}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.jobCategory && <span className="error-message">{errors.jobCategory}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="urgency">Urgency</label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className={errors.urgency ? 'input-error' : ''}
            >
              <option value="">Select Urgency</option>
              {urgencyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.urgency && <span className="error-message">{errors.urgency}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="budgetMin">Minimum Budget ($)</label>
            <input
              type="number"
              id="budgetMin"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              placeholder="Minimum budget"
              min="0"
              step="10"
              className={errors.budgetMin ? 'input-error' : ''}
            />
            {errors.budgetMin && <span className="error-message">{errors.budgetMin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="budgetMax">Maximum Budget ($)</label>
            <input
              type="number"
              id="budgetMax"
              name="budgetMax"
              value={formData.budgetMax}
              onChange={handleChange}
              placeholder="Maximum budget"
              min="0"
              step="10"
              className={errors.budgetMax ? 'input-error' : ''}
            />
            {errors.budgetMax && <span className="error-message">{errors.budgetMax}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Expected Duration</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 2 weeks, 1 month"
          />
        </div>

        {submitError && (
          <div className="submit-error">
            {submitError}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/explore')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProjects;