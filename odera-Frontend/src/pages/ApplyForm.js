import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserAuth } from '../context/AuthContext';
import './ApplyForm.css';

const API_BASE = process.env.REACT_APP_API_BASE || "";

function ApplyForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { session } = UserAuth();

  const [proposalText, setProposalText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [experience, setExperience] = useState("");
  const [timeline, setTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState(null); // store job details
  

  // Fetch job details when component mounts
  useEffect(() => {
    async function fetchJob() {
      try {
        const resp = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
          credentials: "include",
        });
        if (!resp.ok) throw new Error(`Failed to fetch job ${jobId}`);
        const data = await resp.json();
        setJob(data);
      } catch (err) {
        console.error(err);
        setError("Could not load job details.");
      }
    }
    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {

      const token = session?.access_token;

      const resp = await fetch(`${API_BASE}/api/job-applications`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          JobID: jobId,
          ProposalText: proposalText,
          CoverLetter: coverLetter,
          Experience: experience,
          Timeline: timeline,
          Status: "Pending",
        }),
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${resp.status}`);
      }

      alert("Application submitted successfully!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="apply-page">
    <header className="apply-header">
      <h1>Apply for {job ? job.title : "Position"}</h1>
    </header>

    <div className="form-container">
      <form onSubmit={handleSubmit} className="apply-form">
        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label>Proposal Text (required)</label>
          <textarea
            value={proposalText}
            onChange={(e) => setProposalText(e.target.value)}
            required
            placeholder="Describe why you are a good fit..."
          />
        </div>

        <div className="form-group">
          <label>Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Relevant Experience</label>
          <input
            type="text"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 3 years in React"
          />
        </div>

        <div className="form-group">
          <label>Proposed Timeline</label>
          <input
            type="text"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="e.g. 2 weeks"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

export default ApplyForm;
