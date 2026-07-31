import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this points to your frontend Supabase init
import './AdminDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE || '';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchMetrics() {
            try {
                // Grab the current user's JWT
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    throw new Error('You must be logged in to view this page.');
                }

                const headers = {
                    'Authorization': `Bearer ${session.access_token}`
                };

                // Request all necessary dashboard data simultaneously
                const [metricsRes, usersRes, jobsRes, contractsRes, messagesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/admin/metrics`, { headers }),
                    fetch(`${API_BASE_URL}/api/admin/users`, { headers }),
                    fetch(`${API_BASE_URL}/api/admin/jobs`, { headers }),
                    fetch(`${API_BASE_URL}/api/admin/contracts`, { headers }),
                    fetch(`${API_BASE_URL}/api/admin/messages`, { headers })
                ]);

                if (!metricsRes.ok || !usersRes.ok || !jobsRes.ok || !contractsRes.ok || !messagesRes.ok) {
                    if (metricsRes.status === 403 || usersRes.status === 403) throw new Error('Unauthorized. You are not an Admin.');
                    throw new Error('Failed to fetch dashboard data');
                }

                const metricsData = await metricsRes.json();
                const usersData = await usersRes.json();
                const jobsData = await jobsRes.json();
                const contractsData = await contractsRes.json();
                const messagesData = await messagesRes.json();

                setMetrics(metricsData);
                setUsers(usersData);
                setJobs(jobsData);
                setContracts(contractsData);
                setMessages(messagesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    async function handleDeleteUser(userId) {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (!res.ok) throw new Error('Failed to delete user');
            
            // Instantly remove the deleted user from the UI
            setUsers(users.filter(u => u.id !== userId));
            alert('User deleted successfully.');
        } catch (err) {
            alert(err.message);
        }
    }

    // ==========================================
    // JOBS ACTIONS
    // ==========================================
    async function handleEditJob(job) {
        const newTitle = window.prompt('Enter new job title:', job.JobTitle);
        if (!newTitle || newTitle === job.JobTitle) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/admin/jobs/${job.JobID}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ JobTitle: newTitle })
            });
            if (!res.ok) throw new Error('Failed to update job');
            setJobs(jobs.map(j => j.JobID === job.JobID ? { ...j, JobTitle: newTitle } : j));
        } catch (err) { alert(err.message); }
    }

    async function handleDeleteJob(jobId) {
        if (!window.confirm('Are you sure you want to delete this job? If this job has active contracts, the deletion might fail.')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!res.ok) throw new Error('Failed to delete job. Active references may still exist.');
            setJobs(jobs.filter(j => j.JobID !== jobId));
        } catch (err) { alert(err.message); }
    }

    // ==========================================
    // CONTRACTS ACTIONS
    // ==========================================
    async function handleRevokeContract(contractId) {
        if (!window.confirm('Are you sure you want to revoke this contract?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/admin/contracts/${contractId}/revoke`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!res.ok) throw new Error('Failed to revoke contract');
            setContracts(contracts.map(c => c.ContractID === contractId ? { ...c, Status: 'Revoked' } : c));
        } catch (err) { alert(err.message); }
    }

    // ==========================================
    // MESSAGES ACTIONS
    // ==========================================
    async function handleEditMessage(message) {
        const newContent = window.prompt('Enter new message content:', message.content);
        if (!newContent || newContent === message.content) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/admin/messages/${message.messageid}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            });
            if (!res.ok) throw new Error('Failed to update message');
            setMessages(messages.map(m => m.messageid === message.messageid ? { ...m, content: newContent } : m));
        } catch (err) { alert(err.message); }
    }

    async function handleDeleteMessage(messageId) {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${API_BASE_URL}/api/admin/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!res.ok) throw new Error('Failed to delete message');
            setMessages(messages.filter(m => m.messageid !== messageId));
        } catch (err) { alert(err.message); }
    }

    if (loading) return <div className="admin-loading">Loading Admin Dashboard...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    return (
        <div className="admin-dashboard-container">
            <header className="admin-header">
                <h1>System Dashboard</h1>
                <p>Overview of platform metrics and user management.</p>
            </header>
            
            <section className="admin-metrics-grid">
                <MetricCard title="Total Users" value={metrics?.totalUsers} sub={`Employers: ${metrics?.employersCount} | Freelancers: ${metrics?.freelancersCount}`} />
                <MetricCard title="Total Jobs" value={metrics?.jobsCount} />
                <MetricCard title="Active Contracts" value={metrics?.contractsCount} />
                <MetricCard title="Messages Sent" value={metrics?.messagesCount} />
            </section>

            <section className="admin-users-section">
                <h2>User Management</h2>
                <div className="admin-table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Created At</th>
                                <th>Last Sign In</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td title={user.id}>{user.id.substring(0, 8)}...</td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</td>
                                    <td>
                                        <button className="admin-btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center'}}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="admin-users-section" style={{ marginTop: '3rem' }}>
                <h2>Jobs Management</h2>
                <div className="admin-table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.JobID}>
                                    <td title={job.JobID}>{job.JobID.substring(0, 8)}...</td>
                                    <td>{job.JobTitle}</td>
                                    <td>{job.JobCat}</td>
                                    <td>${job.JobPrice}</td>
                                    <td>
                                        <button className="admin-btn-edit" onClick={() => handleEditJob(job)}>Edit</button>
                                        <button className="admin-btn-delete" onClick={() => handleDeleteJob(job.JobID)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}}>No jobs found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="admin-users-section" style={{ marginTop: '3rem' }}>
                <h2>Contracts Management</h2>
                <div className="admin-table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Status</th>
                                <th>Start Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map(contract => (
                                <tr key={contract.ContractID}>
                                    <td title={contract.ContractID}>{contract.ContractID.substring(0, 8)}...</td>
                                    <td>{contract.Status}</td>
                                    <td>{contract.StartDate ? new Date(contract.StartDate).toLocaleDateString() : 'Pending'}</td>
                                    <td>
                                        {contract.Status !== 'Revoked' ? (
                                            <button className="admin-btn-warn" onClick={() => handleRevokeContract(contract.ContractID)}>Revoke</button>
                                        ) : (
                                            <span style={{ color: '#d97706', fontWeight: 'bold' }}>Revoked</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {contracts.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No contracts found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="admin-users-section" style={{ marginTop: '3rem' }}>
                <h2>Messages Management</h2>
                <div className="admin-table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Content</th>
                                <th>Timestamp</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map(message => (
                                <tr key={message.messageid}>
                                    <td title={message.messageid}>{message.messageid.substring(0, 8)}...</td>
                                    <td>{message.content.substring(0, 50)}{message.content.length > 50 && '...'}</td>
                                    <td>{new Date(message.timestamp).toLocaleString()}</td>
                                    <td>
                                        <button className="admin-btn-edit" onClick={() => handleEditMessage(message)}>Edit</button>
                                        <button className="admin-btn-delete" onClick={() => handleDeleteMessage(message.messageid)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {messages.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No messages found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    );
}

function MetricCard({ title, value, sub }) {
    return (
        <div className="admin-metric-card">
            <h3>{title}</h3>
            <div className="admin-metric-value">{value}</div>
            {sub && <div className="admin-metric-sub">{sub}</div>}
        </div>
    );
}