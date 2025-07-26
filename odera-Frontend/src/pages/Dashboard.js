import React from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { session, signOut } = UserAuth();
    const navigate = useNavigate();

    console.log(session);

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
            <p>Welcome, {session?.user?.email}</p>
            <div>
                <p onClick={handleSignOut}>Sign Out</p>
            </div>
        </div>

    );
};

export default Dashboard;