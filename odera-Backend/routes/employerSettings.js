// routes/employerSettings.js
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const authMiddleware = require("../config/authMiddleware");

// GET employer settings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const employerId = req.user.id; // set by authMiddleware

    // Fetch from Employers
    const { data: employerData, error: employerError } = await supabase
      .from("Employers")
      .select("FirstName, LastName, Email, PhoneNumber, Address, CompanyName")
      .eq("EmployerID", employerId)
      .single();

    if (employerError) throw employerError;

    // Fetch from EmployerProfiles
    const { data: profileData, error: profileError } = await supabase
      .from("EmployerProfiles")
      .select("UserBio, Organization, ProfilePic, MailingList")
      .eq("EmployerID", employerId)
      .single();

    if (profileError) throw profileError;

    // Merge results
    const settings = { ...employerData, ...profileData };

    res.json({ success: true, settings });
  } catch (err) {
    console.error("Error fetching employer settings:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE employer settings
router.put("/", authMiddleware, async (req, res) => {
  try {
    const employerId = req.user.id;

    const {
      FirstName,
      LastName,
      Email,
      PhoneNumber,
      Address,
      CompanyName,
      UserBio,
      Organization,
      ProfilePic,
      MailingList,
    } = req.body;

    // Split into Employers + EmployerProfiles
    const employerUpdate = {
      FirstName,
      LastName,
      Email,
      PhoneNumber,
      Address,
      CompanyName,
    };

    const profileUpdate = {
      UserBio,
      Organization,
      ProfilePic,
      MailingList,
    };

    // Update Employers
    const { error: employerError } = await supabase
      .from("Employers")
      .update(employerUpdate)
      .eq("EmployerID", employerId);

    if (employerError) throw employerError;

    // Update EmployerProfiles
    const { error: profileError } = await supabase
      .from("EmployerProfiles")
      .update(profileUpdate)
      .eq("EmployerID", employerId);

    if (profileError) throw profileError;

    res.json({
      success: true,
      settings: { ...employerUpdate, ...profileUpdate },
    });
  } catch (err) {
    console.error("Error updating employer settings:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
