import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // adjust path if needed


const PostJob = () => {
    const [form, setForm] = useState({
        title: '',
        desc: '',
        category: '',
        urgency: '',
        duration: '',
        price: '',
        budgetMin: '',
        budgetMax: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const {
            data: { session },
            error,
            } = await supabase.auth.getSession();

            if (error || !session) {
            setMessage('❌ Not logged in');
            setLoading(false);
            return;
            }

            const token = session.access_token;

            const res = await fetch('/api/jobs/createjob', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(form),
            });

            if (res.ok) {
            setMessage('✅ Job created successfully!');
            setForm({
                title: '',
                desc: '',
                category: '',
                urgency: '',
                duration: '',
                price: '',
                budgetMin: '',
                budgetMax: '',
            });
            } else {
            const err = await res.json();
            setMessage('❌ ' + (err.error || 'Failed to create job'));
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Network error');
        } finally {
            setLoading(false);
        }
        };


    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1>Create a Job</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={form.title} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea 
                        name="desc" 
                        value={form.desc} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div>
                    <label>Category:</label>
                    <input 
                        type="text" 
                        name="category" 
                        value={form.category} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div>
                    <label>Urgency:</label>
                    <input 
                        type="text" 
                        name="urgency" 
                        value={form.urgency} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Duration:</label>
                    <input 
                        type="text" 
                        name="duration" 
                        value={form.duration} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        name="price" 
                        value={form.price} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div>
                    <label>Budget Min:</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        name="budgetMin" 
                        value={form.budgetMin} 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label>Budget Max:</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        name="budgetMax" 
                        value={form.budgetMax} 
                        onChange={handleChange} 
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Job'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default PostJob;
