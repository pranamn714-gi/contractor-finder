// src/components/AdminDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PendingList  from "./PendingList";
import ApprovedList from "./ApprovedList";

const API = "http://localhost:5000/api";
function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

// ── Toast ────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const c = type === "error"
    ? { bg:"rgba(239,68,68,0.15)",  border:"rgba(239,68,68,0.4)",  color:"#f87171" }
    : { bg:"rgba(52,211,153,0.15)", border:"rgba(52,211,153,0.4)", color:"#34d399" };
  return (
    <div style={{
      position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)",
      background:c.bg, border:`1.5px solid ${c.border}`, color:c.color,
      padding:"10px 22px", borderRadius:50, fontSize:13, fontWeight:800,
      boxShadow:"0 6px 20px rgba(0,0,0,0.4)", zIndex:9999, whiteSpace:"nowrap",
      backdropFilter:"blur(12px)", animation:"adToast 0.3s ease both", maxWidth:"90vw",
    }}>{msg}</div>
  );
}

// ── Modal ────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }} onClick={onClose}>
      <div style={{
        background:"#1a1730", border:"1.5px solid rgba(255,255,255,0.1)",
        borderRadius:20, padding:"24px 20px", width:"100%", maxWidth:480,
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 28px 72px rgba(0,0,0,0.65)", animation:"adPop 0.22s ease both",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ color:"#fff", fontWeight:900, fontSize:16, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:"rgba(255,255,255,0.4)",
            fontSize:20, cursor:"pointer", lineHeight:1, padding:"2px 6px",
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Search Bar ───────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <input
      className="ad-search"
      placeholder={`🔍  ${placeholder}`}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function Empty({ msg }) {
  return (
    <div style={{ textAlign:"center", padding:"44px 16px", color:"rgba(255,255,255,0.25)", fontWeight:700, fontSize:13 }}>
      <div style={{ fontSize:36, marginBottom:10 }}>📭</div>{msg}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign:"center", padding:"44px 16px", color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:700 }}>
      ⏳ Loading...
    </div>
  );
}

// ── Booking Row ──────────────────────────────────────────────
function BookingRow({ booking, onDelete }) {
  const sc = ({
    pending:   { bg:"rgba(245,158,11,0.14)",  color:"#fbbf24", border:"rgba(245,158,11,0.3)" },
    approved:  { bg:"rgba(52,211,153,0.14)",  color:"#34d399", border:"rgba(52,211,153,0.3)" },
    rejected:  { bg:"rgba(239,68,68,0.14)",   color:"#f87171", border:"rgba(239,68,68,0.3)" },
    cancelled: { bg:"rgba(148,163,184,0.14)", color:"#94a3b8", border:"rgba(148,163,184,0.3)" },
  })[booking.status] || { bg:"rgba(245,158,11,0.14)", color:"#fbbf24", border:"rgba(245,158,11,0.3)" };

  return (
    <div style={{
      background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.07)",
      borderRadius:13, padding:"11px 12px", marginBottom:8,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 160px", minWidth:0 }}>
          <div style={{ fontWeight:800, color:"#fff", fontSize:13, marginBottom:4 }}>
            🚜 {booking.machineType || "N/A"}
            {booking.duration && (
              <span style={{ color:"rgba(255,255,255,0.38)", fontWeight:600, fontSize:11, marginLeft:6 }}>
                {booking.duration}h
              </span>
            )}
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, marginBottom:2 }}>
            👤 <span style={{ color:"rgba(255,255,255,0.65)" }}>{booking.user?.name || "Unknown"}</span>
            {" → "}
            🔧 <span style={{ color:"rgba(255,255,255,0.65)" }}>{booking.contractor?.name || "Unknown"}</span>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>
            📅 {booking.date
              ? new Date(booking.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
              : "—"}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0, flexWrap:"wrap" }}>
          <span style={{
            padding:"3px 9px", borderRadius:50, fontSize:10, fontWeight:800,
            background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`,
          }}>{booking.status}</span>
          <button onClick={() => onDelete(booking._id)} style={{
            padding:"5px 11px", borderRadius:7,
            border:"1.5px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)",
            color:"#f87171", fontSize:11, fontWeight:800, cursor:"pointer",
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Rating Row ───────────────────────────────────────────────
function RatingRow({ rating, onDelete }) {
  const stars = Math.min(Math.max(rating.stars || 0, 0), 5);
  return (
    <div style={{
      background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.07)",
      borderRadius:13, padding:"11px 12px", marginBottom:8,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 160px", minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
            <span style={{ fontSize:13 }}>{"⭐".repeat(stars)}</span>
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:800 }}>{stars}/5</span>
          </div>
          {rating.description && (
            <div style={{
              fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:600,
              fontStyle:"italic", marginBottom:4,
              overflow:"hidden", display:"-webkit-box",
              WebkitLineClamp:2, WebkitBoxOrient:"vertical",
            }}>"{rating.description}"</div>
          )}
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600 }}>
            👤 <span style={{ color:"rgba(255,255,255,0.55)" }}>{rating.user?.name || "User"}</span>
            {" → "}
            🔧 <span style={{ color:"rgba(255,255,255,0.55)" }}>{rating.contractor?.name || "Contractor"}</span>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:2 }}>
            📅 {rating.createdAt
              ? new Date(rating.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
              : "—"}
          </div>
        </div>
        <button onClick={() => onDelete(rating._id)} style={{
          padding:"5px 11px", borderRadius:7, flexShrink:0,
          border:"1.5px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)",
          color:"#f87171", fontSize:11, fontWeight:800, cursor:"pointer",
        }}>Delete</button>
      </div>
    </div>
  );
}

// ── Detail Modal ─────────────────────────────────────────────
function DetailModal({ item, type, onClose }) {
  if (!item) return null;
  const rows = type === "contractor" ? [
    { label:"Name",     value:item.name },
    { label:"Email",    value:item.email },
    { label:"Phone",    value:item.phoneNumber || "—" },
    { label:"Location", value:item.location || "—" },
    { label:"Wages",    value:item.wages ? `₹${item.wages}/day` : "—" },
    { label:"Skills",   value:item.skills?.join(", ") || "—" },
    { label:"Status",   value:item.status === "approved" ? "✅ Approved" : "⏳ Pending" },
    { label:"Ratings",  value:item.ratings?.length ? `${item.ratings.length} rating(s)` : "No ratings" },
    { label:"Machines", value:item.machines?.length ? `${item.machines.length} machine(s)` : "None" },
    { label:"Joined",   value:item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—" },
  ] : [
    { label:"Name",   value:item.name },
    { label:"Email",  value:item.email },
    { label:"Phone",  value:item.phoneNumber || "—" },
    { label:"Role",   value:item.role || "user" },
    { label:"Status", value:item.status === "approved" ? "✅ Approved" : "⏳ Pending" },
    { label:"Joined", value:item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—" },
  ];

  return (
    <Modal title={`${type === "contractor" ? "🔧 Contractor" : "👤 User"} Details`} onClose={onClose}>
      <div style={{
        display:"flex", alignItems:"center", gap:12, marginBottom:16,
        background:"rgba(255,255,255,0.04)", borderRadius:12, padding:12,
      }}>
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0, fontSize:22,
          background: type === "contractor" ? "rgba(56,189,248,0.2)" : "rgba(129,140,248,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{type === "contractor" ? "🔧" : "👤"}</div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", fontWeight:600 }}>{item.email}</div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {rows.map(r => (
          <div key={r.label} style={{
            display:"flex", justifyContent:"space-between", alignItems:"center", gap:8,
            padding:"8px 11px", background:"rgba(255,255,255,0.03)", borderRadius:9,
            border:"1px solid rgba(255,255,255,0.06)", flexWrap:"wrap",
          }}>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.4px", flexShrink:0 }}>{r.label}</span>
            <span style={{ fontSize:12, color:"#fff", fontWeight:700, textAlign:"right", wordBreak:"break-word", maxWidth:"65%" }}>{r.value ?? "—"}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN AdminDashboard
// ════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate  = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const [view,        setView]        = useState("dashboard");
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [contractors, setContractors] = useState([]);
  const [bookings,    setBookings]    = useState([]);
  const [ratings,     setRatings]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [detailModal, setDetailModal] = useState(null);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [toast,       setToast]       = useState({ msg:"", type:"success" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"" }), 3000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/admin/stats`, { headers: getHeaders() });
      setStats(data);
    } catch (e) { console.error("Stats error:", e); }
  }, []);

  const fetchView = useCallback(async (v) => {
    const map = {
      users:       `${API}/admin/users`,
      contractors: `${API}/admin/contractors`,
      bookings:    `${API}/admin/bookings`,
      ratings:     `${API}/admin/ratings`,
    };
    if (!map[v]) return;
    setLoading(true);
    try {
      const { data } = await axios.get(map[v], { headers: getHeaders() });
      if (v === "users")       setUsers(data);
      if (v === "contractors") setContractors(data);
      if (v === "bookings")    setBookings(data);
      if (v === "ratings")     setRatings(data);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    setSearch("");
    fetchView(view);
  }, [view, fetchView]);

  // ── Delete ───────────────────────────────────────────────
  const doDelete = async () => {
    if (!confirmDel) return;
    const { id, type } = confirmDel;
    const ep = {
      user:       `${API}/admin/users/${id}`,
      contractor: `${API}/admin/contractors/${id}`,
      booking:    `${API}/admin/bookings/${id}`,
      rating:     `${API}/admin/ratings/${id}`,
    };
    try {
      await axios.delete(ep[type], { headers: getHeaders() });
      if (type === "user")       setUsers(p => p.filter(u => u._id !== id));
      if (type === "contractor") setContractors(p => p.filter(c => c._id !== id));
      if (type === "booking")    setBookings(p => p.filter(b => b._id !== id));
      if (type === "rating")     setRatings(p => p.filter(r => r._id !== id));
      fetchStats();
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`);
    } catch (e) {
      showToast(e.response?.data?.message || "Delete failed", "error");
    } finally {
      setConfirmDel(null);
    }
  };

  // ── Filter ───────────────────────────────────────────────
  const filtered = (arr) => {
    const q = search.toLowerCase().trim();
    if (!q) return arr;
    return arr.filter(i =>
      (i.name             || "").toLowerCase().includes(q) ||
      (i.email            || "").toLowerCase().includes(q) ||
      (i.location         || "").toLowerCase().includes(q) ||
      (i.machineType      || "").toLowerCase().includes(q) ||
      (i.description      || "").toLowerCase().includes(q) ||
      (i.user?.name       || "").toLowerCase().includes(q) ||
      (i.contractor?.name || "").toLowerCase().includes(q)
    );
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const handleNav    = (id) => { setView(id); setSidebarOpen(false); };

  const navItems = [
    { id:"dashboard",   icon:"📊", label:"Dashboard" },
    { id:"users",       icon:"👤", label:"Users",       count:stats?.users?.total },
    { id:"contractors", icon:"🔧", label:"Contractors", count:stats?.contractors?.total },
    { id:"bookings",    icon:"📋", label:"Bookings",    count:stats?.totalBookings },
    { id:"ratings",     icon:"⭐", label:"Ratings",     count:stats?.totalRatings },
    { id:"pending",     icon:"⏳", label:"Pending",     count:stats?.totalPending,  badge:true },
    { id:"approved",    icon:"✅", label:"Approved",    count:stats?.totalApproved },
  ];

  const currentLabel = navItems.find(n => n.id === view);

  // ── Person Row (for Users & Contractors views) ───────────
  function PersonRow({ item, type }) {
    return (
      <div style={{
        display:"flex", flexDirection:"column", gap:8,
        background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.07)",
        borderRadius:13, padding:"12px", marginBottom:8,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flex:"1 1 160px", minWidth:0 }}>
            <div style={{
              width:38, height:38, borderRadius:10, flexShrink:0, fontSize:17,
              background: type === "user" ? "rgba(129,140,248,0.18)" : "rgba(56,189,248,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {type === "user" ? "👤" : "🔧"}
            </div>
            <div style={{ overflow:"hidden", minWidth:0 }}>
              <div style={{ fontWeight:800, color:"#fff", fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {item.name || "N/A"}
              </div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {item.email}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", flexShrink:0 }}>
            <span style={{
              padding:"3px 9px", borderRadius:50, fontSize:10, fontWeight:800,
              background: item.status === "approved" ? "rgba(52,211,153,0.14)" : "rgba(245,158,11,0.14)",
              color:      item.status === "approved" ? "#34d399"               : "#fbbf24",
              border:`1px solid ${item.status === "approved" ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}`,
            }}>
              {item.status === "approved" ? "✅ Active" : "⏳ Pending"}
            </span>
            <button onClick={() => setDetailModal({ item, type })} style={{
              padding:"5px 11px", borderRadius:7,
              border:"1.5px solid rgba(129,140,248,0.35)", background:"rgba(129,140,248,0.1)",
              color:"#a5b4fc", fontSize:11, fontWeight:800, cursor:"pointer",
            }}>View</button>
            <button onClick={() => setConfirmDel({ id:item._id, type, name:item.name })} style={{
              padding:"5px 11px", borderRadius:7,
              border:"1.5px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)",
              color:"#f87171", fontSize:11, fontWeight:800, cursor:"pointer",
            }}>Delete</button>
          </div>
        </div>

        {/* Detail chips */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, paddingTop:6, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          {item.phoneNumber && <Chip icon="📞" val={item.phoneNumber} />}
          {item.location    && <Chip icon="📍" val={item.location} />}
          {item.wages       && <Chip icon="💰" val={`₹${item.wages}/day`} />}
          {item.skills?.length > 0 && <Chip icon="🛠️" val={item.skills.join(", ")} />}
          {item.machines?.length > 0 && <Chip icon="🚜" val={`${item.machines.length} machine(s)`} />}
          {type === "user" && item.role && <Chip icon="🏷️" val={item.role} />}
        </div>
      </div>
    );
  }

  function Chip({ icon, val }) {
    return (
      <span style={{
        fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:600,
        background:"rgba(255,255,255,0.05)", padding:"3px 8px", borderRadius:6,
      }}>{icon} {val}</span>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        body { margin:0; padding:0; }
        @keyframes adFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes adPop    { from{opacity:0;transform:scale(0.94)}      to{opacity:1;transform:scale(1)} }
        @keyframes adToast  { from{opacity:0;transform:translateY(12px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        .ad-root    { display:flex; min-height:100vh; background:#0d0b1e; font-family:'Nunito',sans-serif; color:#fff; position:relative; }
        .ad-sidebar {
          width:216px; flex-shrink:0;
          background:rgba(255,255,255,0.03); border-right:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column; padding:15px 9px;
          position:sticky; top:0; height:100vh; overflow-y:auto; z-index:199;
        }
        .ad-main    { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
        .ad-topbar  { padding:14px 20px 12px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
        .ad-content { padding:18px 20px; overflow-y:auto; flex:1; }
        .ad-nb {
          display:flex; align-items:center; gap:8px; padding:9px 10px;
          border-radius:9px; border:1px solid transparent; background:transparent;
          cursor:pointer; font-size:12px; font-weight:700; color:rgba(255,255,255,0.42);
          text-align:left; width:100%; transition:all 0.2s;
        }
        .ad-nb:hover  { background:rgba(255,255,255,0.08) !important; color:rgba(255,255,255,0.85) !important; }
        .ad-nb.active { background:linear-gradient(135deg,rgba(124,58,237,0.28),rgba(92,103,242,0.2)) !important; color:#c4b5fd !important; border-color:rgba(124,58,237,0.35) !important; }
        .ad-logout:hover { background:rgba(239,68,68,0.14) !important; border-color:rgba(239,68,68,0.4) !important; color:#f87171 !important; }
        .ad-stat:hover   { transform:translateY(-3px); box-shadow:0 8px 20px rgba(0,0,0,0.3); }
        .ad-search {
          width:100%; padding:9px 13px; border-radius:10px;
          border:1.5px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.05);
          color:#fff; font-family:'Nunito',sans-serif; font-size:13px; font-weight:600;
          outline:none; transition:all 0.2s; margin-bottom:12px;
        }
        .ad-search:focus        { border-color:rgba(124,58,237,0.5); background:rgba(255,255,255,0.08); }
        .ad-search::placeholder { color:rgba(255,255,255,0.25); }
        .ad-overlay   { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:198; }
        .ad-hamburger {
          display:none; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
          color:#fff; border-radius:8px; padding:6px 10px; font-size:18px; cursor:pointer; line-height:1; flex-shrink:0;
        }
        @media (max-width:768px) {
          .ad-sidebar { position:fixed; top:0; left:0; height:100vh; z-index:200; width:200px; transform:translateX(-100%); background:#13112b; box-shadow:8px 0 28px rgba(0,0,0,0.5); transition:transform 0.28s ease; border-right:none; }
          .ad-sidebar.open { transform:translateX(0); }
          .ad-overlay.open { display:block; }
          .ad-hamburger    { display:block; }
          .ad-content      { padding:12px; }
          .ad-topbar       { padding:10px 12px; }
        }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} />

      <div className="ad-root">
        <div className={`ad-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* ══ SIDEBAR ══ */}
        <aside className={`ad-sidebar${sidebarOpen ? " open" : ""}`}>
          <div style={{
            display:"flex", alignItems:"center", gap:9,
            padding:"2px 6px 17px", borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:12,
          }}>
            <div style={{
              width:35, height:35, borderRadius:10, flexShrink:0,
              background:"linear-gradient(135deg,#7c3aed,#5c67f2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:17, boxShadow:"0 4px 14px rgba(124,58,237,0.4)",
            }}>🛡️</div>
            <div>
              <div style={{ fontSize:13, fontWeight:900, color:"#fff" }}>Admin Panel</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.28)", fontWeight:600 }}>Contractor Finder</div>
            </div>
          </div>

          <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`ad-nb${view === item.id ? " active" : ""}`}
                onClick={() => handleNav(item.id)}
              >
                <span style={{ fontSize:14, width:20, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.count > 0 && (
                  <span style={{
                    background: item.badge ? "#ef4444" : "rgba(255,255,255,0.1)",
                    color:      item.badge ? "#fff"    : "rgba(255,255,255,0.5)",
                    fontSize:9, fontWeight:900, padding:"1px 6px",
                    borderRadius:20, minWidth:18, textAlign:"center", flexShrink:0,
                  }}>{item.count}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:12, display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 2px" }}>
              <div style={{
                width:30, height:30, borderRadius:8, flexShrink:0,
                background:"linear-gradient(135deg,#7c3aed,#38bdf8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:900, color:"#fff",
              }}>{adminUser?.name?.[0]?.toUpperCase() || "A"}</div>
              <div style={{ overflow:"hidden", flex:1 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {adminUser?.name || "Admin"}
                </div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.28)", fontWeight:600 }}>Administrator</div>
              </div>
            </div>
            <button className="ad-logout" onClick={handleLogout} style={{
              width:"100%", padding:8, borderRadius:8,
              border:"1.5px solid rgba(255,255,255,0.08)", background:"transparent",
              color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:800,
              cursor:"pointer", transition:"all 0.2s",
            }}>🚪 Logout</button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main className="ad-main">
          <div className="ad-topbar">
            <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
              <button className="ad-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <h1 style={{ fontSize:16, fontWeight:900, color:"#fff", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {currentLabel?.icon} {currentLabel?.label}
              </h1>
            </div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.22)", fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
              {new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" })}
            </div>
          </div>

          <div className="ad-content">

            {/* ── DASHBOARD ── */}
            {view === "dashboard" && (
              <div style={{ animation:"adFadeUp 0.4s ease both" }}>
                <div style={{
                  background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(92,103,242,0.1))",
                  border:"1.5px solid rgba(124,58,237,0.25)", borderRadius:16,
                  padding:"15px 17px", marginBottom:16,
                  display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10,
                }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:900, color:"#fff", marginBottom:2 }}>
                      Welcome back, {adminUser?.name || "Admin"} 👋
                    </div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", fontWeight:600 }}>
                      Platform overview — click any card to manage.
                    </div>
                  </div>
                  {stats?.totalPending > 0 && (
                    <button onClick={() => setView("pending")} style={{
                      padding:"6px 13px", borderRadius:50,
                      border:"1.5px solid rgba(245,158,11,0.4)", background:"rgba(245,158,11,0.14)",
                      color:"#fbbf24", fontSize:11, fontWeight:900, cursor:"pointer",
                    }}>⏳ {stats.totalPending} pending →</button>
                  )}
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:9, marginBottom:18 }}>
                  {[
                    { label:"Users",       value:stats?.users?.total,      color:"#818cf8", icon:"👤", id:"users" },
                    { label:"Contractors", value:stats?.contractors?.total, color:"#38bdf8", icon:"🔧", id:"contractors" },
                    { label:"Bookings",    value:stats?.totalBookings,      color:"#34d399", icon:"📋", id:"bookings" },
                    { label:"Ratings",     value:stats?.totalRatings,       color:"#fbbf24", icon:"⭐", id:"ratings" },
                    { label:"Pending",     value:stats?.totalPending,       color:"#fb923c", icon:"⏳", id:"pending" },
                    { label:"Approved",    value:stats?.totalApproved,      color:"#a3e635", icon:"✅", id:"approved" },
                  ].map((s, i) => (
                    <div key={s.label} className="ad-stat" onClick={() => setView(s.id)} style={{
                      background:`${s.color}14`, border:`1.5px solid ${s.color}28`,
                      borderRadius:13, padding:"13px 10px", textAlign:"center",
                      cursor:"pointer", transition:"all 0.25s",
                      animation:`adFadeUp 0.4s ${i * 0.06}s ease both`,
                    }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                      <div style={{ fontSize:22, fontWeight:900, color:s.color, marginBottom:2 }}>{s.value ?? "…"}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", fontWeight:700 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {view === "users" && (
              <div style={{ animation:"adFadeUp 0.4s ease both" }}>
                <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", fontWeight:700, marginBottom:10 }}>
                  {filtered(users).length} user{filtered(users).length !== 1 ? "s" : ""}
                </div>
                {loading ? <LoadingState /> : filtered(users).length === 0 ? <Empty msg="No users found" /> :
                  filtered(users).map(u => <PersonRow key={u._id} item={u} type="user" />)
                }
              </div>
            )}

            {/* ── CONTRACTORS ── */}
            {view === "contractors" && (
              <div style={{ animation:"adFadeUp 0.4s ease both" }}>
                <SearchBar value={search} onChange={setSearch} placeholder="Search contractors..." />
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", fontWeight:700, marginBottom:10 }}>
                  {filtered(contractors).length} contractor{filtered(contractors).length !== 1 ? "s" : ""}
                </div>
                {loading ? <LoadingState /> : filtered(contractors).length === 0 ? <Empty msg="No contractors found" /> :
                  filtered(contractors).map(c => <PersonRow key={c._id} item={c} type="contractor" />)
                }
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {view === "bookings" && (
              <div style={{ animation:"adFadeUp 0.4s ease both" }}>
                <SearchBar value={search} onChange={setSearch} placeholder="Search bookings..." />
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", fontWeight:700, marginBottom:10 }}>
                  {filtered(bookings).length} booking{filtered(bookings).length !== 1 ? "s" : ""}
                </div>
                {loading ? <LoadingState /> : filtered(bookings).length === 0 ? <Empty msg="No bookings found" /> :
                  filtered(bookings).map(b => (
                    <BookingRow key={b._id} booking={b}
                      onDelete={id => setConfirmDel({ id, type:"booking", name:`booking on ${b.date ? new Date(b.date).toLocaleDateString() : "—"}` })}
                    />
                  ))
                }
              </div>
            )}

            {/* ── RATINGS ── */}
            {view === "ratings" && (
              <div style={{ animation:"adFadeUp 0.4s ease both" }}>
                <SearchBar value={search} onChange={setSearch} placeholder="Search ratings..." />
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", fontWeight:700, marginBottom:10 }}>
                  {filtered(ratings).length} rating{filtered(ratings).length !== 1 ? "s" : ""}
                </div>
                {loading ? <LoadingState /> : filtered(ratings).length === 0 ? <Empty msg="No ratings found" /> :
                  filtered(ratings).map(r => (
                    <RatingRow key={r._id} rating={r}
                      onDelete={id => setConfirmDel({ id, type:"rating", name:"this rating" })}
                    />
                  ))
                }
              </div>
            )}

            {/* ── PENDING — uses PendingList component ── */}
            {view === "pending" && (
              <div style={{ animation:"adFadeUp 0.4s ease both" }}>
                <PendingList onStatsChange={fetchStats} />
              </div>
            )}

            {/* ── APPROVED — uses ApprovedList component ── */}
            {view === "approved" && (
              <div style={{ animation:"adFadeUp 0.4s ease both" }}>
                <ApprovedList onStatsChange={fetchStats} />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <DetailModal item={detailModal.item} type={detailModal.type} onClose={() => setDetailModal(null)} />
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <Modal title="⚠️ Confirm Delete" onClose={() => setConfirmDel(null)}>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:13, fontWeight:600, textAlign:"center", lineHeight:1.65, marginBottom:20 }}>
            Delete <strong style={{ color:"#fff" }}>{confirmDel.name}</strong>?<br />
            This <strong style={{ color:"#f87171" }}>cannot be undone</strong>.
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setConfirmDel(null)} style={{
              flex:1, padding:10, borderRadius:10,
              border:"1.5px solid rgba(255,255,255,0.1)", background:"transparent",
              color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:800, cursor:"pointer",
            }}>Cancel</button>
            <button onClick={doDelete} style={{
              flex:1, padding:10, borderRadius:10, border:"none",
              background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff",
              fontSize:13, fontWeight:900, cursor:"pointer",
              boxShadow:"0 5px 16px rgba(239,68,68,0.4)",
            }}>🗑️ Yes, Delete</button>
          </div>
        </Modal>
      )}
    </>
  );
}