import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      if (role === "user") {
        navigate("/user/dashboard");
      } else if (role === "contractor") {
        navigate("/contractor/dashboard");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue</p>

          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select 
              id="role"
              value={role} 
              onChange={e => setRole(e.target.value)}
              className="neon-select"
            >
              <option value="user">User</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="neon-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="neon-input"
            />
          </div>

          <button type="submit" className="neon-button">
            <span>Login</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;