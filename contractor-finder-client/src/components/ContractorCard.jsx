import { useState, useEffect } from "react";

export default function ContractorCard({ contractor, onBook, onCancel, userBookings }) {
  const [date, setDate] = useState("");
  const [machineType, setMachineType] = useState("");
  const [duration, setDuration] = useState("10");
  const [withWorker, setWithWorker] = useState(null);
  const [ratings, setRatings] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  const bookingsForThisContractor =
    userBookings?.filter(
      b => b.contractor === contractor._id || b.contractor?._id === contractor._id
    ) || [];

  useEffect(() => {
    async function fetchRatings() {
      try {
        const res = await fetch(`http://localhost:5000/api/ratings/${contractor._id}`);
        if (res.ok) {
          setRatings(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch ratings:", err);
      }
    }
    fetchRatings();
  }, [contractor._id]);

  const averageStars =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : null;

  const selectedMachine = contractor.machines?.find(m => m.type === machineType);

  return (
    <div className="contractor-card">
      {/* Header */}
      <div className="card-header">
        <div className="contractor-name-section">
          <h3 className="contractor-name">{contractor.name}</h3>
          {averageStars && (
            <div className="rating-display">
              ⭐ {averageStars}
              <span className="rating-count">({ratings.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="contact-section">
        <div className="info-row">
          <span className="info-icon">📧</span>
          <span className="info-label">Email:</span>
          <span className="info-value">{contractor.email || "N/A"}</span>
        </div>
        <div className="info-row">
          <span className="info-icon">📱</span>
          <span className="info-label">Phone:</span>
          <span className="info-value">{contractor.phoneNumber || "N/A"}</span>
        </div>
        <div className="info-row">
          <span className="info-icon">📍</span>
          <span className="info-label">Location:</span>
          <span className="info-value">{contractor.location || "N/A"}</span>
        </div>
      </div>

      {/* Skills */}
      {contractor.skills?.length > 0 && (
        <div className="skills-section">
          <h4 className="section-title">🛠️ Skills</h4>
          <div className="skills-list">
            {contractor.skills.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Machines */}
      {contractor.machines?.length > 0 && (
        <div className="machines-section">
          <h4 className="section-title">🚜 Available Machines</h4>
          <div className="machines-list">
            {contractor.machines.map((m, i) => (
              <div key={i} className="machine-item">
                <span className="machine-name">{m.type}</span>
                <span className="machine-price">₹{m.pricePerHour}/hr</span>
                {m.workerAvailable && <span className="worker-tag">👷 Worker Available</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="additional-info-section">
        {contractor.wages && (
          <div className="info-row">
            <span className="info-icon">💰</span>
            <span className="info-label">Wages:</span>
            <span className="info-value">₹{contractor.wages}/day</span>
          </div>
        )}
        {contractor.additionalInfo && (
          <div className="additional-info">
            <span className="info-icon">ℹ️Additional Info :</span>
            <p>{contractor.additionalInfo}</p>
          </div>
        )}
      </div>

      {/* Ratings */}
      {ratings.length > 0 && (
        <div className="ratings-section">
          <h4 className="section-title">⭐ Customer Reviews</h4>
          <div className="reviews-list">
            {ratings.slice(0, 3).map(r => (
              <div key={r._id} className="review-item">
                <div className="review-header">
                  <span className="review-author">{r.user?.name || "Anonymous"}</span>
                  <span className="review-stars">{"⭐".repeat(r.stars)}</span>
                </div>
                <p className="review-text">{r.description}</p>
              </div>
            ))}
            {ratings.length > 3 && (
              <p className="more-reviews">+ {ratings.length - 3} more reviews</p>
            )}
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="booking-section">
        <h4 className="section-title">📅 Book this Contractor</h4>
        <form
          onSubmit={e => {
            e.preventDefault();

            if (!date) {
              alert("Please select a date");
              return;
            }
            if (contractor.machines?.length > 0 && !machineType) {
              alert("Please select a machine type");
              return;
            }
            if (contractor.machines?.length === 0 && contractor.workerAvailable && withWorker === null) {
              alert("Please select worker option");
              return;
            }

            onBook(
              contractor._id,
              date,
              contractor.machines?.length > 0 ? machineType : null,
              duration,
              contractor.machines?.length === 0 && contractor.workerAvailable ? true : withWorker
            );
          }}
          className="booking-form"
        >
          <div className="form-row">
            <input
              type="date"
              className="booking-input"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              required
            />

            {contractor.machines?.length > 0 && (
              <select
                className="booking-select"
                value={machineType}
                onChange={e => {
                  setMachineType(e.target.value);
                  setWithWorker(null);
                }}
              >
                <option value="">Select machine</option>
                {contractor.machines.map((m, i) => (
                  <option key={i} value={m.type}>
                    {m.type} — ₹{m.pricePerHour}/hr
                  </option>
                ))}
              </select>
            )}

            {selectedMachine?.workerAvailable && (
              <select
                className="booking-select"
                value={withWorker === null ? "" : withWorker ? "true" : "false"}
                onChange={e => setWithWorker(e.target.value === "true")}
              >
                <option value="">Worker option</option>
                <option value="false">Without worker</option>
                <option value="true">With worker</option>
              </select>
            )}

            {contractor.machines?.length === 0 && contractor.workerAvailable && (
              <select
                className="booking-select"
                value={withWorker === null ? "" : withWorker ? "true" : "false"}
                onChange={e => setWithWorker(e.target.value === "true")}
              >
                <option value="">Select option</option>
                <option value="true">Book worker</option>
              </select>
            )}

            <select
              className="booking-select"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            >
              <option value="">Select Cancelation Hour</option>
              <option value="5">5 hours</option>
              <option value="10">10 hours</option>
              <option value="20">20 hours</option>
            </select>

            <button type="submit" className="book-button">
              📋 Request Booking
            </button>
          </div>
        </form>
      </div>

      {/* Existing Bookings */}
      {bookingsForThisContractor.length > 0 && (
        <div className="existing-bookings">
          <h4 className="section-title">📝 Your Booking Requests</h4>
          <div className="bookings-list">
            {bookingsForThisContractor.map(b => {
              const createdAt = new Date(b.createdAt);
              const now = new Date();
              const diffHours = (now - createdAt) / (1000 * 60 * 60);

              return (
                <div key={b._id} className={`booking-item status-${b.status}`}>
                  <div className="booking-details">
                    <div className="booking-info">
                      <span className="booking-label">Date:</span>
                      <span className="booking-value">
                        {b.date ? new Date(b.date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="booking-info">
                      <span className="booking-label">Machine:</span>
                      <span className="booking-value">{b.machineType || "N/A"}</span>
                    </div>
                    <div className="booking-info">
                      <span className="booking-label">Duration:</span>
                      <span className="booking-value">{b.duration || "N/A"} hours</span>
                    </div>
                    {b.withWorker !== null && (
                      <div className="booking-info">
                        <span className="booking-label">Worker:</span>
                        <span className="booking-value">
                          {b.withWorker ? "With worker" : "Without worker"}
                        </span>
                      </div>
                    )}
                    <div className="booking-status">
                      <span className={`status-badge status-${b.status}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {b.status === "pending" && (
                    <div className="booking-actions">
                      {diffHours <= 1 ? (
                        <button 
                          onClick={() => onCancel(b._id)} 
                          className="cancel-button"
                        >
                          ✕ Cancel Booking
                        </button>
                      ) : (
                        <p className="expired-notice">⏰ Cancellation window expired</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}