import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;

      if (role === "admin") {
        res = await axios.post("http://localhost:5000/api/admin/login", {
          email: email.trim().toLowerCase(),
          password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", "admin");
        localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
        navigate("/admin/dashboard");
      } else {
        res = await axios.post("http://localhost:5000/api/auth/login", {
          email: email.trim().toLowerCase(),
          password,
          role,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", role);
        if (role === "user") navigate("/user/dashboard");
        else if (role === "contractor") navigate("/contractor/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = {
    user:       { label: "User",       icon: "👤", color: "#3b82f6" },
    contractor: { label: "Contractor", icon: "🔧", color: "#10b981" },
    admin:      { label: "Admin",      icon: "🛡️", color: "#7c3aed" },
  };

  const active = roleConfig[role];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob { 0%,100%{border-radius:62% 38% 46% 54%/60% 44% 56% 40%} 50%{border-radius:40% 60% 55% 45%/50% 55% 45% 55%} }
        .login-input {
          width:100%; padding:13px 18px; border-radius:12px;
          border:1.5px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.07); color:#fff;
          font-family:'Nunito',sans-serif; font-size:15px; font-weight:600;
          outline:none; transition:all 0.2s;
        }
        .login-input:focus { background:rgba(255,255,255,0.11); box-shadow:0 0 0 3px rgba(255,255,255,0.08); }
        .login-input::placeholder { color:rgba(255,255,255,0.28); }
        .role-btn {
          flex:1; padding:12px 8px; border-radius:12px; border:2px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5);
          font-family:'Nunito',sans-serif; font-size:13px; font-weight:800;
          cursor:pointer; transition:all 0.25s; display:flex; flex-direction:column;
          align-items:center; gap:5px;
        }
        .role-btn:hover { background:rgba(255,255,255,0.09); color:#fff; }
        .submit-btn { transition:all 0.3s; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .eye-btn:hover { color:rgba(255,255,255,0.75) !important; }
      `}</style>

      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,#0f0c29 0%,#1e1b4b 50%,#0f0c29 100%)",
        fontFamily:"'Nunito',sans-serif", padding:20,
        position:"relative", overflow:"hidden",
      }}>

        {/* Background blobs */}
        <div style={{
          position:"absolute", top:-180, right:-160, width:500, height:500,
          background:`radial-gradient(circle,${active.color}44,transparent 70%)`,
          borderRadius:"62% 38% 46% 54%/60% 44% 56% 40%",
          animation:"blob 10s ease-in-out infinite", pointerEvents:"none", transition:"background 0.4s",
        }}/>
        <div style={{
          position:"absolute", bottom:-140, left:-120, width:420, height:420,
          background:`radial-gradient(circle,${active.color}28,transparent 70%)`,
          borderRadius:"40% 60% 55% 45%/50% 55% 45% 55%",
          animation:"blob 14s ease-in-out 2s infinite reverse", pointerEvents:"none", transition:"background 0.4s",
        }}/>

        {/* Card */}
        <div style={{
          position:"relative", zIndex:10,
          background:"rgba(255,255,255,0.05)", backdropFilter:"blur(28px)",
          border:"1.5px solid rgba(255,255,255,0.1)", borderRadius:28,
          padding:"48px 44px", width:"100%", maxWidth:420,
          boxShadow:"0 32px 80px rgba(0,0,0,0.55)",
          animation:"fadeUp 0.7s ease both",
        }}>

          {/* Icon */}
          <div style={{
            width:68, height:68, borderRadius:20, margin:"0 auto 22px",
            background:`linear-gradient(135deg,${active.color},${active.color}99)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, boxShadow:`0 10px 32px ${active.color}66`,
            transition:"all 0.3s",
          }}>
            {active.icon}
          </div>

          <h2 style={{ textAlign:"center", fontSize:26, fontWeight:900, color:"#fff", marginBottom:6 }}>
            Welcome Back
          </h2>
          <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.38)", fontWeight:600, marginBottom:30 }}>
            Sign in as {active.label}
          </p>

          {/* Role Selector */}
          <div style={{ display:"flex", gap:10, marginBottom:28 }}>
            {Object.entries(roleConfig).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                className="role-btn"
                onClick={() => { setRole(key); setError(""); }}
                style={role === key ? {
                  border:`2px solid ${cfg.color}`,
                  background:`${cfg.color}22`,
                  color:"#fff",
                  boxShadow:`0 0 16px ${cfg.color}44`,
                } : {}}
              >
                <span style={{ fontSize:20 }}>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Email */}
            <div>
              <label style={{
                display:"block", fontSize:11, fontWeight:800,
                color:"rgba(255,255,255,0.5)", textTransform:"uppercase",
                letterSpacing:"0.8px", marginBottom:8,
              }}>Email Address</label>
              <input
                type="email"
                className="login-input"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{ borderColor: role ? `${active.color}44` : "" }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display:"block", fontSize:11, fontWeight:800,
                color:"rgba(255,255,255,0.5)", textTransform:"uppercase",
                letterSpacing:"0.8px", marginBottom:8,
              }}>Password</label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight:46, borderColor: role ? `${active.color}44` : "" }}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                    background:"transparent", border:"none", fontSize:17,
                    cursor:"pointer", color:"rgba(255,255,255,0.35)", transition:"color 0.2s",
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
              className="submit-btn"
              disabled={loading}
              style={{
                padding:"15px", borderRadius:14, border:"none",
                background:`linear-gradient(135deg,${active.color},${active.color}bb)`,
                color:"#fff", fontSize:16, fontWeight:900, marginTop:4,
                boxShadow:`0 10px 30px ${active.color}55`,
                cursor:"pointer", transition:"all 0.3s",
              }}
            >
              {loading ? "⏳ Signing in..." : `${active.icon} Sign In as ${active.label}`}
            </button>
          </form>

          {/* Footer note */}
          <div style={{
            marginTop:26, textAlign:"center",
            background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.08)",
            borderRadius:50, padding:"9px 16px",
            color:"rgba(255,255,255,0.3)", fontSize:12, fontWeight:800,
          }}>
            🔒 Secure Login — {active.label} Portal
          </div>

        </div>
      </div>
    </>
  );
}