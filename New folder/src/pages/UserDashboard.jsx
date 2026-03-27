import { useEffect, useState } from "react";


export default function UserDashboard() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [userBookings, setUserBookings] = useState([]); // NEW: Store user's bookings

  // Search & Filters
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  // Booking form state
  const [bookingDate, setBookingDate] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [duration, setDuration] = useState("");
  const [cancellationHours, setCancellationHours] = useState("24");

  // Rating form state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingContractorId, setRatingContractorId] = useState(null);
  const [stars, setStars] = useState(5);
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // Fetch contractors
        const contractorsRes = await fetch("http://localhost:5000/api/contractors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!contractorsRes.ok) throw new Error("Failed to fetch contractors");
        const contractorsData = await contractorsRes.json();
        setContractors(contractorsData);

        // Fetch user's bookings
        const bookingsRes = await fetch("http://localhost:5000/api/bookings/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setUserBookings(bookingsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleSelectContractor(contractorId) {
    setSelectedContractor(contractorId);
    setSelectedMachine("");
    setBookingDate("");
    setDuration("");
    setCancellationHours("24");
  }

  async function handleBooking(contractorId) {
    if (!bookingDate || !selectedMachine || !duration) {
      alert("Please fill all booking fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contractor: contractorId,
          date: bookingDate,
          machineType: selectedMachine,
          duration: Number(duration),
          cancellationHours: Number(cancellationHours),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("Booking request sent successfully! ✅");
      
      // Redirect to My Bookings page
      setTimeout(() => {
        window.location.href = "/my-bookings";
      }, 1000);
      
      // Clear form
      setSelectedContractor(null);
      setBookingDate("");
      setSelectedMachine("");
      setDuration("");
      setCancellationHours("24");
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRating(e) {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please write a review");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/ratings/${ratingContractorId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stars, description }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Rating failed");

      alert("Rating submitted successfully! ⭐");
      setShowRatingForm(false);
      setStars(5);
      setDescription("");
      
      // Refresh contractors to show new rating
      const refreshRes = await fetch("http://localhost:5000/api/contractors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshData = await refreshRes.json();
      setContractors(refreshData);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading contractors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>⚠️ Error: {error}</p>
      </div>
    );
  }

  // Apply Filters
  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = search
      ? contractor.name?.toLowerCase().includes(search.toLowerCase()) ||
        contractor.machines?.some(m => m.type?.toLowerCase().includes(search.toLowerCase()))
      : true;

    const matchesLocation = locationFilter
      ? contractor.location?.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesSkill = skillFilter
      ? contractor.skills?.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      : true;

    return matchesSearch && matchesLocation && matchesSkill;
  });

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h2>🔍 Find Contractors</h2>
            <p className="header-subtitle">Browse and book trusted professionals</p>
          </div>
          <a href="/my-bookings" className="my-bookings-btn">
            📅 My Bookings
          </a>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="filters-section">
        <div className="filter-card">
          <div className="filter-icon">🔍</div>
          <input
            className="filter-input"
            placeholder="Search by name or machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-card">
          <div className="filter-icon">📍</div>
          <input
            className="filter-input"
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <div className="filter-card">
          <div className="filter-icon">🛠️</div>
          <input
            className="filter-input"
            placeholder="Filter by skill"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Results Count */}
      {(search || locationFilter || skillFilter) && (
        <div className="results-info">
          <p>Found {filteredContractors.length} contractor{filteredContractors.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {filteredContractors.length === 0 ? (
        <div className="empty-state">
          <p>😕 No contractors found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="contractors-grid">
          {filteredContractors.map((contractor, index) => {
            const avgRating =
              contractor.ratings?.length > 0
                ? (
                    contractor.ratings.reduce((sum, r) => sum + r.stars, 0) /
                    contractor.ratings.length
                  ).toFixed(1)
                : null;

            // Assign color class
            const colorClass = `color-${(index % 6) + 1}`;

            return (
              <div key={contractor._id} className={`contractor-card ${colorClass}`}>
                {/* Profile Header */}
                <div className="contractor-header">
                  <div className="contractor-avatar">
                    {contractor.image ? (
                      <img 
                        src={`http://localhost:5000${contractor.image}`} 
                        alt={contractor.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="avatar-placeholder" style={{ display: contractor.image ? 'none' : 'flex' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="contractor-info">
                    <h3 className="contractor-name">{contractor.name}</h3>
                    <p className="contractor-location">📍 {contractor.location || "Location not set"}</p>
                    {avgRating && (
                      <div className="rating-display">
                        ⭐ {avgRating} / 5.0
                        <span className="rating-count">({contractor.ratings.length})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="contact-section">
                  <div className="contact-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{contractor.email}</span>
                  </div>
                  {contractor.phoneNumber && (
                    <div className="contact-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{contractor.phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {contractor.skills?.length > 0 && (
                  <div className="skills-section">
                    <h4>🛠️ Skills</h4>
                    <div className="skills-list">
                      {contractor.skills.map((skill, i) => (
                        <span key={i} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Machines */}
                {contractor.machines?.length > 0 && (
                  <div className="machines-section">
                    <h4>🚜 Available Machines</h4>
                    <div className="machines-list">
                      {contractor.machines.map((machine, i) => (
                        <div key={i} className="machine-item">
                          <span className="machine-type">{machine.type}</span>
                          <span className="machine-price">₹{machine.pricePerHour}/hr</span>
                          {machine.workerAvailable && (
                            <span className="worker-badge">👷 Worker</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wages */}
                {contractor.wages && (
                  <div className="wages-section">
                    <h4>💰 Daily Wages</h4>
                    <p className="wages-amount">₹{contractor.wages}/day</p>
                  </div>
                )}

                {/* Additional Info */}
                {contractor.additionalInfo && (
                  <div className="info-section">
                    <h4>ℹ️ Additional Information</h4>
                    <p>{contractor.additionalInfo}</p>
                  </div>
                )}

                {/* Check if user has booked this contractor */}
                {(() => {
                  const hasBooked = userBookings.some(
                    (booking) => booking.contractor?._id === contractor._id
                  );

                  return (
                    <>
                      {/* Action Buttons */}
                      <div className="card-actions">
                        {/* ALWAYS show Book Now button */}
                        <button
                          className="btn-book-full"
                          onClick={() => handleSelectContractor(contractor._id)}
                        >
                          📅 Book Now
                        </button>

                        {/* Show Booking Status + Rate buttons ONLY if already booked */}
                        {hasBooked && (
                          <>
                            <a href="/my-bookings" className="btn-bookings-full">
                              📋 See Booking Status
                            </a>
                            <button
                              className="btn-rate-full"
                              onClick={() => {
                                setRatingContractorId(contractor._id);
                                setShowRatingForm(true);
                              }}
                            >
                              ⭐ Rate Contractor
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Booking Form */}
                {selectedContractor === contractor._id && (
                  <div className="booking-form">
                    <h4>📅 Book {contractor.name}</h4>
                    
                    <div className="booking-field">
                      <label>Select Date</label>
                      <input
                        type="date"
                        className="booking-input"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="booking-field">
                      <label>Select Machine</label>
                      <select
                        className="booking-select"
                        value={selectedMachine}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                      >
                        <option value="">-- Choose a machine --</option>
                        {contractor.machines?.map((machine, idx) => (
                          <option key={idx} value={machine.type}>
                            {machine.type} - ₹{machine.pricePerHour}/hr
                            {machine.workerAvailable ? " (with worker)" : " (without worker)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="booking-field">
                      <label>Duration (hours)</label>
                      <input
                        type="number"
                        className="booking-input"
                        placeholder="Enter duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                      />
                    </div>

                    <div className="booking-field">
                      <label>Cancellation Notice (hours)</label>
                      <input
                        type="number"
                        className="booking-input"
                        placeholder="Hours before cancellation"
                        value={cancellationHours}
                        onChange={(e) => setCancellationHours(e.target.value)}
                        min="1"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        className="btn-submit"
                        onClick={() => handleBooking(contractor._id)}
                      >
                        ✓ Confirm
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => setSelectedContractor(null)}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="modal-overlay" onClick={() => setShowRatingForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⭐ Rate Contractor</h3>
            <form onSubmit={handleRating}>
              <div className="rating-stars-input">
                <label>Rating:</label>
                <div className="stars-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${stars >= star ? 'active' : ''}`}
                      onClick={() => setStars(star)}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                className="rating-textarea"
                placeholder="Write your review..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Submit Rating
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowRatingForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}