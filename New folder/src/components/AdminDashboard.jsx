// src/components/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PendingList from "./PendingList";
import ApprovedList from "./ApprovedList";

export default function AdminDashboard() {
  const [view, setView]   = useState("pending");
  const [stats, setStats] = useState(null);
  const navigate          = useNavigate();
  const token             = localStorage.getItem("token");
  const adminUser         = JSON.parse(localStorage.getItem("adminUser") || "{}");

  // Fetch stats on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .ad-root * { box-sizing:border-box; }
        @keyframes ad-fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ad-nav-btn:hover { background:rgba(255,255,255,0.07) !important; color:rgba(255,255,255,0.85) !important; }
        .ad-nav-btn.active { background:linear-gradient(135deg,rgba(124,58,237,0.28),rgba(92,103,242,0.2)) !important; color:#c4b5fd !important; border-color:rgba(124,58,237,0.35) !important; }
        .ad-stat-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.16) !important; }
        .ad-logout-btn:hover { background:rgba(239,68,68,0.15) !important; border-color:rgba(239,68,68,0.4) !important; color:#f87171 !important; }
        .ad-tab-pill:hover { background:rgba(255,255,255,0.06) !important; }
      `}</style>

      <div className="ad-root" style={{
        display:"flex", minHeight:"100vh",
        background:"#0d0b1e", fontFamily:"'Nunito',sans-serif", color:"#fff",
      }}>

        {/* ══ SIDEBAR ══ */}
        <aside style={{
          width:250, flexShrink:0,
          background:"rgba(255,255,255,0.04)",
          borderRight:"1px solid rgba(255,255,255,0.07)",
          display:"flex", flexDirection:"column",
          padding:"22px 14px",
          position:"sticky", top:0, height:"100vh", overflowY:"auto",
        }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px 26px", borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:20 }}>
            <div style={{
              width:42, height:42, borderRadius:12, flexShrink:0,
              background:"linear-gradient(135deg,#7c3aed,#5c67f2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, boxShadow:"0 6px 18px rgba(124,58,237,0.4)",
            }}>🛡️</div>
            <div>
              <div style={{ fontSize:15, fontWeight:900, color:"#fff" }}>Admin Panel</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.33)", fontWeight:600 }}>Contractor Finder</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
            {[
              { id:"dashboard", icon:"📊", label:"Dashboard"        },
              { id:"pending",   icon:"⏳", label:"Pending Requests" },
              { id:"approved",  icon:"✅", label:"Approved"         },
            ].map(item => (
              <button
                key={item.id}
                className={`ad-nav-btn${view===item.id?" active":""}`}
                onClick={() => setView(item.id)}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"11px 13px", borderRadius:12,
                  border:"1px solid transparent",
                  background:"transparent", cursor:"pointer",
                  fontSize:14, fontWeight:700,
                  color:"rgba(255,255,255,0.42)",
                  transition:"all 0.2s", textAlign:"left",
                }}
              >
                <span style={{ fontSize:18, width:24, textAlign:"center" }}>{item.icon}</span>
                {item.label}
                {/* Pending badge */}
                {item.id==="pending" && stats?.totalPending > 0 && (
                  <span style={{
                    marginLeft:"auto", background:"#ef4444", color:"#fff",
                    fontSize:11, fontWeight:900, padding:"1px 7px", borderRadius:20,
                  }}>{stats.totalPending}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Admin info + logout */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:18, display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"linear-gradient(135deg,#7c3aed,#38bdf8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:15, fontWeight:900,
              }}>
                {adminUser?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{adminUser?.name || "Admin"}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{adminUser?.email || ""}</div>
              </div>
            </div>
            <button
              className="ad-logout-btn"
              onClick={handleLogout}
              style={{
                width:"100%", padding:"9px", borderRadius:10,
                border:"1.5px solid rgba(255,255,255,0.1)",
                background:"transparent", color:"rgba(255,255,255,0.42)",
                fontSize:13, fontWeight:800, cursor:"pointer", transition:"all 0.2s",
              }}
            >🚪 Logout</button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Topbar */}
          <div style={{
            padding:"22px 32px 20px",
            borderBottom:"1px solid rgba(255,255,255,0.06)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", margin:0 }}>
              {view==="dashboard" ? "📊 Dashboard" : view==="pending" ? "⏳ Pending Requests" : "✅ Approved Accounts"}
            </h1>
            {/* Tab switcher for pending/approved */}
            {view !== "dashboard" && (
              <div style={{ display:"flex", gap:6 }}>
                {[
                  { id:"pending",  label:"⏳ Pending"  },
                  { id:"approved", label:"✅ Approved" },
                ].map(t => (
                  <button
                    key={t.id}
                    className="ad-tab-pill"
                    onClick={() => setView(t.id)}
                    style={{
                      padding:"8px 18px", borderRadius:50,
                      border:`1.5px solid ${view===t.id?"transparent":"rgba(255,255,255,0.1)"}`,
                      background: view===t.id ? "linear-gradient(135deg,#7c3aed,#5c67f2)" : "transparent",
                      color: view===t.id ? "#fff" : "rgba(255,255,255,0.42)",
                      fontSize:13, fontWeight:800, cursor:"pointer",
                      boxShadow: view===t.id ? "0 4px 16px rgba(124,58,237,0.35)" : "none",
                      transition:"all 0.2s",
                    }}
                  >{t.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding:"28px 32px", overflowY:"auto", flex:1 }}>

            {/* ── Dashboard stats view ── */}
            {view === "dashboard" && (
              <div style={{ animation:"ad-fadeUp 0.4s ease both" }}>

                {/* Welcome */}
                <div style={{
                  background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(92,103,242,0.1))",
                  border:"1.5px solid rgba(124,58,237,0.25)",
                  borderRadius:20, padding:"22px 26px", marginBottom:28,
                  display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14,
                }}>
                  <div>
                    <div style={{ fontSize:18, fontWeight:900, color:"#fff", marginBottom:4 }}>Welcome back, Admin 👋</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.42)", fontWeight:600 }}>Here's your platform overview.</div>
                  </div>
                  {stats?.totalPending > 0 && (
                    <button
                      onClick={() => setView("pending")}
                      style={{
                        padding:"9px 20px", borderRadius:50,
                        border:"1.5px solid rgba(245,158,11,0.4)",
                        background:"rgba(245,158,11,0.15)", color:"#fbbf24",
                        fontSize:13, fontWeight:900, cursor:"pointer",
                      }}
                    >⏳ {stats.totalPending} pending →</button>
                  )}
                </div>

                {/* Stats grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:28 }}>
                  {[
                    { label:"Pending",      value:stats?.totalPending,         color:"#fbbf24", icon:"⏳", bg:"rgba(245,158,11,0.12)"  },
                    { label:"Approved",     value:stats?.totalApproved,        color:"#34d399", icon:"✅", bg:"rgba(52,211,153,0.12)"   },
                    { label:"Total Users",  value:stats?.users?.total,         color:"#818cf8", icon:"👤", bg:"rgba(129,140,248,0.12)"  },
                    { label:"Contractors",  value:stats?.contractors?.total,   color:"#38bdf8", icon:"🔧", bg:"rgba(56,189,248,0.12)"   },
                  ].map((s,i) => (
                    <div
                      key={s.label}
                      className="ad-stat-card"
                      style={{
                        background:s.bg, border:`1.5px solid ${s.color}30`,
                        borderRadius:18, padding:"20px 16px", textAlign:"center",
                        cursor:"pointer", transition:"all 0.25s",
                        animation:`ad-fadeUp 0.4s ${i*0.07}s ease both`,
                      }}
                      onClick={() => setView(i<=1 ? (i===0?"pending":"approved") : (i===2?"pending":"pending"))}
                    >
                      <div style={{ fontSize:26, marginBottom:10 }}>{s.icon}</div>
                      <div style={{ fontSize:34, fontWeight:900, color:s.color, marginBottom:4 }}>{s.value ?? "…"}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:700 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div>
                  <h3 style={{ fontSize:15, fontWeight:900, color:"#fff", marginBottom:14 }}>Quick Actions</h3>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    {[
                      { label:"Review Pending",  icon:"⏳", color:"#fbbf24", view:"pending"  },
                      { label:"View Approved",   icon:"✅", color:"#34d399", view:"approved" },
                    ].map(q => (
                      <button
                        key={q.label}
                        onClick={() => setView(q.view)}
                        style={{
                          display:"flex", alignItems:"center", gap:9,
                          padding:"12px 22px", borderRadius:50,
                          border:`1.5px solid ${q.color}44`,
                          background:"transparent", color:q.color,
                          fontSize:14, fontWeight:800, cursor:"pointer", transition:"all 0.2s",
                        }}
                      ><span style={{ fontSize:18 }}>{q.icon}</span>{q.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Pending list ── */}
            {view === "pending" && <PendingList />}

            {/* ── Approved list ── */}
            {view === "approved" && <ApprovedList />}
          </div>
        </main>
      </div>
    </>
  );
}