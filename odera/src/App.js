import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route exact path ="/" component={<Home />} />
          <Route exact path ="/about" component={<About />} />
          <Route exact path ="/contact" component={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
