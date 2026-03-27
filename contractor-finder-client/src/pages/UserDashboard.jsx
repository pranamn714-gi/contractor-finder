import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [userRatings, setUserRatings] = useState([]);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  // Booking form
  const [bookingDate, setBookingDate] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [duration, setDuration] = useState("");
  const [cancellationHours, setCancellationHours] = useState("24");

  // Rating form
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingContractorId, setRatingContractorId] = useState(null);
  const [ratingContractorName, setRatingContractorName] = useState("");
  const [stars, setStars] = useState(5);
  const [description, setDescription] = useState("");
  const [isEditingRating, setIsEditingRating] = useState(false);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState("browse");

  // Toast
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3000);
  };

  // ── Fetch all data ─────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [contractorsRes, bookingsRes] = await Promise.all([
          fetch("http://localhost:5000/api/contractors", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/bookings/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!contractorsRes.ok) throw new Error("Failed to fetch contractors");
        const contractorsData = await contractorsRes.json();
        setContractors(contractorsData);

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

  // ── Build user's own ratings from contractor data ───
  useEffect(() => {
    if (contractors.length === 0) return;
    const token = localStorage.getItem("token");

    async function buildUserRatings() {
      try {
        const allRatings = [];
        for (const c of contractors) {
          const res = await fetch(`http://localhost:5000/api/ratings/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) continue;
          const data = await res.json();
          data.forEach(r => {
            allRatings.push({ ...r, contractorName: c.name, contractorId: c._id });
          });
        }
        const payload = JSON.parse(atob(token.split(".")[1]));
        const myId = payload.id;
        setUserRatings(allRatings.filter(r => r.user?._id === myId || r.user === myId));
      } catch (e) {
        console.error("Failed to load user ratings:", e);
      }
    }
    buildUserRatings();
  }, [contractors]);

  // ── Booking ────────────────────────────────────────
  function handleSelectContractor(contractorId) {
    setSelectedContractor(contractorId);
    setSelectedMachine("");
    setBookingDate("");
    setDuration("");
    setCancellationHours("24");
  }

  async function handleBooking(contractorId) {
    if (!bookingDate || !selectedMachine || !duration) {
      showToast("Please fill all booking fields", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      showToast("Booking request sent! ✅");
      setSelectedContractor(null);
      setBookingDate(""); setSelectedMachine(""); setDuration(""); setCancellationHours("24");
      setTimeout(() => { window.location.href = "/my-bookings"; }, 1200);
    } catch (err) { showToast(err.message, "error"); }
  }

  // ── Open rating form (new or edit) ─────────────────
  function openRatingForm(contractorId, contractorName, existing = null) {
    setRatingContractorId(contractorId);
    setRatingContractorName(contractorName);
    if (existing) {
      setStars(existing.stars);
      setDescription(existing.description || "");
      setIsEditingRating(true);
    } else {
      setStars(5);
      setDescription("");
      setIsEditingRating(false);
    }
    setShowRatingForm(true);
  }

  // ── Submit rating ──────────────────────────────────
  async function handleRating(e) {
    e.preventDefault();
    if (!description.trim()) { showToast("Please write a review", "error"); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/ratings/${ratingContractorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stars, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Rating failed");

      showToast(isEditingRating ? "Rating updated! ⭐" : "Rating submitted! ⭐");
      setShowRatingForm(false);
      setStars(5); setDescription("");

      const refreshRes = await fetch("http://localhost:5000/api/contractors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshData = await refreshRes.json();
      setContractors(refreshData);
    } catch (err) { showToast(err.message, "error"); }
  }

  // ── Filters ────────────────────────────────────────
  const filteredContractors = contractors.filter(c => {
    const matchesSearch = search
      ? c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.machines?.some(m => m.type?.toLowerCase().includes(search.toLowerCase()))
      : true;
    const matchesLocation = locationFilter
      ? c.location?.toLowerCase().includes(locationFilter.toLowerCase()) : true;
    const matchesSkill = skillFilter
      ? c.skills?.some(s => s.toLowerCase().includes(skillFilter.toLowerCase())) : true;
    return matchesSearch && matchesLocation && matchesSkill;
  });

  if (loading) return (
    <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
  );
  if (error) return (
    <div className="error-state"><p>⚠️ {error}</p></div>
  );

  return (
    <div className="user-dashboard">

      {/* ── Toast ── */}
      {toast.msg && (
        <div style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background: toast.type==="error" ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)",
          border:`1.5px solid ${toast.type==="error" ? "rgba(239,68,68,0.4)" : "rgba(52,211,153,0.4)"}`,
          color: toast.type==="error" ? "#f87171" : "#34d399",
          padding:"11px 26px", borderRadius:50, fontSize:14, fontWeight:800,
          boxShadow:"0 8px 24px rgba(0,0,0,0.35)", zIndex:9999, whiteSpace:"nowrap",
        }}>{toast.msg}</div>
      )}

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h2>🔍 Find Contractors</h2>
            <p className="header-subtitle">Browse and book trusted professionals</p>
          </div>
          <a href="/my-bookings" className="my-bookings-btn">📅 My Bookings</a>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{
        display:"flex", gap:8, padding:"0 0 22px",
        borderBottom:"1px solid rgba(255,255,255,0.08)", marginBottom:24,
      }}>
        {[
          { id:"browse",    icon:"🔍", label:"Browse Contractors" },
          { id:"myratings", icon:"⭐", label:`My Reviews (${userRatings.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding:"9px 20px", borderRadius:50,
            border:`1.5px solid ${activeTab===t.id ? "transparent" : "rgba(255,255,255,0.1)"}`,
            background: activeTab===t.id ? "linear-gradient(135deg,#7c3aed,#5c67f2)" : "transparent",
            color: activeTab===t.id ? "#fff" : "rgba(255,255,255,0.45)",
            fontSize:13, fontWeight:800, cursor:"pointer",
            boxShadow: activeTab===t.id ? "0 4px 14px rgba(124,58,237,0.35)" : "none",
            transition:"all 0.2s", display:"flex", alignItems:"center", gap:7,
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          TAB: BROWSE CONTRACTORS
      ════════════════════════════════════════ */}
      {activeTab === "browse" && (
        <>
          {/* Filters */}
          <div className="filters-section">
            <div className="filter-card">
              <div className="filter-icon">🔍</div>
              <input className="filter-input" placeholder="Search by name or machine..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-card">
              <div className="filter-icon">📍</div>
              <input className="filter-input" placeholder="Filter by location"
                value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
            </div>
            <div className="filter-card">
              <div className="filter-icon">🛠️</div>
              <input className="filter-input" placeholder="Filter by skill"
                value={skillFilter} onChange={e => setSkillFilter(e.target.value)} />
            </div>
          </div>

          {(search || locationFilter || skillFilter) && (
            <div className="results-info">
              <p>Found {filteredContractors.length} contractor{filteredContractors.length !== 1 ? "s" : ""}</p>
            </div>
          )}

          {filteredContractors.length === 0 ? (
            <div className="empty-state"><p>😕 No contractors found. Try adjusting your filters.</p></div>
          ) : (
            <div className="contractors-grid">
              {filteredContractors.map((contractor, index) => {
                const avgRating = contractor.ratings?.length > 0
                  ? (contractor.ratings.reduce((s, r) => s + r.stars, 0) / contractor.ratings.length).toFixed(1)
                  : null;
                const colorClass = `color-${(index % 6) + 1}`;
                const hasBooked = userBookings.some(b => b.contractor?._id === contractor._id);
                const myRating = userRatings.find(r => r.contractorId === contractor._id);

                return (
                  <div key={contractor._id} className={`contractor-card ${colorClass}`}>

                    {/* Profile Header */}
                    <div className="contractor-header">
                      <div className="contractor-avatar">
                        {contractor.image ? (
                          <img src={`http://localhost:5000${contractor.image}`} alt={contractor.name}
                            onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                          />
                        ) : null}
                        <div className="avatar-placeholder" style={{ display: contractor.image ? "none" : "flex" }}>
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

                    {/* Contact */}
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
                          {contractor.machines.map((m, i) => (
                            <div key={i} className="machine-item">
                              <span className="machine-type">{m.type}</span>
                              <span className="machine-price">₹{m.pricePerHour}/hr</span>
                              {m.workerAvailable && <span className="worker-badge">👷 Worker</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {contractor.wages && (
                      <div className="wages-section">
                        <h4>💰 Daily Wages</h4>
                        <p className="wages-amount">₹{contractor.wages}/day</p>
                      </div>
                    )}

                    {contractor.additionalInfo && (
                      <div className="info-section">
                        <h4>ℹ️ Additional Information</h4>
                        <p>{contractor.additionalInfo}</p>
                      </div>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="card-actions">
                      <button className="btn-book-full" onClick={() => handleSelectContractor(contractor._id)}>
                        📅 Book Now
                      </button>

                      {hasBooked && (
                        <>
                          <a href="/my-bookings" className="btn-bookings-full">📋 See Booking Status</a>
                          <button
                            className="btn-rate-full"
                            onClick={() => openRatingForm(contractor._id, contractor.name, myRating || null)}
                          >
                            {myRating ? "✏️ Edit My Review" : "⭐ Rate Contractor"}
                          </button>
                        </>
                      )}
                    </div>

                    {/* ── Show user's existing rating on the card ── */}
                    {myRating && (
                      <div style={{
                        marginTop:12, padding:"12px 14px",
                        background:"rgba(251,191,36,0.08)",
                        border:"1.5px solid rgba(251,191,36,0.2)",
                        borderRadius:12,
                      }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                          <span style={{ fontSize:12, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                            Your Review
                          </span>
                          {/* ✅ FIXED: removed duplicate border key */}
                          <button
                            onClick={() => openRatingForm(contractor._id, contractor.name, myRating)}
                            style={{
                              background:"transparent",
                              border:"1px solid rgba(167,139,250,0.3)",
                              cursor:"pointer",
                              fontSize:11,
                              fontWeight:800,
                              color:"#a78bfa",
                              padding:"2px 8px",
                              borderRadius:6,
                            }}
                          >✏️ Edit</button>
                        </div>
                        <div style={{ fontSize:15, marginBottom:4 }}>
                          {"⭐".repeat(myRating.stars)}
                          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginLeft:6 }}>{myRating.stars}/5</span>
                        </div>
                        <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:600, margin:0, fontStyle:"italic" }}>
                          "{myRating.description}"
                        </p>
                      </div>
                    )}

                    {/* ── Booking Form ── */}
                    {selectedContractor === contractor._id && (
                      <div className="booking-form">
                        <h4>📅 Book {contractor.name}</h4>
                        <div className="booking-field">
                          <label>Select Date</label>
                          <input type="date" className="booking-input" value={bookingDate}
                            onChange={e => setBookingDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div className="booking-field">
                          <label>Select Machine</label>
                          <select className="booking-select" value={selectedMachine} onChange={e => setSelectedMachine(e.target.value)}>
                            <option value="">-- Choose a machine --</option>
                            {contractor.machines?.map((m, idx) => (
                              <option key={idx} value={m.type}>
                                {m.type} - ₹{m.pricePerHour}/hr{m.workerAvailable ? " (with worker)" : " (without worker)"}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="booking-field">
                          <label>Duration (hours)</label>
                          <input type="number" className="booking-input" placeholder="Enter duration"
                            value={duration} onChange={e => setDuration(e.target.value)} min="1" />
                        </div>
                        <div className="booking-field">
                          <label>Cancellation Notice (hours)</label>
                          <input type="number" className="booking-input" placeholder="Hours before cancellation"
                            value={cancellationHours} onChange={e => setCancellationHours(e.target.value)} min="1" />
                        </div>
                        <div className="form-actions">
                          <button className="btn-submit" onClick={() => handleBooking(contractor._id)}>✓ Confirm</button>
                          <button className="btn-cancel" onClick={() => setSelectedContractor(null)}>✕ Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════
          TAB: MY REVIEWS
      ════════════════════════════════════════ */}
      {activeTab === "myratings" && (
        <div>
          <div style={{ marginBottom:20 }}>
            <h3 style={{ fontSize:18, fontWeight:900, marginBottom:4 }}>⭐ My Reviews & Ratings</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", fontWeight:600 }}>
              All reviews you've submitted. Click Edit to update any of them.
            </p>
          </div>

          {userRatings.length === 0 ? (
            <div className="empty-state">
              <p>📭 You haven't submitted any reviews yet.</p>
              <p style={{ fontSize:13, opacity:0.6, marginTop:6 }}>
                Book a contractor and leave a review after your experience.
              </p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {userRatings.map((r, i) => (
                <div key={r._id || i} style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1.5px solid rgba(255,255,255,0.08)",
                  borderRadius:18, padding:"18px 20px",
                  display:"flex", flexDirection:"column", gap:10,
                }}>
                  {/* Header row */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{
                        width:44, height:44, borderRadius:12, flexShrink:0,
                        background:"linear-gradient(135deg,#06b6d4,#34d399)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:20, fontWeight:900,
                      }}>🔧</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:900, color:"#fff" }}>
                          {r.contractorName || r.contractor?.name || "Contractor"}
                        </div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>
                          📅 {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                        </div>
                      </div>
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={() => openRatingForm(r.contractorId, r.contractorName, r)}
                      style={{
                        padding:"7px 18px", borderRadius:50,
                        border:"1.5px solid rgba(167,139,250,0.35)",
                        background:"rgba(124,58,237,0.12)", color:"#a78bfa",
                        fontSize:12, fontWeight:800, cursor:"pointer",
                        transition:"all 0.2s",
                        display:"flex", alignItems:"center", gap:6,
                      }}
                    >✏️ Edit Review</button>
                  </div>

                  {/* Stars */}
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:18, letterSpacing:2 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= r.stars ? "#fbbf24" : "rgba(255,255,255,0.15)", fontSize:18 }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize:13, fontWeight:800, color:"rgba(255,255,255,0.5)" }}>
                      {r.stars} / 5
                    </span>
                  </div>

                  {/* Comment */}
                  <div style={{
                    background:"rgba(255,255,255,0.03)",
                    border:"1px solid rgba(255,255,255,0.06)",
                    borderRadius:12, padding:"12px 14px",
                  }}>
                    <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", fontWeight:600, margin:0, fontStyle:"italic", lineHeight:1.65 }}>
                      "{r.description || "No comment"}"
                    </p>
                  </div>

                  {/* Updated indicator */}
                  {r.updatedAt && r.updatedAt !== r.createdAt && (
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", fontWeight:600 }}>
                      ✏️ Last edited: {new Date(r.updatedAt).toLocaleDateString("en-IN")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          RATING MODAL
      ════════════════════════════════════════ */}
      {showRatingForm && (
        <div className="modal-overlay" onClick={() => setShowRatingForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth:440 }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h3 style={{ margin:0, fontSize:18, fontWeight:900 }}>
                {isEditingRating ? "✏️ Edit Your Review" : "⭐ Rate Contractor"}
              </h3>
              <button onClick={() => setShowRatingForm(false)} style={{
                background:"none", border:"none", fontSize:20,
                color:"rgba(255,255,255,0.4)", cursor:"pointer", lineHeight:1,
              }}>✕</button>
            </div>

            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", fontWeight:600, marginBottom:18 }}>
              🔧 {ratingContractorName}
            </p>

            <form onSubmit={handleRating}>

              {/* Star selector */}
              <div className="rating-stars-input" style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:10 }}>
                  Your Rating
                </label>
                <div style={{ display:"flex", gap:6 }}>
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      style={{
                        background:"transparent", border:"none", cursor:"pointer",
                        fontSize:30, padding:"2px 4px",
                        color: s <= stars ? "#fbbf24" : "rgba(255,255,255,0.15)",
                        transition:"all 0.15s",
                        transform: s <= stars ? "scale(1.1)" : "scale(1)",
                      }}
                    >★</button>
                  ))}
                  <span style={{ fontSize:13, fontWeight:800, color:"rgba(255,255,255,0.45)", alignSelf:"center", marginLeft:6 }}>
                    {stars} / 5
                  </span>
                </div>
              </div>

              {/* Review textarea */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>
                  Your Review
                </label>
                <textarea
                  className="rating-textarea"
                  placeholder="Share your experience with this contractor..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows="4"
                  required
                  style={{ resize:"vertical" }}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  {isEditingRating ? "💾 Update Review" : "⭐ Submit Review"}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowRatingForm(false)}>
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