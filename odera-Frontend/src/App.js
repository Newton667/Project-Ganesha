import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Explore from './pages/Explore';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Employers from './pages/Employers';
import Freelancers from './pages/Freelancers';
import FreelancerSettings from './pages/FreelancerSettings';
import EmployerSettings from './pages/EmployerSettings';
import ApplyForm from "./pages/ApplyForm";
import PostJob from './pages/PostJob';
import CreateProjects from './pages/Createprojects';
import JobDetails from './pages/JobDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/explore" element={<><Navbar /><Explore /></>} />
          <Route path="/about" element={<><Navbar /><About /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /></>} />

          {/* ApplyForm URL Route */}          
          <Route path="/apply/:jobId" element={<><Navbar /><ApplyForm /></>} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <><Navbar /><Login /></>
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <><Navbar /><SignUp /></>
              </PublicRoute>
            }
          />

          <Route path="/signup" element={<><Navbar /><SignUp /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />

          {/* Job Details Page */}
          <Route path="/jobs/:id" element={<><Navbar /><JobDetails /></>} />

          {/* Create Projects Route with Private Route */}
          <Route
            path="/create-projects"
            element={<><Navbar /><PrivateRoute><CreateProjects /></PrivateRoute></>}
          />

          {/* Main dashboard hub */}
          <Route
            path="/dashboard"
            element={<><Navbar /><PrivateRoute><Dashboard /></PrivateRoute></>}
          />

          {/* Freelancer dashboard */}
          <Route
            path="/dashboard/freelancers"
            element={<><Navbar /><PrivateRoute><Freelancers /></PrivateRoute></>}
          />

          {/* Employer dashboard */}
          <Route
            path="/dashboard/employers"
            element={<><Navbar /><PrivateRoute><Employers /></PrivateRoute></>}
          />

          {/* freelancer settings page */}
          <Route
            path="/dashboard/freelancers/settings/*"
            element={<><Navbar /><PrivateRoute><FreelancerSettings /></PrivateRoute></>}
          />

          {/* employer settings page */}
          <Route
            path="/dashboard/employers/settings/*"
            element={<><Navbar /><PrivateRoute><EmployerSettings /></PrivateRoute></>}
          />

          {/* employer settings page */}
          <Route
            path="/dashboard/employers/post-job/*"
            element={<><Navbar /><PrivateRoute><PostJob /></PrivateRoute></>}
          />

          {/* Redirect old paths to new dashboard URLs */}
          <Route path="/freelancers" element={<Navigate to="/dashboard/freelancers" replace />} />
          <Route path="/employers" element={<Navigate to="/dashboard/employers" replace />} />

          {/* Optional 404 redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
