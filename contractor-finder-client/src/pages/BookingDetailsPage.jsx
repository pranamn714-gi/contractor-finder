import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContractorBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch("http://localhost:5000/api/bookings/contractor/me", {
          headers: { Authorization: `Bearer ${token}` },
            
        });

        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();

        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "pending":
        return "status-pending";
      
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "📋";
    }
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-state">
        <p>⚠️ Error: {error}</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Go Back
        </button>
      </div>
    );

  return (
    <div className="contractor-bookings-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>📅 Your Booking Requests</h1>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3>Filter by Status:</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Bookings
          </button>
          <button
            className={`filter-btn pending ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            ⏳ Pending
          </button>
          <button
            className={`filter-btn approved ${filterStatus === "approved" ? "active" : ""}`}
            onClick={() => setFilterStatus("approved")}
          >
            ✅ Approved
          </button>
          
          <button
            className={`filter-btn rejected ${filterStatus === "rejected" ? "active" : ""}`}
            onClick={() => setFilterStatus("rejected")}
          >
            ❌ Rejected
          </button>
        </div>
      </div>

      {/* Bookings Container */}
      <div className="bookings-container">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <p className="no-bookings-icon">📭</p>
            <h3>No bookings found</h3>
            <p className="no-bookings-message">
              {filterStatus === "all"
                ? "You don't have any bookings yet."
                : `You don't have any ${filterStatus} bookings.`}
            </p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`booking-card ${getStatusColor(booking.status)}`}
              >
                {/* Status Badge */}
                <div className={`status-badge ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                </div>

                {/* Booking Header */}
                <div className="booking-header">
                  <div className="booking-id">
                    <span className="label">Booking ID:</span>
                    <span className="value code">{booking._id}</span>
                  </div>
                </div>

                {/* User Information */}
                <div className="booking-section">
                  <h4 className="section-title">👤 User Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{booking.user?.name || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <a href={`mailto:${booking.user?.email}`} className="info-value link">
                        {booking.user?.email || "N/A"}
                      </a>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <a href={`tel:${booking.user?.phoneNumber}`} className="info-value link">
                        {booking.user?.phoneNumber || "N/A"}
                      </a>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Location:</span>
                      <span className="info-value">{booking.user?.location || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="booking-section">
                  <h4 className="section-title">📋 Booking Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Booking Date:</span>
                      <span className="info-value">
                        {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Machine Type:</span>
                      <span className="info-value">{booking.machineType || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duration:</span>
                      <span className="info-value">
                        {booking.duration ? `${booking.duration} hours` : "N/A"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total Price:</span>
                      <span className="info-value price">₹{booking.totalPrice || "0"}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="booking-section">
                    <h4 className="section-title">📝 Special Requests</h4>
                    <p className="requests-text">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Booking Timeline */}
                <div className="booking-section">
                  <h4 className="section-title">⏰ Timeline</h4>
                  <div className="timeline-grid">
                    <div className="timeline-item">
                      <span className="timeline-label">Created:</span>
                      <span className="timeline-value">
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    {booking.updatedAt && (
                      <div className="timeline-item">
                        <span className="timeline-label">Updated:</span>
                        <span className="timeline-value">
                          {new Date(booking.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/contractor/bookings/${booking._id}`)}
                >
                  👁️ View Full Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}