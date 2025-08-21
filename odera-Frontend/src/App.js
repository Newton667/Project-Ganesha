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
import Employers from './pages/Employers';
import Freelancers from './pages/Freelancers';
import './App.css';

function App() {
  
  //Example snippet, remove later
  /*
  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch("/api/users").then(
      response => response.json()
    ).then(
      data => {
        setBackendData(data)
      }
    )
  }, [])
  */
  //End of example snippet

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/explore" element={<><Navbar /><Explore /></>} />
          <Route path="/about" element={<><Navbar /><About /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /></>} />
          <Route path="/signup" element={<><Navbar /><SignUp /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />

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
