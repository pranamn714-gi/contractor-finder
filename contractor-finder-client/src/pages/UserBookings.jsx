import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserBookings() {
  const navigate = useNavigate();
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
        <button onClick={() => navigate("/user/dashboard")} className="back-btn">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="user-bookings">
      <div className="bookings-header">
        <button 
          className="back-btn"
          onClick={() => navigate("/user/dashboard")}
          title="Go back to dashboard"
        >
          ← Back
        </button>
        <div className="header-content">
          <h2>📅 My Bookings</h2>
          <p className="header-subtitle">Track and manage your contractor bookings</p>
        </div>
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
          <a href="/user/dashboard" className="browse-btn">
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

      <style jsx>{`
        .user-bookings {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
        }

        /* Header with Back Button */
        .bookings-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid rgba(0, 255, 200, 0.3);
        }

        .back-btn {
          background: rgba(0, 255, 200, 0.1);
          border: 1px solid rgba(0, 255, 200, 0.5);
          color: #00ffc8;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn:hover {
          background: rgba(0, 255, 200, 0.2);
          border-color: #00ffc8;
          box-shadow: 0 0 10px rgba(0, 255, 200, 0.4);
        }

        .back-btn:active {
          transform: scale(0.98);
        }

        .header-content {
          flex: 1;
        }

        .bookings-header h2 {
          margin: 0 0 0.5rem 0;
          color: #00ffc8;
          font-size: 2rem;
        }

        .header-subtitle {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: rgba(20, 25, 40, 0.8);
          border: 1px solid rgba(0, 255, 200, 0.2);
          border-radius: 10px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .summary-card:hover {
          border-color: rgba(0, 255, 200, 0.5);
          box-shadow: 0 0 15px rgba(0, 255, 200, 0.1);
          transform: translateY(-4px);
        }

        .summary-icon {
          font-size: 2rem;
          min-width: 50px;
          text-align: center;
        }

        .summary-info h3 {
          margin: 0;
          color: #00ffc8;
          font-size: 1.5rem;
        }

        .summary-info p {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
        }

        .summary-card.summary-pending {
          border-left: 4px solid #ffaa00;
        }

        .summary-card.summary-approved {
          border-left: 4px solid #00ff00;
        }

        .summary-card.summary-rejected {
          border-left: 4px solid #ff0055;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(20, 25, 40, 0.8);
          border: 2px dashed rgba(0, 255, 200, 0.3);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state svg {
          width: 60px;
          height: 60px;
          margin-bottom: 1rem;
          stroke: rgba(0, 255, 200, 0.5);
        }

        .empty-state h3 {
          color: #00ffc8;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          margin: 0 0 1.5rem 0;
        }

        .browse-btn {
          display: inline-block;
          background: rgba(0, 255, 200, 0.2);
          border: 1px solid rgba(0, 255, 200, 0.5);
          color: #00ffc8;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .browse-btn:hover {
          background: rgba(0, 255, 200, 0.3);
          box-shadow: 0 0 15px rgba(0, 255, 200, 0.3);
        }

        /* Bookings List */
        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .booking-card {
          background: rgba(20, 25, 40, 0.8);
          border: 2px solid rgba(0, 255, 200, 0.2);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          border-color: rgba(0, 255, 200, 0.4);
          box-shadow: 0 0 20px rgba(0, 255, 200, 0.15);
        }

        .booking-card.status-pending {
          border-left: 5px solid #ffaa00;
        }

        .booking-card.status-approved {
          border-left: 5px solid #00ff00;
        }

        .booking-card.status-rejected {
          border-left: 5px solid #ff0055;
        }

        .booking-card.status-cancelled {
          border-left: 5px solid #666;
        }

        /* Booking Header */
        .booking-card .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(0, 255, 200, 0.05);
          border-bottom: 1px solid rgba(0, 255, 200, 0.1);
          gap: 1rem;
        }

        .contractor-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .contractor-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(0, 255, 200, 0.3);
          background: rgba(0, 255, 200, 0.1);
        }

        .contractor-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0, 255, 200, 0.5);
        }

        .avatar-placeholder svg {
          width: 30px;
          height: 30px;
          stroke: currentColor;
          stroke-width: 2;
        }

        .contractor-details h3 {
          margin: 0;
          color: #00ffc8;
          font-size: 1.1rem;
        }

        .contractor-details p {
          margin: 0.25rem 0 0 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          white-space: nowrap;
          background: rgba(0, 255, 200, 0.15);
          color: #00ffc8;
        }

        .status-badge.status-pending {
          background: rgba(255, 170, 0, 0.15);
          color: #ffaa00;
        }

        .status-badge.status-approved {
          background: rgba(0, 255, 0, 0.15);
          color: #00ff00;
        }

        .status-badge.status-rejected {
          background: rgba(255, 0, 85, 0.15);
          color: #ff0055;
        }

        .status-badge.status-cancelled {
          background: rgba(100, 100, 100, 0.15);
          color: #aaa;
        }

        /* Booking Details */
        .booking-details {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          border-bottom: 1px solid rgba(0, 255, 200, 0.1);
        }

        .detail-item {
          display: flex;
          gap: 1rem;
        }

        .detail-icon {
          font-size: 1.5rem;
          min-width: 30px;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .detail-value {
          color: #00ffc8;
          font-weight: 500;
        }

        /* Booking Actions */
        .booking-actions {
          padding: 1.5rem;
          background: rgba(255, 170, 0, 0.05);
          border-top: 1px solid rgba(255, 170, 0, 0.2);
        }

        .cancel-booking-btn {
          background: linear-gradient(135deg, rgba(255, 0, 85, 0.3) 0%, rgba(200, 0, 50, 0.3) 100%);
          border: 1px solid #ff0055;
          color: #ff0055;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .cancel-booking-btn:hover {
          background: linear-gradient(135deg, rgba(255, 0, 85, 0.5) 0%, rgba(200, 0, 50, 0.5) 100%);
          box-shadow: 0 0 15px rgba(255, 0, 85, 0.3);
        }

        .cancel-info {
          margin: 1rem 0 0 0;
          color: rgba(255, 170, 0, 0.8);
          font-size: 0.9rem;
        }

        /* Booking Messages */
        .booking-message {
          padding: 1.5rem;
          border-top: 1px solid rgba(0, 255, 200, 0.1);
          font-weight: 600;
          border-radius: 0;
        }

        .success-message {
          background: rgba(0, 255, 0, 0.1);
          color: #00ff00;
          border-top: 2px solid #00ff00;
        }

        .error-message {
          background: rgba(255, 0, 85, 0.1);
          color: #ff0055;
          border-top: 2px solid #ff0055;
        }

        .cancelled-message {
          background: rgba(100, 100, 100, 0.1);
          color: #aaa;
          border-top: 2px solid #666;
        }

        /* Loading & Error States */
        .loading-state,
        .error-state {
          padding: 4rem 2rem;
          text-align: center;
          color: #00ffc8;
          background: rgba(20, 25, 40, 0.8);
          border: 1px solid rgba(0, 255, 200, 0.2);
          border-radius: 12px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(0, 255, 200, 0.2);
          border-top-color: #00ffc8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .user-bookings {
            padding: 1rem;
          }

          .bookings-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .back-btn {
            width: 100%;
          }

          .bookings-header h2 {
            font-size: 1.5rem;
          }

          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .booking-card .booking-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .status-badge {
            width: 100%;
            text-align: center;
          }

          .booking-details {
            grid-template-columns: 1fr;
          }

          .booking-actions {
            flex-direction: column;
          }

          .cancel-booking-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}