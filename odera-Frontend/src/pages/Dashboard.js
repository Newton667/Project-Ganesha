import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    // Handling Auth
    const { session, signOut } = UserAuth();
    const navigate = useNavigate();

    // Handling backend response
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState(null);

    console.log(session);

    // Retrieve data based on auth token
    useEffect(() => {
        const token = session?.access_token;
        if (!token) return;

        fetch('/api/employerDashboard', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => res.json())
        .then((data) => setJsonData(data))
        .catch((err) => setError(err.message));
    }, [session]);

    const handleSignOut = async (e) => {
        e.preventDefault()
        try {
            await signOut();
            navigate('/');
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div style={{ color: 'white' }}>
            <h1>Dashboard</h1>
            <p>Welcome, {session?.user?.user_metadata?.firstName} {session?.user?.user_metadata?.lastName}</p>
            <p>Your email is: {session?.user?.email}</p>
            <h1>Freelancer Dashboard Raw Data</h1>
            {error && <p>Error: {error}</p>}
            <pre>
                {jsonData ? JSON.stringify(jsonData, null, 2) : 'Loading...'}
            </pre>
            <div>
                <p onClick={handleSignOut}>Sign Out</p>
            </div>
        </div>

    );
};

export default Dashboard;