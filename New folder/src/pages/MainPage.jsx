import { Link } from "react-router-dom";

export default function MainPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Contractor Finder</h1>
      <p>Choose an option below:</p>
      <Link to="/login">
        <button>Login</button>
      </Link>
      <Link to="/signup" style={{ marginLeft: "10px" }}>
        <button>Signup</button>
      </Link>
    </div>
  );
}