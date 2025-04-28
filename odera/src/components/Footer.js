import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer style={{backgroundColor: 'f8f8f8', padding: '2rem', marginTop: '2rem', borderTop: '1px solid #ccc'}}>
            <div style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap'}}>
                
                {/* Example section */}
                <div>
                    <h4>About</h4>
                    <ul style={{listStyleType: 'none', padding: '0'}}>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                    </ul>
                </div>


            </div>

            <div style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#666'}}>
                &copy; {new Date().getFullYear()} Odera Inc. All rights reserved
            </div>

        </footer>
    );
}

export default Footer;