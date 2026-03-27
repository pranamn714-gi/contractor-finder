export default function RatingDisplay({ ratings }) {
  if (!ratings || ratings.length === 0) return <p><strong>Ratings:</strong> No ratings yet.</p>;

  return (
    <div style={{ marginTop: 8 }}>
      <strong>Ratings:</strong>
      {ratings.map((r, i) => (
        <div key={i} style={{ marginTop: 6, padding: 6, border: "1px dashed #ddd" }}>
          <p>⭐ {r.stars} / 5</p>
          <p>{r.description}</p>
          <p><em>By: {r.userName}</em></p>
        </div>
      ))}
    </div>
  );
}