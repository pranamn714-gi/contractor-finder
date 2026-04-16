import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContractorBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

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

  // Handle approve/reject booking
  async function handleBookingAction(bookingId, action) {
    try {
      setActionLoading(bookingId);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/bookings/update-status/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: action }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update booking");

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId ? { ...booking, status: action } : booking
        )
      );

      alert(`✅ Booking ${action}!`);
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

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

                {/* Condensed Content - Show Only Essential Info */}
                <div className="booking-card-content">
                  
                  {/* User Info - Minimal */}
                  <div className="card-section">
                    <h4 className="section-title">👤 User</h4>
                    <div className="minimal-info">
                      <div className="info-row">
                        <span className="label">Name:</span>
                        <span className="value">{booking.user?.name || "N/A"}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Email:</span>
                        <a href={`mailto:${booking.user?.email}`} className="value email-link">
                          {booking.user?.email || "N/A"}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details - Minimal */}
                  <div className="card-section">
                    <h4 className="section-title">📋 Booking Details</h4>
                    <div className="minimal-info">
                      <div className="info-row">
                        <span className="label">Machine:</span>
                        <span className="value">{booking.machineType || "N/A"}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Date:</span>
                        <span className="value">
                          {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Duration:</span>
                        <span className="value">
                          {booking.duration ? `${booking.duration}h` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline - Minimal */}
                  <div className="card-section">
                    <h4 className="section-title">⏰ Timestamp</h4>
                    <div className="minimal-info">
                      <div className="info-row">
                        <span className="label">Requested:</span>
                        <span className="value small-text">
                          {booking.createdAt
                            ? new Date(booking.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="booking-id-mini">
                    <span className="label">ID:</span>
                    <span className="value code" title={booking._id}>
                      {booking._id.substring(0, 12)}...
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-actions">
                  {booking.status === "pending" && (
                    <>
                      <button
                        className="action-btn accept-btn"
                        onClick={() => handleBookingAction(booking._id, "approved")}
                        disabled={actionLoading === booking._id}
                      >
                        {actionLoading === booking._id ? "⏳" : "✅"} Accept
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleBookingAction(booking._id, "rejected")}
                        disabled={actionLoading === booking._id}
                      >
                        {actionLoading === booking._id ? "⏳" : "❌"} Reject
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn details-btn"
                    onClick={() => navigate(`/contractor/bookings/${booking._id}`)}
                  >
                    👁️ View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}