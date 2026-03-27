import { useEffect, useState } from "react";

export default function ContractorDashboard() {
  const [contractor, setContractor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState([]);
  const [machines, setMachines] = useState([]);
  const [wages, setWages] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [profileRes, bookingsRes] = await Promise.all([
          fetch("http://localhost:5000/api/contractors/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/bookings/contractor/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings");

        const profileData = await profileRes.json();
        const bookingsData = await bookingsRes.json();

        profileData.machines = Array.isArray(profileData.machines)
          ? profileData.machines
          : [];

        setContractor(profileData);
        setName(profileData.name || "");
        setEmail(profileData.email || "");
        setPhoneNumber(profileData.phoneNumber || "");
        setLocation(profileData.location || "");
        setSkills(profileData.skills || []);
        setMachines(profileData.machines);
        setWages(profileData.wages || "");
        setAdditionalInfo(profileData.additionalInfo || "");
        setImage(profileData.image || "");
        setImagePreview(profileData.image || "");
        setBookings(bookingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle image file selection - Upload to server
async function handleImageChange(e) {
  const file = e.target.files[0];
  if (file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file");
      return;
    }
    
    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:5000/api/upload/contractor-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Image upload failed");
      
      // Save the server URL
      setImage(data.imageUrl);
      alert("Image uploaded successfully! Don't forget to save your profile.");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image upload failed: " + err.message);
    }
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5000/api/contractors/update-profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          location,
          skills,
          machines,
          wages,
          additionalInfo,
          image, // This is now the server path like "/uploads/contractor-123-456.jpg"
        }),
      }
    );
    
    const updated = await res.json();
    if (!res.ok) throw new Error(updated.message || "Profile update failed");

    updated.machines = Array.isArray(updated.machines)
      ? updated.machines
      : [];

    setContractor(updated);
    alert("Profile updated successfully! ✅");
  } catch (err) {
    alert(err.message);
  }
}

  async function handleStatus(id, status) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/bookings/update-status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setBookings(bookings.map((b) => (b._id === id ? { ...b, status } : b)));
    } catch (err) {
      alert(err.message);
    }
  }

  // dynamic fields
  function addSkill() {
    setSkills([...skills, ""]);
  }
  function updateSkill(i, v) {
    const s = [...skills];
    s[i] = v;
    setSkills(s);
  }
  function removeSkill(i) {
    setSkills(skills.filter((_, idx) => idx !== i));
  }

  function addMachine() {
    setMachines([
      ...machines,
      { type: "", pricePerHour: 0, workerAvailable: false },
    ]);
  }
  function updateMachine(i, key, v) {
    const m = [...machines];
    m[i] = { ...m[i], [key]: v };
    setMachines(m);
  }
  function removeMachine(i) {
    setMachines(machines.filter((_, idx) => idx !== i));
  }

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading dashboard...</p></div>;
  if (error) return <div className="error-state"><p>⚠️ Error: {error}</p></div>;

  const avgRating =
    contractor?.ratings?.length > 0
      ? (
          contractor.ratings.reduce((sum, r) => sum + r.stars, 0) /
          contractor.ratings.length
        ).toFixed(1)
      : null;

  return (
    <div className="contractor-dashboard">
      <div className="dashboard-header">
        <h2>👷 Contractor Dashboard</h2>
        {avgRating && (
          <div className="rating-badge">
            ⭐ {avgRating} / 5.0
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h3 className="section-header">📋 My Profile</h3>
        <form onSubmit={handleProfileUpdate} className="profile-form">
          
          {/* Profile Image Upload Section */}
          <div className="image-upload-section">
            <div className="image-preview-container">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="profile-image-preview"
                />
              ) : (
                <div className="no-image-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p>No image uploaded</p>
                </div>
              )}
            </div>
            
            <div className="image-upload-controls">
              <label className="upload-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose Profile Image
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-file-input"
                />
              </label>
              <p className="image-info">Max size: 2MB • JPG, PNG, GIF</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                className="form-input"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                className="form-input"
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                className="form-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91-9876543210"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input 
                className="form-input"
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
              />
            </div>

            <div className="form-group full-width">
              <label>Wages/Salary (₹ per day)</label>
              <input
                className="form-input"
                type="number"
                value={wages}
                onChange={(e) => setWages(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Additional Information</label>
              <textarea
                className="form-textarea"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows="3"
              />
            </div>
          </div>

          {/* Skills Section */}
          <div className="dynamic-section">
            <div className="section-title-row">
              <label className="dynamic-label">🛠️ Skills</label>
              <button type="button" className="add-btn" onClick={addSkill}>
                ➕ Add Skill
              </button>
            </div>
            <div className="dynamic-items">
              {skills.map((s, i) => (
                <div key={i} className="dynamic-item">
                  <input
                    className="dynamic-input"
                    value={s}
                    onChange={(e) => updateSkill(i, e.target.value)}
                    placeholder="Enter skill"
                  />
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeSkill(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Machines Section */}
          <div className="dynamic-section machines-section">
            <div className="section-title-row">
              <label className="dynamic-label">🚜 Machines</label>
              <button type="button" className="add-btn" onClick={addMachine}>
                ➕ Add Machine
              </button>
            </div>
            <div className="machines-grid">
              {machines.map((m, i) => (
                <div key={i} className="machine-card">
                  <input
                    className="machine-type-input"
                    placeholder="Machine Type"
                    value={m.type}
                    onChange={(e) => updateMachine(i, "type", e.target.value)}
                  />
                  <input
                    className="machine-price-input"
                    type="number"
                    placeholder="Price/hour (₹)"
                    value={m.pricePerHour}
                    onChange={(e) =>
                      updateMachine(i, "pricePerHour", Number(e.target.value))
                    }
                  />
                  <label className="worker-checkbox">
                    <input
                      type="checkbox"
                      checked={m.workerAvailable}
                      onChange={(e) =>
                        updateMachine(i, "workerAvailable", e.target.checked)
                      }
                    />
                    <span>Worker available</span>
                  </label>
                  <button 
                    type="button" 
                    className="remove-machine-btn"
                    onClick={() => removeMachine(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="save-profile-btn">
            💾 Save Profile
          </button>
        </form>
      </div>

      {/* Bookings Section */}
      <div className="dashboard-section">
        <h3 className="section-header">📅 Booking Requests</h3>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>📭 No booking requests yet.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(b => (
              <div key={b._id} className={`booking-card status-${b.status}`}>
                <div className="booking-header">
                  <span className="status-badge">{b.status}</span>
                </div>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">👤 User:</span>
                    <span className="detail-value">{b.user?.name || "Unknown"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📅 Date:</span>
                    <span className="detail-value">
                      {b.date ? new Date(b.date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🚜 Machine:</span>
                    <span className="detail-value">{b.machineType || "N/A"}</span>
                  </div>
                </div>
                {b.status === "pending" && (
                  <div className="booking-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleStatus(b._id, "approved")}
                    >
                      ✓ Accept
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleStatus(b._id, "rejected")}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ratings Section */}
      <div className="dashboard-section">
        <h3 className="section-header">⭐ Customer Ratings</h3>
        {(contractor?.ratings || []).length === 0 ? (
          <div className="empty-state">
            <p>📊 No ratings yet.</p>
          </div>
        ) : (
          <div className="ratings-grid">
            {contractor.ratings.map((r, i) => (
              <div key={i} className="rating-card">
                <div className="rating-stars">
                  {"⭐".repeat(r.stars)}
                  <span className="star-count">{r.stars} / 5</span>
                </div>
                <p className="rating-description">{r.description}</p>
                <p className="rating-author">— {r.userName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}