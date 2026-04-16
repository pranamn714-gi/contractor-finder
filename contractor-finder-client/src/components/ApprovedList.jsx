// src/components/ApprovedList.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function ApprovedList() {
  const [data, setData]           = useState({ users: [], contractors: [] });
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState({ msg: "", type: "success" });
  const [confirm, setConfirm]     = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch]       = useState("");
  const token = localStorage.getItem("token");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 3500);
  };

  const fetchApproved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/approved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        const users       = res.data.filter(p => p.role === "user");
        const contractors = res.data.filter(p => p.role === "contractor");
        setData({ users, contractors });
      } else {
        setData({
          users:       res.data.users       || [],
          contractors: res.data.contractors || [],
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchApproved(); }, [fetchApproved]);

  // ── Revoke ───────────────────────────────────────────────
  const doRevoke = async () => {
    const { id, type } = confirm;
    setConfirm(null);
    try {
      const res = await axios.put(
        `${API}/admin/reject/${type}/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || "Access revoked", "info");
      fetchApproved();
    } catch (err) {
      showToast(err.response?.data?.message || "Revoke failed", "error");
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const doDelete = async () => {
    const { id, type } = confirm;
    setConfirm(null);
    try {
      const res = await axios.delete(
        `${API}/admin/${type}/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || "Deleted successfully", "success");
      fetchApproved();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  // ── Filter ───────────────────────────────────────────────
  const q = search.toLowerCase();
  const filterFn = (p) =>
    !q ||
    p.name?.toLowerCase().includes(q) ||
    p.email?.toLowerCase().includes(q) ||
    p.location?.toLowerCase().includes(q);

  const displayUsers       = (activeTab !== "contractors" ? data.users       : []).filter(filterFn);
  const displayContractors = (activeTab !== "users"       ? data.contractors : []).filter(filterFn);
  const total              = data.users.length + data.contractors.length;
  const displayTotal       = displayUsers.length + displayContractors.length;

  const confirmMeta = {
    revoke: { title:"Revoke Approval?", color:"#f59e0b", label:"↩️ Yes, Revoke", body:`Revoke access for "${confirm?.name}"? They won't be able to log in until re-approved.` },
    delete: { title:"Delete Account?",  color:"#ef4444", label:"🗑️ Yes, Delete", body:`Permanently delete "${confirm?.name}"? This cannot be undone.` },
  };

  return (
    <>
      <style>{`
        @keyframes al-fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes al-toast  { from{opacity:0;transform:translateY(16px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        @keyframes al-pop    { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        .al-card:hover    { border-color:rgba(255,255,255,0.15) !important; transform:translateY(-2px); }
        .al-revoke:hover  { background:rgba(245,158,11,0.26) !important; }
        .al-delete:hover  { background:rgba(239,68,68,0.25)  !important; }
        .al-tab:hover     { background:rgba(255,255,255,0.06) !important; }
        .al-search:focus  { border-color:rgba(52,211,153,0.6) !important; outline:none; }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position:"fixed", bottom:26, left:"50%",
          background: toast.type==="error" ? "rgba(239,68,68,0.15)" : toast.type==="info" ? "rgba(92,103,242,0.15)" : "rgba(52,211,153,0.15)",
          border:`1.5px solid ${toast.type==="error" ? "rgba(239,68,68,0.4)" : toast.type==="info" ? "rgba(92,103,242,0.4)" : "rgba(52,211,153,0.4)"}`,
          color: toast.type==="error" ? "#f87171" : toast.type==="info" ? "#818cf8" : "#34d399",
          padding:"12px 28px", borderRadius:50, fontSize:14, fontWeight:800,
          boxShadow:"0 10px 28px rgba(0,0,0,0.4)", zIndex:9999,
          whiteSpace:"nowrap", backdropFilter:"blur(12px)",
          animation:"al-toast 0.3s ease both",
        }}>{toast.msg}</div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.72)",
          backdropFilter:"blur(6px)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center",
        }} onClick={() => setConfirm(null)}>
          <div style={{
            background:"#1a1733", border:"1.5px solid rgba(255,255,255,0.1)",
            borderRadius:22, padding:"34px 38px", width:420, maxWidth:"90vw",
            boxShadow:"0 28px 72px rgba(0,0,0,0.6)", animation:"al-pop 0.25s ease both",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:38, textAlign:"center", marginBottom:12 }}>
              {confirm.action === "revoke" ? "↩️" : "🗑️"}
            </div>
            <h3 style={{ fontSize:19, fontWeight:900, color:"#fff", textAlign:"center", marginBottom:8 }}>
              {confirmMeta[confirm.action].title}
            </h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.48)", textAlign:"center", lineHeight:1.65, marginBottom:26 }}>
              {confirmMeta[confirm.action].body}
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button onClick={() => setConfirm(null)} style={{
                padding:"10px 26px", borderRadius:50,
                border:"1.5px solid rgba(255,255,255,0.14)", background:"transparent",
                color:"rgba(255,255,255,0.48)", fontSize:14, fontWeight:800, cursor:"pointer",
              }}>Cancel</button>
              <button onClick={confirm.action === "revoke" ? doRevoke : doDelete} style={{
                padding:"10px 26px", borderRadius:50, border:"none",
                background:`linear-gradient(135deg,${confirmMeta[confirm.action].color},${confirmMeta[confirm.action].color}cc)`,
                color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer",
                boxShadow:`0 6px 18px ${confirmMeta[confirm.action].color}55`,
              }}>
                {confirmMeta[confirm.action].label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:22 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div style={{
            background:"rgba(52,211,153,0.12)", color:"#34d399",
            border:"1.5px solid rgba(52,211,153,0.3)",
            padding:"7px 18px", borderRadius:50, fontSize:13, fontWeight:800,
          }}>
            {total > 0 ? `${total} approved account${total > 1 ? "s" : ""}` : "No approved accounts"}
          </div>
          {/* Search */}
          <input
            className="al-search"
            placeholder="🔍  Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding:"8px 16px", borderRadius:50,
              border:"1.5px solid rgba(255,255,255,0.1)",
              background:"rgba(255,255,255,0.06)", color:"#fff",
              fontSize:13, fontWeight:600, minWidth:200, transition:"border-color 0.2s",
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6 }}>
          {[
            { id:"all",         label:"All",         count: total },
            { id:"users",       label:"Users",       count: data.users.length },
            { id:"contractors", label:"Contractors", count: data.contractors.length },
          ].map(t => (
            <button key={t.id} className="al-tab" onClick={() => setActiveTab(t.id)} style={{
              padding:"7px 16px", borderRadius:50, cursor:"pointer",
              border:`1.5px solid ${activeTab === t.id ? "transparent" : "rgba(255,255,255,0.1)"}`,
              background: activeTab === t.id ? "linear-gradient(135deg,#059669,#34d399)" : "transparent",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.42)",
              fontSize:13, fontWeight:800,
              boxShadow: activeTab === t.id ? "0 4px 14px rgba(52,211,153,0.35)" : "none",
              transition:"all 0.2s", display:"flex", alignItems:"center", gap:6,
            }}>
              {t.label}
              <span style={{ background:"rgba(255,255,255,0.2)", padding:"1px 7px", borderRadius:20, fontSize:11 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.28)", fontWeight:700, marginBottom:16 }}>
        {loading ? "Loading..." : `${displayTotal} result${displayTotal !== 1 ? "s" : ""} found`}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.25)", fontSize:15, fontWeight:700 }}>
          ⏳ Loading approved accounts...
        </div>
      ) : displayTotal === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.25)", fontSize:15, fontWeight:700 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{search ? "🔍" : "📭"}</div>
          {search ? "No results match your search." : "No approved accounts yet."}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
          {displayUsers.map((u, i) => (
            <ApprovedCard
              key={u._id} person={u} type="user" animDelay={i * 0.06}
              onRevoke={() => setConfirm({ id:u._id, type:"user",       name:u.name, action:"revoke" })}
              onDelete={() => setConfirm({ id:u._id, type:"user",       name:u.name, action:"delete" })}
            />
          ))}
          {displayContractors.map((c, i) => (
            <ApprovedCard
              key={c._id} person={c} type="contractor" animDelay={(displayUsers.length + i) * 0.06}
              onRevoke={() => setConfirm({ id:c._id, type:"contractor", name:c.name, action:"revoke" })}
              onDelete={() => setConfirm({ id:c._id, type:"contractor", name:c.name, action:"delete" })}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ApprovedCard({ person, type, animDelay, onRevoke, onDelete }) {
  const isContractor = type === "contractor";
  return (
    <div className="al-card" style={{
      background:"rgba(255,255,255,0.04)",
      border:"1.5px solid rgba(255,255,255,0.08)",
      borderRadius:18, padding:20,
      display:"flex", flexDirection:"column", gap:12,
      transition:"all 0.25s",
      animation:`al-fadeUp 0.4s ${animDelay}s ease both`,
    }}>
      {/* Avatar + Name + Badge */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{
          width:44, height:44, borderRadius:13, flexShrink:0,
          background: isContractor
            ? "linear-gradient(135deg,#06b6d4,#34d399)"
            : "linear-gradient(135deg,#7c3aed,#5c67f2)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:19, fontWeight:900, color:"#fff",
        }}>
          {person.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {person.name || "Unknown"}
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {person.email}
          </div>
        </div>
        <span style={{
          padding:"3px 11px", borderRadius:50, fontSize:11, fontWeight:800, flexShrink:0,
          background: isContractor ? "rgba(6,182,212,0.15)" : "rgba(124,58,237,0.15)",
          color:      isContractor ? "#22d3ee"              : "#a78bfa",
          border:`1px solid ${isContractor ? "rgba(6,182,212,0.3)" : "rgba(124,58,237,0.3)"}`,
        }}>
          {isContractor ? "🔧 Contractor" : "👤 User"}
        </span>
      </div>

      {/* ── Contractor details ── */}
      {isContractor && (
        <div style={{ display:"flex", flexDirection:"column", gap:5, paddingLeft:2 }}>
          <InfoLine icon="📍" val={person.location    || "Location not set"} />
          <InfoLine icon="📞" val={person.phoneNumber || "Phone not set"} />
          <InfoLine icon="🛠️" val={person.skills?.length > 0 ? person.skills.join(", ") : "No skills listed"} />
          <InfoLine icon="💰" val={person.wages ? `₹${person.wages}/day` : "Wages not set"} />
          {person.machines?.length > 0 && (
            <InfoLine icon="🚜" val={`${person.machines.length} machine(s)`} />
          )}
        </div>
      )}

      {/* ── User details ── */}
      {!isContractor && (
        <div style={{ display:"flex", flexDirection:"column", gap:5, paddingLeft:2 }}>
          <InfoLine icon="📞" val={person.phoneNumber || "Phone not set"} />
          <InfoLine icon="🏷️" val={`Role: ${person.role || "user"}`} />
        </div>
      )}

      {/* Joined date */}
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.28)", fontWeight:600 }}>
        📅 Joined: {person.createdAt
          ? new Date(person.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
          : "Unknown"}
      </div>

      {/* Status badge */}
      <span style={{
        background:"rgba(52,211,153,0.14)", color:"#34d399",
        padding:"4px 13px", borderRadius:50, fontSize:12, fontWeight:800,
        display:"inline-flex", alignItems:"center", gap:5, alignSelf:"flex-start",
      }}>✅ Approved</span>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:8, marginTop:2 }}>
        <button className="al-revoke" onClick={onRevoke} style={{
          flex:1, padding:"9px", borderRadius:10, border:"none",
          background:"rgba(245,158,11,0.14)", color:"#fbbf24",
          fontSize:13, fontWeight:800, cursor:"pointer", transition:"background 0.2s",
        }}>↩️ Revoke</button>
        <button className="al-delete" onClick={onDelete} style={{
          flex:1, padding:"9px", borderRadius:10, border:"none",
          background:"rgba(239,68,68,0.12)", color:"#f87171",
          fontSize:13, fontWeight:800, cursor:"pointer", transition:"background 0.2s",
        }}>🗑️ Delete</button>
      </div>
    </div>
  );
}

function InfoLine({ icon, val }) {
  return (
    <div style={{ fontSize:12, color:"rgba(255,255,255,0.42)", fontWeight:600 }}>
      {icon} <span style={{ color:"rgba(255,255,255,0.65)" }}>{val}</span>
    </div>
  );
}