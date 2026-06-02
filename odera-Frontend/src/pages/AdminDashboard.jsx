import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this points to your frontend Supabase init
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [users, setUsers] = useState([]);
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

                // Request both metrics and users at the same time
                const [metricsRes, usersRes] = await Promise.all([
                    fetch('http://localhost:3000/api/admin/metrics', { headers }),
                    fetch('http://localhost:3000/api/admin/users', { headers })
                ]);

                if (!metricsRes.ok || !usersRes.ok) {
                    if (metricsRes.status === 403 || usersRes.status === 403) throw new Error('Unauthorized. You are not an Admin.');
                    throw new Error('Failed to fetch dashboard data');
                }

                const metricsData = await metricsRes.json();
                const usersData = await usersRes.json();

                setMetrics(metricsData);
                setUsers(usersData);
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
            const res = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
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