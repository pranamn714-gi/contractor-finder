import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContractorDashboard() {
  const navigate = useNavigate();
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
  const [uploading, setUploading] = useState(false);

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
        
        if (profileData.image) {
          const fullImageUrl = profileData.image.startsWith('http') 
            ? profileData.image 
            : `http://localhost:5000${profileData.image}`;
          
          setImage(profileData.image);
          setImagePreview(fullImageUrl);
        } else {
          setImage("");
          setImagePreview("");
        }
        
        setBookings(bookingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }
      
      setUploading(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

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
        
        if (data.imageUrl) {
          setImage(data.imageUrl);
          
          const fullImageUrl = data.imageUrl.startsWith('http') 
            ? data.imageUrl 
            : `http://localhost:5000${data.imageUrl}`;
          
          setImagePreview(fullImageUrl);
          alert("✅ Image uploaded successfully! Don't forget to save your profile.");
        } else {
          throw new Error("No image URL returned from server");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setImagePreview("");
        setImage("");
        alert("❌ Image upload failed: " + err.message);
      } finally {
        setUploading(false);
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
            image,
          }),
        }
      );
      
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || "Profile update failed");

      updated.machines = Array.isArray(updated.machines)
        ? updated.machines
        : [];

      if (updated.image) {
        const fullImageUrl = updated.image.startsWith('http') 
          ? updated.image 
          : `http://localhost:5000${updated.image}`;
        
        setImage(updated.image);
        setImagePreview(fullImageUrl);
      }

      setContractor(updated);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert("❌ " + err.message);
    }
  }

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

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="contractor-dashboard">
      {/* Top Navigation Bar */}
      <div className="dashboard-nav-header">
        <div className="nav-left">
          <h1>👷 Contractor Dashboard</h1>
        </div>
        <div className="nav-right">
          {avgRating && (
            <div className="rating-info">
              <span className="rating-label">Your Rating:</span>
              <span className="rating-value">⭐ {avgRating} / 5.0</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="quick-actions-section">
        <button 
          className="action-btn bookings-btn"
          onClick={() => navigate('/contractor/bookings')}
        >
          <div className="action-btn-icon">📅</div>
          <div className="action-btn-content">
            <h4>Booking Requests</h4>
            <p className="action-btn-subtext">View all your bookings</p>
          </div>
          {pendingBookingsCount > 0 && (
            <span className="action-badge">{pendingBookingsCount}</span>
          )}
        </button>

        <button 
          className="action-btn reviews-btn"
          onClick={() => navigate('/contractor/reviews')}
        >
          <div className="action-btn-icon">⭐</div>
          <div className="action-btn-content">
            <h4>Customer Reviews</h4>
            <p className="action-btn-subtext">See all your ratings & feedback</p>
          </div>
          {contractor?.ratings?.length > 0 && (
            <span className="action-badge">{contractor.ratings.length}</span>
          )}
        </button>
      </div>

      {/* Main Profile Management Section */}
      <div className="dashboard-section">
        <div className="section-header-container">
          <h3 className="section-header">✏️ Manage Your Profile</h3>
          <p className="section-subtitle">Update your information, skills, and machines</p>
        </div>

        <form onSubmit={handleProfileUpdate} className="profile-form">
          
          {/* Image Upload Section */}
          <div className="image-upload-section">
            <div className="image-preview-container">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview"
                  className="profile-image-preview"
                  onError={(e) => {
                    console.error("Image failed to load:", imagePreview);
                    e.target.src = "";
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <p>No image selected</p>
                </div>
              )}
            </div>

            <div className="image-upload-controls">
              <h4 className="upload-title">Profile Picture</h4>
              <label className="upload-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploading ? "Uploading..." : "Choose Profile Image"}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden-file-input"
                />
              </label>
              <p className="image-info">📋 Max size: 5MB • JPG, PNG, GIF</p>
              {uploading && <p className="uploading-text">📤 Uploading image...</p>}
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h4 className="form-section-title">📋 Basic Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  className="form-input"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  className="form-input"
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91-9876543210"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input 
                  className="form-input"
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Your city/area"
                />
              </div>

              <div className="form-group full-width">
                <label>Wages/Salary (₹ per day)</label>
                <input
                  className="form-input"
                  type="number"
                  value={wages}
                  onChange={(e) => setWages(e.target.value)}
                  placeholder="Enter your daily rate"
                />
              </div>

              <div className="form-group full-width">
                <label>Additional Information</label>
                <textarea
                  className="form-textarea"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Tell us about yourself, experience, certifications, etc."
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="dynamic-section">
            <div className="section-title-row">
              <h4 className="form-section-title">🛠️ Skills</h4>
              <button type="button" className="add-btn" onClick={addSkill}>
                ➕ Add Skill
              </button>
            </div>
            <div className="dynamic-items">
              {skills.length === 0 ? (
                <p className="empty-items-text">No skills added yet. Click "Add Skill" to get started.</p>
              ) : (
                skills.map((s, i) => (
                  <div key={i} className="dynamic-item">
                    <input
                      className="dynamic-input"
                      value={s}
                      onChange={(e) => updateSkill(i, e.target.value)}
                      placeholder="e.g. Excavator Operation, Soil Preparation"
                    />
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeSkill(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Machines Section */}
          <div className="dynamic-section machines-section">
            <div className="section-title-row">
              <h4 className="form-section-title">🚜 Machines You Own</h4>
              <button type="button" className="add-btn" onClick={addMachine}>
                ➕ Add Machine
              </button>
            </div>
            <div className="machines-grid">
              {machines.length === 0 ? (
                <p className="empty-items-text full-width">No machines added yet. Click "Add Machine" to list your equipment.</p>
              ) : (
                machines.map((m, i) => (
                  <div key={i} className="machine-card">
                    <input
                      className="machine-type-input"
                      placeholder="Machine Type (e.g., Excavator)"
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
                      title="Delete this machine"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="form-actions">
            <button type="submit" className="save-profile-btn" disabled={uploading}>
              {uploading ? "⏳ Saving..." : "💾 Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}