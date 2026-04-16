import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  const isLoggedIn = !!token;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("adminUser");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="logo">Contractor Finder</span>
        </Link>

        <div className="navbar-links">

          {/* ── NOT logged in → show Login + Signup ── */}
          {!isLoggedIn && (
            <>
              <Link to="/login"  className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Signup</Link>
            </>
          )}

          {/* ── Logged in → show dashboard link based on role ── */}
          {isLoggedIn && role === "user" && (
            <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
          )}
          {isLoggedIn && role === "contractor" && (
            <Link to="/contractor/dashboard" className="nav-link">Dashboard</Link>
          )}
          {isLoggedIn && role === "admin" && (
            <Link to="/admin/dashboard" className="nav-link">Admin Panel</Link>
          )}

          {/* ── Logged in → show Logout button only ── */}
          {isLoggedIn && (
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}