import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className='footer'>
            <div className='footer-sections'>
                
                <div className='logo'>
                    <h1>Odera</h1>
                </div>


                {/* Jobs section */}
                <div className='footer-section'>
                    <h4>Jobs</h4>
                    <ul style={{listStyleType: 'none', padding: '0'}}>
                        <li><Link to="/about">Catagories</Link></li>
                        <li><Link to="/about">Projects</Link></li>
                        <li><Link to="/about">Companies</Link></li>
                        <li><Link to="/about">Freelancers</Link></li>
                    </ul>
                </div>

                {/* Contact section */}
                <div className='footer-section'>
                    <h4>About</h4>
                    <ul style={{listStyleType: 'none', padding: '0'}}>
                        <li><Link to="/about">Email</Link></li>
                        <li><Link to="https://www.linkedin.com/company/odera-freelancing/">LinkedIn</Link></li>
                        <li><Link to="/about">Twitter</Link></li>
                        <li><Link to="/about">Instagram</Link></li>
                    </ul>
                </div>

                {/* Example section */}
                <div className='footer-section'>
                    <h4>About</h4>
                    <ul style={{listStyleType: 'none', padding: '0'}}>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/about">Our Mission</Link></li>
                        <li><Link to="/about">Our Partners</Link></li>
                    </ul>
                </div>

                <div className='footer-newsletter-section'>
                    <h3>Join our newsletter!</h3>
                    <input type="text" id="email" name="email" placeholder='Email Address:'></input>
                    <button type="submit" className="submit-btn">Submit</button>
                </div>


            </div>

            <div className='footer-bottom-links'>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/cookies">Cookies</Link>
            </div>

            <div style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#666'}}>
                &copy; {new Date().getFullYear()} Odera Inc. All rights reserved
            </div>

        </footer>
    );
}

export default Footer;