import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Freelancers.css";
import "./FreelancerSettings.css";

const FreelancerSettings = () => {
    const { session } = UserAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        userBio: "",
        organization: "",
        profilePic: "",
        hourlyRate: "",
        specialty: "",
        school: "",
        year: "Freshman",
        availability: "Unavailable",
        mailingList: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load defaults from backend
    useEffect(() => {
        const token = session?.access_token;
        if (!token) {
            setLoading(false);
            return;
        }

        fetch("/api/freelancer/settings", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.settings) {
                    // Map the capitalized backend fields to camelCase frontend fields
                    const validFields = {
                        firstName: data.settings.FirstName || "",
                        lastName: data.settings.LastName || "",
                        email: data.settings.Email || "",
                        phoneNumber: data.settings.PhoneNumber || "",
                        address: data.settings.Address || "",
                        userBio: data.settings.UserBio || "",
                        organization: data.settings.Organization || "",
                        profilePic: data.settings.ProfilePic || "",
                        hourlyRate: data.settings.HourlyRate || "",
                        specialty: data.settings.Specialty || "",
                        school: data.settings.School || "",
                        year: data.settings.Year || "Freshman",
                        availability: data.settings.Availability || "Unavailable",
                        mailingList: Boolean(data.settings.MailingList),
                    };
                    
                    setSettings(validFields);
                } else {
                    setError(data.error || "Failed to fetch settings");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [session]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Save updates to backend
    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const token = session?.access_token;
            
            // Convert camelCase frontend fields to capitalized backend fields
            const backendSettings = {
                FirstName: settings.firstName,
                LastName: settings.lastName,
                Email: settings.email,
                PhoneNumber: settings.phoneNumber,
                Address: settings.address,
                UserBio: settings.userBio,
                Organization: settings.organization,
                ProfilePic: settings.profilePic,
                HourlyRate: settings.hourlyRate,
                Specialty: settings.specialty,
                School: settings.school,
                Year: settings.year,
                Availability: settings.availability,
                MailingList: settings.mailingList,
            };
            
            const res = await fetch("/api/freelancer/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(backendSettings),
            });

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || "Failed to save settings");
            }
            setSuccess("Settings updated successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="freelancer-dashboard">
                <div className="loading-container">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="freelancer-dashboard">
            <div className="navbar-area"></div>
            
            <div className="dashboard-header">
                <div className="user-info">
                    <div className="user-details">
                        <h1>Freelancer Settings</h1>
                        <p>Update your personal profile and preferences</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="profile-btn" onClick={() => navigate("/dashboard/freelancers")}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="settings-container">
                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">{success}</div>}

                    <div className="settings-section">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" value={settings.firstName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={settings.lastName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={settings.email} onChange={handleChange} disabled />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" name="phoneNumber" value={settings.phoneNumber} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <input type="text" name="address" value={settings.address} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Bio</label>
                                <textarea name="userBio" value={settings.userBio} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Professional Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Organization</label>
                                <input type="text" name="organization" value={settings.organization} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Specialty</label>
                                <input type="text" name="specialty" value={settings.specialty} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Hourly Rate ($)</label>
                                <input type="number" name="hourlyRate" value={settings.hourlyRate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Availability</label>
                                <select name="availability" value={settings.availability} onChange={handleChange}>
                                    <option value="Available">Available</option>
                                    <option value="Unavailable">Unavailable</option>
                                    <option value="Busy">Busy</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Education</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>School</label>
                                <input type="text" name="school" value={settings.school} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <select name="year" value={settings.year} onChange={handleChange}>
                                    <option value="Freshman">Freshman</option>
                                    <option value="Sophomore">Sophomore</option>
                                    <option value="Junior">Junior</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Graduate">Graduate</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Profile & Preferences</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Profile Picture URL</label>
                                <input type="text" name="profilePic" value={settings.profilePic} onChange={handleChange} />
                            </div>
                            <div className="form-group checkbox-group full-width">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="mailingList" checked={settings.mailingList} onChange={handleChange} />
                                    <span className="checkbox-text">Subscribe to Mailing List</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerSettings;