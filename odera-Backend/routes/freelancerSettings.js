// routes/freelancerSettings.js
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../config/authMiddleware");

// GET freelancer settings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const freelancerId = req.user.id; // set by authMiddleware

    // Fetch from Freelancers
    const { data: freelancerData, error: freelancerError } = await supabase
      .from("Freelancers")
      .select("FirstName, LastName, Email, PhoneNumber, Address")
      .eq("FreelancerID", freelancerId)
      .single();

    if (freelancerError) throw freelancerError;

    // Fetch from FreelancerProfile
    const { data: profileData, error: profileError } = await supabase
      .from("FreelancerProfile")
      .select("UserBio, Organization, ProfilePic, HourlyRate, MailingList, Specialty, School, Year, Availability")
      .eq("FreelancerID", freelancerId)
      .single();

    if (profileError) throw profileError;

    // Merge results
    const settings = { ...freelancerData, ...profileData };

    res.json({ success: true, settings });
  } catch (err) {
    console.error("Error fetching freelancer settings:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE freelancer settings
router.put("/", authMiddleware, async (req, res) => {
  try {
    const freelancerId = req.user.id;

    const {
      FirstName,
      LastName,
      Email,
      PhoneNumber,
      Address,
      UserBio,
      Organization,
      ProfilePic,
      HourlyRate,
      Specialty,
      School,
      Year,
      Availability,
      MailingList,
    } = req.body;

    // Split into Freelancers + FreelancerProfiles
    const freelancerUpdate = {
      FirstName,
      LastName,
      Email,
      PhoneNumber,
      Address,
      HourlyRate,
      Specialty,
      School,
      Year,
      Availability,
    };

    const profileUpdate = {
      UserBio,
      Organization,
      ProfilePic,
      MailingList,
    };

    // Update Freelancers
    const { error: freelancerError } = await supabase
      .from("Freelancers")
      .update(freelancerUpdate)
      .eq("FreelancerID", freelancerId);

    if (freelancerError) throw freelancerError;

    // Update FreelancerProfiles
    const { error: profileError } = await supabase
      .from("FreelancerProfiles")
      .update(profileUpdate)
      .eq("FreelancerID", freelancerId);

    if (profileError) throw profileError;

    res.json({
      success: true,
      settings: { ...freelancerUpdate, ...profileUpdate },
    });
  } catch (err) {
    console.error("Error updating freelancer settings:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;