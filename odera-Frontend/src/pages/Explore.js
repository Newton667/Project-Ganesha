import React, { useEffect, useMemo, useState } from 'react';
import './Explore.css';

const API_BASE = process.env.REACT_APP_API_BASE || ''; // "" if same origin, or "http://localhost:4000"

function Explore() {
  const [activeTab, setActiveTab] = useState('all'); // default to All Jobs
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const tabs = [
    { id: 'all', label: 'All Jobs', cat: null },
    { id: 'web', label: 'Web Development', cat: 'Web Development' },
    { id: 'mobile', label: 'Mobile Apps', cat: 'Mobile' },
    { id: 'data', label: 'Data Science', cat: 'Data Science' },
    { id: 'ai', label: 'AI & ML', cat: 'AI & ML' },
    { id: 'game', label: 'Game Dev', cat: 'Game Dev' },
    { id: 'blockchain', label: 'Blockchain', cat: 'Blockchain' },
    { id: 'desktop', label: 'Desktop Apps', cat: 'Desktop Apps' },
    { id: 'devops', label: 'DevOps', cat: 'DevOps' },
  ];

  // Icons
  const SearchIcon = () => (
    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
  const DropdownIcon = () => (
    <svg className="filter-dropdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Fetch jobs
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError('');
        const cat = tabs.find(t => t.id === activeTab)?.cat || '';
        const params = new URLSearchParams({
          page: String(page),
          limit: '12',
          orderBy: 'JobCreated',
          dir: 'desc',
          onlyOpen: 'true',
        });
        if (cat) params.set('cat', cat);
        if (searchTerm.trim()) params.set('q', searchTerm.trim());

        const resp = await fetch(`${API_BASE}/api/jobs?${params.toString()}`, {
          signal: controller.signal,
          credentials: 'include',
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${resp.status}`);
        }
        const j = await resp.json();
        setJobs(Array.isArray(j.jobs) ? j.jobs : []);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [activeTab, searchTerm, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTabClick = (id) => {
    setActiveTab(id);
    setPage(1);
  };

  const prettyBudget = (b) => {
    if (!b) return '—';
    const min = Number(b.min || 0).toFixed(0);
    const max = Number(b.max || 0).toFixed(0);
    if (!Number(max) && !Number(min)) return '—';
    if (min === max) return `$${max}`;
    return `$${min} - $${max}`;
  };

  // keep layout stable with placeholder rating/reviews
  const computedJobs = useMemo(
    () =>
      jobs.map(j => ({
        ...j,
        _rating: 4.8,
        _reviews: 0,
      })),
    [jobs]
  );

  const ServiceCard = ({ service }) => {
    let icon = '💻';
    const t = (service.title || '').toLowerCase();
    if (t.includes('api') || t.includes('backend')) icon = '⚙️';
    else if (t.includes('mobile') || t.includes('ios') || t.includes('android')) icon = '📱';
    else if (t.includes('design') || t.includes('convert')) icon = '🖥️';

    // Read from normalized `category` OR fallback to raw `JobCat`
    const rawCat = service?.category ?? service?.JobCat ?? '';
    // Normalize to array: ["Cat A", "Cat B"]
    const categories = Array.isArray(rawCat)
      ? rawCat
      : (rawCat ? String(rawCat).split(',').map(s => s.trim()).filter(Boolean) : []);

    const primaryLabel = categories[0] || (rawCat || 'All');

    const CategoryChips = ({ items }) => {
      if (!items.length) return null;
      return (
        <div className="category-chips">
          {items.map((c, i) => (
            <span key={`${c}-${i}`} className="chip">{c}</span>
          ))}
        </div>
      );
    };

    return (
      <div className="service-card">
        <div className="service-header">
          <div className="service-icon">{icon}</div>
        </div>

        <div className="service-content">
          <h3 className="service-title">{service.title}</h3>

          <div className="seller-info">
            <div className="avatar">{(primaryLabel[0] || 'A').toUpperCase()}</div>
            <span className="seller-name">{primaryLabel}</span>
            <span className="seller-level">{service.urgency ? `Urgency: ${service.urgency}` : '—'}</span>
          </div>

          <p className="service-description">{service.desc || 'No description provided.'}</p>

          {/* Category chips */}
          <CategoryChips items={categories} />
        </div>

        <div className="service-footer">
          <div className="star-rating">
            <StarIcon />
            <span style={{ marginLeft: 4 }}>{service._rating.toFixed(1)}</span>
            <span className="rating-count">({service._reviews})</span>
          </div>
          <div className="price">
            <span className="starting-at">Budget</span>
            <div className="price-amount">{prettyBudget(service.budget)}</div>
          </div>
        </div>

        <div className="service-meta">
          <span className="posted">{service.posted || ''}</span>
          {service.duration ? <span className="duration"> · {service.duration}</span> : null}
        </div>
      </div>
    );
  };

  return (
    <div className="dev-marketplace">
      <div className="navbar-area" />

      <header className="marketplace-header">
        <h1 className="marketplace-title">Find the Perfect Developer</h1>
      </header>

      <div className="search-section">
        <div className="search-wrapper">
          <div className="search-container main-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search job titles or descriptions"
              className="search-input main-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filter-buttons">
            <button className="filter-dropdown" disabled>
              Budget <DropdownIcon />
            </button>
            <button className="filter-dropdown" disabled>
              Delivery Time <DropdownIcon />
            </button>
            <button className="filter-dropdown" disabled>
              Seller Level <DropdownIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="tab-container">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {error && <div className="error-box">Error: {error}</div>}
      {loading && <div className="loading">Loading jobs…</div>}

      {!loading && !error && (
        <>
          <div className="services-grid">
            {computedJobs.length === 0 ? (
              <div className="empty-state">No jobs found.</div>
            ) : (
              computedJobs.map((j) => <ServiceCard key={j.id} service={j} />)
            )}
          </div>

          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <span className="page-num">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={computedJobs.length < 12}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Explore;
