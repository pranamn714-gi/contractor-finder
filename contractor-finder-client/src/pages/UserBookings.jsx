import { useEffect, useState } from "react";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch("http://localhost:5000/api/bookings/me", {
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

  async function handleCancelBooking(bookingId) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/bookings/cancel/${bookingId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel booking");

      alert("Booking cancelled successfully! ✅");
      fetchBookings(); // Refresh bookings list
    } catch (err) {
      alert(err.message);
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "cancelled":
        return "🚫";
      default:
        return "📋";
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
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

  return (
    <div className="user-bookings">
      <div className="bookings-header">
        <h2>📅 My Bookings</h2>
        <p className="header-subtitle">Track and manage your contractor bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any bookings. Start by browsing contractors!</p>
          <a href="/user-dashboard" className="browse-btn">
            Browse Contractors
          </a>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card summary-total">
              <div className="summary-icon">📊</div>
              <div className="summary-info">
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>
            </div>

            <div className="summary-card summary-pending">
              <div className="summary-icon">⏳</div>
              <div className="summary-info">
                <h3>{bookings.filter((b) => b.status === "pending").length}</h3>
                <p>Pending</p>
              </div>
            </div>

            <div className="summary-card summary-approved">
              <div className="summary-icon">✅</div>
              <div className="summary-info">
                <h3>{bookings.filter((b) => b.status === "approved").length}</h3>
                <p>Approved</p>
              </div>
            </div>

            <div className="summary-card summary-rejected">
              <div className="summary-icon">❌</div>
              <div className="summary-info">
                <h3>
                  {bookings.filter(
                    (b) => b.status === "rejected" || b.status === "cancelled"
                  ).length}
                </h3>
                <p>Rejected/Cancelled</p>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className={`booking-card ${getStatusBadgeClass(booking.status)}`}
              >
                {/* Booking Header */}
                <div className="booking-header">
                  <div className="contractor-info">
                    <div className="contractor-avatar">
                      {booking.contractor?.image ? (
                        <img
                          src={`http://localhost:5000${booking.contractor.image}`}
                          alt={booking.contractor.name}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="contractor-details">
                      <h3>{booking.contractor?.name || "Unknown Contractor"}</h3>
                      <p>📍 {booking.contractor?.location || "Location not specified"}</p>
                    </div>
                  </div>

                  <div className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="booking-details">
                  <div className="detail-item">
                    <div className="detail-icon">📅</div>
                    <div className="detail-content">
                      <span className="detail-label">Booking Date</span>
                      <span className="detail-value">
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">🚜</div>
                    <div className="detail-content">
                      <span className="detail-label">Machine Type</span>
                      <span className="detail-value">{booking.machineType}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">⏱️</div>
                    <div className="detail-content">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{booking.duration} hours</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">🔔</div>
                    <div className="detail-content">
                      <span className="detail-label">Cancellation Notice</span>
                      <span className="detail-value">
                        {booking.cancellationHours || 24} hours
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">📞</div>
                    <div className="detail-content">
                      <span className="detail-label">Contact</span>
                      <span className="detail-value">
                        {booking.contractor?.phoneNumber || booking.contractor?.email}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon">🕐</div>
                    <div className="detail-content">
                      <span className="detail-label">Booked On</span>
                      <span className="detail-value">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {booking.status === "pending" && (
                  <div className="booking-actions">
                    <button
                      className="cancel-booking-btn"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      🚫 Cancel Booking
                    </button>
                    <p className="cancel-info">
                      ⚠️ Cancellation must be {booking.cancellationHours || 24} hours
                      before booking date
                    </p>
                  </div>
                )}

                {booking.status === "approved" && (
                  <div className="booking-message success-message">
                    ✅ Your booking has been approved! The contractor will contact you soon.
                  </div>
                )}

                {booking.status === "rejected" && (
                  <div className="booking-message error-message">
                    ❌ This booking was rejected by the contractor.
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="booking-message cancelled-message">
                    🚫 You cancelled this booking.
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}