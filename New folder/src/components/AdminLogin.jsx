// src/components/AdminLogin.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // ── Save to localStorage exactly matching your RequireAuth ──
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "admin");
      localStorage.setItem("adminUser", JSON.stringify(res.data.admin));

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .al-root * { box-sizing: border-box; }
        @keyframes al-fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes al-blob { 0%,100%{border-radius:62% 38% 46% 54%/60% 44% 56% 40%} 50%{border-radius:40% 60% 55% 45%/50% 55% 45% 55%} }
        .al-input-field {
          width:100%; padding:13px 18px; border-radius:12px;
          border:1.5px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.07); color:#fff;
          font-family:'Nunito',sans-serif; font-size:15px; font-weight:600;
          outline:none; transition:all 0.2s;
        }
        .al-input-field:focus { border-color:rgba(124,58,237,0.7); background:rgba(255,255,255,0.11); box-shadow:0 0 0 3px rgba(124,58,237,0.15); }
        .al-input-field::placeholder { color:rgba(255,255,255,0.28); }
        .al-submit-btn { transition:all 0.3s; }
        .al-submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 36px rgba(124,58,237,0.6) !important; }
        .al-submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .al-eye-btn:hover { color:rgba(255,255,255,0.75) !important; }
      `}</style>

      <div className="al-root" style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#0f0c29 0%,#1e1b4b 50%,#0f0c29 100%)",
        fontFamily: "'Nunito',sans-serif",
        padding: 20, position: "relative", overflow: "hidden",
      }}>

        {/* Background blobs */}
        <div style={{
          position:"absolute", top:-180, right:-160, width:500, height:500,
          background:"radial-gradient(circle,rgba(124,58,237,0.28),transparent 70%)",
          borderRadius:"62% 38% 46% 54%/60% 44% 56% 40%",
          animation:"al-blob 10s ease-in-out infinite", pointerEvents:"none",
        }}/>
        <div style={{
          position:"absolute", bottom:-140, left:-120, width:420, height:420,
          background:"radial-gradient(circle,rgba(56,189,248,0.16),transparent 70%)",
          borderRadius:"40% 60% 55% 45%/50% 55% 45% 55%",
          animation:"al-blob 14s ease-in-out 2s infinite reverse", pointerEvents:"none",
        }}/>

        {/* Card */}
        <div style={{
          position:"relative", zIndex:10,
          background:"rgba(255,255,255,0.05)",
          backdropFilter:"blur(28px)",
          border:"1.5px solid rgba(255,255,255,0.1)",
          borderRadius:28, padding:"48px 44px",
          width:"100%", maxWidth:420,
          boxShadow:"0 32px 80px rgba(0,0,0,0.55)",
          animation:"al-fadeUp 0.7s ease both",
        }}>

          {/* Shield icon */}
          <div style={{
            width:68, height:68, borderRadius:20,
            background:"linear-gradient(135deg,#7c3aed,#5c67f2)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, margin:"0 auto 22px",
            boxShadow:"0 10px 32px rgba(124,58,237,0.5)",
          }}>🛡️</div>

          <h2 style={{ textAlign:"center", fontSize:26, fontWeight:900, color:"#fff", margin:"0 0 6px" }}>
            Admin Login
          </h2>
          <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.38)", fontWeight:600, margin:"0 0 34px" }}>
            Contractor Finder — Admin Portal
          </p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Email */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>
                Email Address
              </label>
              <input
                type="email"
                className="al-input-field"
                placeholder="admin@yourapp.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>
                Password
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  className="al-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight:46 }}
                  required
                />
                <button
                  type="button"
                  className="al-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                    background:"transparent", border:"none", fontSize:17, cursor:"pointer",
                    color:"rgba(255,255,255,0.35)", transition:"color 0.2s",
                  }}
                >{showPass ? "🙈" : "👁️"}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:"rgba(239,68,68,0.14)", border:"1.5px solid rgba(239,68,68,0.3)",
                color:"#fca5a5", padding:"11px 16px", borderRadius:12,
                fontSize:13, fontWeight:700, textAlign:"center",
              }}>⚠️ {error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="al-submit-btn"
              disabled={loading}
              style={{
                padding:"15px", borderRadius:14, border:"none",
                background:"linear-gradient(135deg,#7c3aed,#5c67f2)",
                color:"#fff", fontSize:16, fontWeight:900,
                boxShadow:"0 10px 30px rgba(124,58,237,0.45)",
                marginTop:4, cursor:"pointer",
              }}
            >
              {loading ? "⏳ Signing in..." : "🛡️ Sign In as Admin"}
            </button>
          </form>

          {/* Note */}
          <div style={{
            marginTop:26, textAlign:"center",
            background:"rgba(124,58,237,0.1)", border:"1.5px solid rgba(124,58,237,0.2)",
            borderRadius:50, padding:"9px 16px",
            color:"rgba(255,255,255,0.38)", fontSize:12, fontWeight:800,
          }}>
            🔒 Restricted to administrators only
          </div>
        </div>
      </div>
    </>
  );
}