import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Employers.css";
import "./EmployerSettings.css";

const EmployerSettings = () => {
    const { session } = UserAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        companyName: "",
        userBio: "",
        organization: "",
        profilePic: "",
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

        fetch("/api/employer/settings", {
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
                        companyName: data.settings.CompanyName || "",
                        userBio: data.settings.UserBio || "",
                        organization: data.settings.Organization || "",
                        profilePic: data.settings.ProfilePic || "",
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
                CompanyName: settings.companyName,
                UserBio: settings.userBio,
                Organization: settings.organization,
                ProfilePic: settings.profilePic,
                MailingList: settings.mailingList,
            };
            
            const res = await fetch("/api/employer/settings", {
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
            <div className="employer-dashboard">
                <div className="loading-container">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="employer-dashboard">
            <div className="navbar-area"></div>
            
            <div className="dashboard-header">
                <div className="company-info">
                    <div className="company-details">
                        <h1>Employer Settings</h1>
                        <p>Update your company profile and preferences</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="profile-btn" onClick={() => navigate("/dashboard/employers")}>
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
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Company Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Company Name</label>
                                <input type="text" name="companyName" value={settings.companyName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Organization</label>
                                <input type="text" name="organization" value={settings.organization} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <input type="text" name="address" value={settings.address} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Company Bio</label>
                                <textarea name="userBio" value={settings.userBio} onChange={handleChange}></textarea>
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

export default EmployerSettings;