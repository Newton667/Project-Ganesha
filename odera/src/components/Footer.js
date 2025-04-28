import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer style={{backgroundColor: 'f8f8f8', padding: '2rem', marginTop: '2rem', borderTop: '1px solid #ccc'}}>
            <div style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap'}}>
                
                <div>
                    <h1>Odera</h1>
                </div>


                {/* Jobs section */}
                <div>
                    <h4>Jobs</h4>
                    <ul style={{listStyleType: 'none', padding: '0'}}>
                        <li><Link to="/about">Catagories</Link></li>
                        <li><Link to="/about">Projects</Link></li>
                        <li><Link to="/about">Companies</Link></li>
                        <li><Link to="/about">Freelancers</Link></li>
                    </ul>
                </div>

                {/* Contact section */}
                <div>
                    <h4>About</h4>
                    <ul style={{listStyleType: 'none', padding: '0'}}>
                        <li><Link to="/about">Email</Link></li>
                        <li><Link to="/about">LinkedIn</Link></li>
                        <li><Link to="/about">Twitter</Link></li>
                        <li><Link to="/about">Instagram</Link></li>
                    </ul>
                </div>

                {/* Example section */}
                <div>
                    <h4>About</h4>
                    <ul style={{listStyleType: 'none', padding: '0'}}>
                        <li><Link to="/about">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/about">Our Mission</Link></li>
                        <li><Link to="/about">Our Partners</Link></li>
                    </ul>
                </div>

                <div>
                    <h4>Join our newsletter!</h4>
                    <label for="email">Email address:</label>
                    <input type="text" id="email" name="email"></input>
                    <input type="submit" value="Submit"></input>
                </div>


            </div>

            <div style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#666'}}>
                &copy; {new Date().getFullYear()} Odera Inc. All rights reserved
            </div>

        </footer>
    );
}

export default Footer;