import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContractorReviewsPage() {
  const navigate = useNavigate();
  const [contractor, setContractor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest, lowest
  const [filterStars, setFilterStars] = useState(null); // null means show all

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch("http://localhost:5000/api/contractors/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch contractor data");
        const data = await res.json();
        setContractor(data);
        setRatings(data.ratings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Sort and filter ratings
  const processedRatings = [...ratings]
    .filter((r) => (filterStars ? r.stars === filterStars : true))
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return b.stars - a.stars;
        case "lowest":
          return a.stars - b.stars;
        default:
          return 0;
      }
    });

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
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

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : 0;

  const ratingDistribution = {
    5: ratings.filter((r) => r.stars === 5).length,
    4: ratings.filter((r) => r.stars === 4).length,
    3: ratings.filter((r) => r.stars === 3).length,
    2: ratings.filter((r) => r.stars === 2).length,
    1: ratings.filter((r) => r.stars === 1).length,
  };

  const getStarPercentage = (count) => {
    return ratings.length > 0 ? ((count / ratings.length) * 100).toFixed(0) : 0;
  };

  return (
    <div className="reviews-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>⭐ Customer Reviews & Ratings</h1>
      </div>

      <div className="reviews-container">
        {/* Summary Section */}
        {ratings.length > 0 ? (
          <div className="summary-section">
            <div className="overall-rating">
              <div className="rating-number">{avgRating}</div>
              <div className="rating-info">
                <div className="stars-display">
                  {"⭐".repeat(Math.round(avgRating))}
                </div>
                <p className="rating-count">Based on {ratings.length} reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="rating-distribution">
              <h3>Rating Breakdown</h3>
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="distribution-row">
                  <button
                    className={`filter-btn ${filterStars === stars ? "active" : ""}`}
                    onClick={() =>
                      setFilterStars(filterStars === stars ? null : stars)
                    }
                  >
                    {stars} <span>⭐</span>
                  </button>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${getStarPercentage(ratingDistribution[stars])}%`,
                      }}
                    ></div>
                  </div>
                  <span className="count">{ratingDistribution[stars]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>📊 No reviews yet. Keep up the great work!</p>
          </div>
        )}

        {/* Controls Section */}
        {ratings.length > 0 && (
          <div className="controls-section">
            <div className="sort-control">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
            {filterStars && (
              <button
                className="clear-filter-btn"
                onClick={() => setFilterStars(null)}
              >
                ✕ Clear Filter
              </button>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {processedRatings.length > 0 ? (
            processedRatings.map((review, idx) => (
              <div key={idx} className={`review-card stars-${review.stars}`}>
                <div className="review-header">
                  <div className="reviewer-info">
                    <h4 className="reviewer-name">
                      {review.userName || "Anonymous"}
                    </h4>
                    <p className="review-date">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : "Date unknown"}
                    </p>
                  </div>
                  <div className={`stars-badge stars-${review.stars}`}>
                    {"⭐".repeat(review.stars)}
                    <span className="star-rating">{review.stars} / 5</span>
                  </div>
                </div>

                {review.description && (
                  <div className="review-content">
                    <p className="review-text">{review.description}</p>
                  </div>
                )}

                <div className="review-metadata">
                  <span className="metadata-item">
                    {review.bookingId ? "✓ Verified Purchase" : "Review"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <p>
                {filterStars
                  ? `No reviews with ${filterStars} stars`
                  : "No reviews available"}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .reviews-page {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 2rem;
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
        }

        .back-btn:hover {
          background: rgba(0, 255, 200, 0.2);
          border-color: #00ffc8;
          box-shadow: 0 0 10px rgba(0, 255, 200, 0.4);
        }

        .page-header h1 {
          color: #00ffc8;
          margin: 0;
          font-size: 2rem;
        }

        .reviews-container {
          background: rgba(20, 25, 40, 0.8);
          border: 1px solid rgba(0, 255, 200, 0.2);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .summary-section {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0, 255, 200, 0.2);
        }

        .overall-rating {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: rgba(0, 255, 200, 0.05);
          border: 1px solid rgba(0, 255, 200, 0.15);
          border-radius: 12px;
          padding: 2rem;
        }

        .rating-number {
          font-size: 4rem;
          font-weight: 900;
          color: #00ffc8;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .rating-info {
          text-align: center;
        }

        .stars-display {
          font-size: 1.5rem;
          letter-spacing: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .rating-count {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          font-size: 0.95rem;
        }

        .rating-distribution {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rating-distribution h3 {
          color: #00ffc8;
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .distribution-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .filter-btn {
          background: rgba(0, 255, 200, 0.1);
          border: 1px solid rgba(0, 255, 200, 0.3);
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          min-width: 80px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .filter-btn:hover {
          border-color: rgba(0, 255, 200, 0.6);
          color: #00ffc8;
        }

        .filter-btn.active {
          background: rgba(0, 255, 200, 0.25);
          border-color: #00ffc8;
          color: #00ffc8;
          box-shadow: 0 0 10px rgba(0, 255, 200, 0.3);
        }

        .filter-btn span {
          margin-left: 0.25rem;
        }

        .bar-container {
          flex: 1;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(0, 255, 200, 0.1);
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(0, 255, 200, 0.4) 0%, rgba(0, 255, 200, 0.8) 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .count {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          min-width: 40px;
          text-align: right;
        }

        .controls-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(0, 255, 200, 0.05);
          border-radius: 8px;
          gap: 1rem;
        }

        .sort-control {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sort-control label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
        }

        .sort-select {
          background: rgba(30, 40, 60, 0.8);
          border: 1px solid rgba(0, 255, 200, 0.3);
          color: #00ffc8;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sort-select:hover {
          border-color: #00ffc8;
        }

        .sort-select:focus {
          outline: none;
          border-color: #00ffc8;
          box-shadow: 0 0 10px rgba(0, 255, 200, 0.2);
        }

        .clear-filter-btn {
          background: rgba(255, 100, 100, 0.15);
          border: 1px solid rgba(255, 100, 100, 0.5);
          color: #ff6464;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .clear-filter-btn:hover {
          background: rgba(255, 100, 100, 0.25);
          border-color: #ff6464;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-card {
          background: rgba(30, 40, 60, 0.6);
          border: 1px solid rgba(0, 255, 200, 0.15);
          border-radius: 10px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .review-card:hover {
          border-color: rgba(0, 255, 200, 0.4);
          box-shadow: 0 0 20px rgba(0, 255, 200, 0.1);
        }

        .review-card.stars-5 {
          border-left: 4px solid rgba(0, 255, 0, 0.5);
        }

        .review-card.stars-4 {
          border-left: 4px solid rgba(100, 255, 0, 0.5);
        }

        .review-card.stars-3 {
          border-left: 4px solid rgba(200, 150, 0, 0.5);
        }

        .review-card.stars-2 {
          border-left: 4px solid rgba(255, 150, 0, 0.5);
        }

        .review-card.stars-1 {
          border-left: 4px solid rgba(255, 0, 0, 0.5);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .reviewer-info {
          flex: 1;
        }

        .reviewer-name {
          color: #00ffc8;
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .review-date {
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          font-size: 0.85rem;
        }

        .stars-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background: rgba(0, 255, 200, 0.08);
          padding: 0.75rem 1rem;
          border-radius: 8px;
        }

        .star-rating {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
        }

        .review-content {
          margin-bottom: 1rem;
        }

        .review-text {
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          margin: 0;
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          border-left: 3px solid rgba(0, 255, 200, 0.4);
        }

        .review-metadata {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 255, 200, 0.1);
        }

        .metadata-item {
          color: rgba(0, 255, 0, 0.7);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .empty-state,
        .no-reviews {
          text-align: center;
          padding: 3rem 2rem;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(0, 255, 200, 0.05);
          border-radius: 10px;
          border: 1px dashed rgba(0, 255, 200, 0.2);
        }

        .empty-state p,
        .no-reviews p {
          margin: 0;
          font-size: 1.1rem;
        }

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
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .reviews-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .summary-section {
            grid-template-columns: 1fr;
          }

          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }

          .sort-control {
            flex-direction: column;
            align-items: stretch;
          }

          .sort-select {
            width: 100%;
          }

          .review-header {
            flex-direction: column;
          }

          .stars-badge {
            align-self: flex-start;
          }

          .rating-number {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
}