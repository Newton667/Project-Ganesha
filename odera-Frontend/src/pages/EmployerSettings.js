import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import "./EmployerSettings.css";

const EmployerSettings = () => {
    const { session } = UserAuth();
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

    if (loading) return <p className="loading">Loading settings...</p>;

    return (
        <div className="employer-settings">
            <h2>Employer Settings</h2>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <form>
                <input
                    type="text"
                    name="firstName"
                    value={settings.firstName || ""}
                    onChange={handleChange}
                    placeholder="First Name"
                />
                <input
                    type="text"
                    name="lastName"
                    value={settings.lastName || ""}
                    onChange={handleChange}
                    placeholder="Last Name"
                />
                <input
                    type="email"
                    name="email"
                    value={settings.email || ""}
                    onChange={handleChange}
                    placeholder="Email"
                />
                <input
                    type="text"
                    name="phoneNumber"
                    value={settings.phoneNumber || ""}
                    onChange={handleChange}
                    placeholder="Phone Number"
                />
                <input
                    type="text"
                    name="address"
                    value={settings.address || ""}
                    onChange={handleChange}
                    placeholder="Address"
                />
                <input
                    type="text"
                    name="companyName"
                    value={settings.companyName || ""}
                    onChange={handleChange}
                    placeholder="Company Name"
                />
                <textarea
                    name="userBio"
                    value={settings.userBio || ""}
                    onChange={handleChange}
                    placeholder="User Bio"
                />
                <input
                    type="text"
                    name="organization"
                    value={settings.organization || ""}
                    onChange={handleChange}
                    placeholder="Organization"
                />
                <input
                    type="text"
                    name="profilePic"
                    value={settings.profilePic || ""}
                    onChange={handleChange}
                    placeholder="Profile Pic URL"
                />
                <label>
                    <input
                        type="checkbox"
                        name="mailingList"
                        checked={!!settings.mailingList}
                        onChange={handleChange}
                    />
                    Subscribe to Mailing List
                </label>
            </form>

            <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
};

export default EmployerSettings;