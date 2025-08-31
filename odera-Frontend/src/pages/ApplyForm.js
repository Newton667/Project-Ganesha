import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || "";

function ApplyForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { session, signOut } = UserAuth();

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
      <h1>
        Apply for Job {job ? job.title : `#${jobId}`}
      </h1>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="apply-form">
        <label>
          Proposal Text (required):
          <textarea
            value={proposalText}
            onChange={(e) => setProposalText(e.target.value)}
            required
          />
        </label>

        <label>
          Cover Letter:
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </label>

        <label>
          Relevant Experience:
          <input
            type="text"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </label>

        <label>
          Proposed Timeline:
          <input
            type="text"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default ApplyForm;
