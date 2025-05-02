import React, { useState } from 'react';
import './Explore.css';

function Explore() {
  const [activeTab, setActiveTab] = useState('web');
  
  // Tab data - different programming specialties
  const tabs = [
    { id: 'web', label: 'Web Development' },
    { id: 'mobile', label: 'Mobile Apps' },
    { id: 'data', label: 'Data Science' },
    { id: 'ai', label: 'AI & ML' },
    { id: 'game', label: 'Game Dev' },
    { id: 'blockchain', label: 'Blockchain' },
    { id: 'desktop', label: 'Desktop Apps' },
    { id: 'devops', label: 'DevOps' }
  ];
  
  // Sample developers for different categories
  const developersByCategory = {
    web: [
      { 
        id: 1,
        title: 'I will create a responsive React website with modern UI',
        seller: 'Alex M.',
        sellerInitial: 'A',
        level: 'Top Rated',
        rating: 4.9,
        reviews: 183,
        price: 120,
        description: 'Professional React developer with 5+ years experience. Responsive design, SEO optimization, and fast delivery.'
      },
      { 
        id: 2,
        title: 'I will develop a custom WordPress theme for your business',
        seller: 'Maria L.',
        sellerInitial: 'M',
        level: 'Level 2',
        rating: 4.8,
        reviews: 97,
        price: 85,
        description: 'Custom WordPress themes tailored to your brand. Includes responsive design, SEO, and WooCommerce integration.'
      },
      { 
        id: 3,
        title: 'I will build your backend API with Node.js and Express',
        seller: 'James K.',
        sellerInitial: 'J',
        level: 'Top Rated',
        rating: 5.0,
        reviews: 142,
        price: 150,
        description: 'REST API development with Node.js and Express. MongoDB or SQL databases, authentication, and documentation included.'
      },
      { 
        id: 4,
        title: 'I will convert your design to a pixel-perfect website',
        seller: 'Sarah T.',
        sellerInitial: 'S',
        level: 'Level 1',
        rating: 4.7,
        reviews: 58,
        price: 75,
        description: 'Pixel-perfect HTML/CSS/JS conversion from your Figma, PSD, or XD designs. Fast turnaround and responsive layout.'
      }
    ],
    mobile: [
      { 
        id: 5,
        title: 'I will develop a React Native app for iOS and Android',
        seller: 'David R.',
        sellerInitial: 'D',
        level: 'Top Rated',
        rating: 4.9,
        reviews: 211,
        price: 200,
        description: 'Cross-platform mobile apps with React Native. Native functionality, API integration, and app store submission help.'
      },
      { 
        id: 6,
        title: 'I will create a native iOS app with Swift',
        seller: 'Emma P.',
        sellerInitial: 'E',
        level: 'Level 2',
        rating: 4.8,
        reviews: 76,
        price: 180,
        description: 'Professional iOS development using Swift. UI/UX implementation, API integration, and App Store submission.'
      }
    ],
    data: [
      { 
        id: 7,
        title: 'I will build custom data dashboards with Python and Dash',
        seller: 'Michael B.',
        sellerInitial: 'M',
        level: 'Top Rated',
        rating: 4.9,
        reviews: 128,
        price: 150,
        description: 'Interactive data dashboards using Python, Dash, and Plotly. Data visualization and analysis for your business needs.'
      }
    ],
    ai: [
      { 
        id: 8,
        title: 'I will develop machine learning models for your data',
        seller: 'Sophia L.',
        sellerInitial: 'S',
        level: 'Top Rated',
        rating: 5.0,
        reviews: 93,
        price: 250,
        description: 'Custom ML models using TensorFlow/PyTorch. Classification, regression, clustering, and more based on your data.'
      }
    ],
    game: [
      { 
        id: 9,
        title: 'I will create a 2D game with Unity and C#',
        seller: 'Thomas J.',
        sellerInitial: 'T',
        level: 'Level 2',
        rating: 4.7,
        reviews: 64,
        price: 120,
        description: '2D game development with Unity. Complete with physics, animations, and basic UI. Source code included.'
      }
    ],
    blockchain: [
      { 
        id: 10,
        title: 'I will develop smart contracts on Ethereum',
        seller: 'Ryan D.',
        sellerInitial: 'R',
        level: 'Top Rated',
        rating: 4.9,
        reviews: 86,
        price: 300,
        description: 'Secure smart contracts development using Solidity. Testing, auditing, and deployment to Ethereum mainnet or testnet.'
      }
    ],
    desktop: [
      { 
        id: 11,
        title: 'I will build a cross-platform desktop app with Electron',
        seller: 'Olivia M.',
        sellerInitial: 'O',
        level: 'Level 2',
        rating: 4.8,
        reviews: 72,
        price: 160,
        description: 'Cross-platform desktop applications using Electron. Modern UI, native functionality, and installer packages.'
      }
    ],
    devops: [
      { 
        id: 12,
        title: 'I will set up CI/CD pipelines with GitHub Actions',
        seller: 'Lucas K.',
        sellerInitial: 'L',
        level: 'Top Rated',
        rating: 4.9,
        reviews: 104,
        price: 140,
        description: 'Automated CI/CD workflows with GitHub Actions. Testing, deployment, and notification setups for your projects.'
      }
    ]
  };
  
  // Icon components for UI elements
  const SearchIcon = () => (
    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="none"/>
    </svg>
  );
  
  // Service card component
  const ServiceCard = ({ service }) => {
    // Determine which icon to use based on service type
    let icon = '💻'; // default web icon
    
    if (service.title.includes('backend') || service.title.includes('API')) {
      icon = '⚙️';
    } else if (service.title.includes('mobile') || service.title.includes('iOS') || service.title.includes('Android')) {
      icon = '📱';
    } else if (service.title.includes('design') || service.title.includes('convert')) {
      icon = '🖥️';
    }
    
    return (
      <div className="service-card">
        <div className="service-header">
          <div className="service-icon">
            {icon}
          </div>
        </div>
        <div className="service-content">
          <h3 className="service-title">{service.title}</h3>
          <div className="seller-info">
            <div className="avatar">{service.sellerInitial}</div>
            <span className="seller-name">{service.seller}</span>
            <span className="seller-level">{service.level}</span>
          </div>
          <p className="service-description">{service.description}</p>
        </div>
        <div className="service-footer">
          <div className="star-rating">
            <StarIcon />
            <span style={{marginLeft: '4px'}}>{service.rating}</span>
            <span className="rating-count">({service.reviews})</span>
          </div>
          <div className="price">
            <span className="starting-at">Starting at</span>
            <div className="price-amount">${service.price}</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Dropdown icon
  const DropdownIcon = () => (
    <svg className="filter-dropdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="dev-marketplace">
      {/* Black top area for transparent navigation - removing button as it's handled by the nav */}
      <div className="navbar-area">
        {/* Navigation button removed - will be part of the main navigation */}
      </div>
      
      <header className="marketplace-header">
        <h1 className="marketplace-title">Find the Perfect Developer</h1>
      </header>
      
      {/* Main search area */}
      <div className="search-section">
        <div className="search-wrapper">
          <div className="search-container main-search">
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search for services" 
              className="search-input main-search"
            />
          </div>
          
          <div className="filter-buttons">
            <button className="filter-dropdown">
              Budget
              <DropdownIcon />
            </button>
            
            <button className="filter-dropdown">
              Delivery Time
              <DropdownIcon />
            </button>
            
            <button className="filter-dropdown">
              Seller Level
              <DropdownIcon />
            </button>
          </div>
        </div>
      </div>
      
      <div className="tab-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      
      <div className="services-grid">
        {developersByCategory[activeTab]?.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}

export default Explore;