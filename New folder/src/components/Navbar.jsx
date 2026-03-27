import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="logo">
          Contractor Finder</span>
        </div>
        
        <div className="navbar-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link">Signup</Link>
          {role === "user" && <Link to="/user/dashboard" className="nav-link">User Dashboard</Link>}
          {role === "contractor" && <Link to="/contractor/dashboard" className="nav-link">Contractor Dashboard</Link>}
        </div>

        <button onClick={logout} className="logout-btn">
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}