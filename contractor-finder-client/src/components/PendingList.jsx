// src/components/PendingList.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function PendingList() {
  const [pending, setPending] = useState({ users: [], contractors: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState({ msg:"", type:"success" });
  const [confirm, setConfirm] = useState(null); // { id, type, name, action }
  const [activeTab, setActiveTab] = useState("all"); // all | users | contractors
  const token = localStorage.getItem("token");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"" }), 3500);
  };

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPending(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  // ── Approve ────────────────────────────────────────────────
  const doApprove = async () => {
    const { id, type } = confirm;
    setConfirm(null);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/approve/${type}/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || `${type} approved ✅`, "success");
      fetchPending();
    } catch (err) {
      showToast(err.response?.data?.message || "Error approving", "error");
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const doDelete = async () => {
    const { id, type } = confirm;
    setConfirm(null);
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/admin/${type}/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data.message || `${type} deleted`, "success");
      fetchPending();
    } catch (err) {
      showToast(err.response?.data?.message || "Error deleting", "error");
    }
  };

  const total = pending.users.length + pending.contractors.length;
  const showUsers       = activeTab !== "contractors";
  const showContractors = activeTab !== "users";

  return (
    <>
      <style>{`
        @keyframes pl-fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pl-toast  { from{opacity:0;transform:translateY(16px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        @keyframes pl-pop    { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        .pl-card:hover { border-color:rgba(255,255,255,0.15) !important; transform:translateY(-2px); }
        .pl-approve:hover { background:rgba(52,211,153,0.28) !important; }
        .pl-delete:hover  { background:rgba(239,68,68,0.25)  !important; }
        .pl-tab:hover { background:rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position:"fixed", bottom:26, left:"50%",
          background: toast.type==="success" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
          border:`1.5px solid ${toast.type==="success" ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}`,
          color: toast.type==="success" ? "#34d399" : "#f87171",
          padding:"12px 28px", borderRadius:50, fontSize:14, fontWeight:800,
          boxShadow:"0 10px 28px rgba(0,0,0,0.4)", zIndex:9999,
          whiteSpace:"nowrap", backdropFilter:"blur(12px)",
          animation:"pl-toast 0.3s ease both",
        }}>{toast.msg}</div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.72)",
          backdropFilter:"blur(6px)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center",
        }} onClick={() => setConfirm(null)}>
          <div style={{
            background:"#1a1733", border:"1.5px solid rgba(255,255,255,0.1)",
            borderRadius:22, padding:"34px 38px", width:420, maxWidth:"90vw",
            boxShadow:"0 28px 72px rgba(0,0,0,0.6)", animation:"pl-pop 0.25s ease both",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:38, textAlign:"center", marginBottom:12 }}>
              {confirm.action==="approve" ? "✅" : "🗑️"}
            </div>
            <h3 style={{ fontSize:19, fontWeight:900, color:"#fff", textAlign:"center", marginBottom:8 }}>
              {confirm.action==="approve" ? "Approve Account?" : "Delete Account?"}
            </h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.48)", textAlign:"center", lineHeight:1.65, marginBottom:26 }}>
              {confirm.action==="approve"
                ? `Approve "${confirm.name}"? They will be able to log in immediately.`
                : `Permanently delete "${confirm.name}"? This cannot be undone.`}
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button onClick={() => setConfirm(null)} style={{
                padding:"10px 26px", borderRadius:50,
                border:"1.5px solid rgba(255,255,255,0.14)", background:"transparent",
                color:"rgba(255,255,255,0.48)", fontSize:14, fontWeight:800, cursor:"pointer",
              }}>Cancel</button>
              <button onClick={confirm.action==="approve" ? doApprove : doDelete} style={{
                padding:"10px 26px", borderRadius:50, border:"none",
                background: confirm.action==="approve"
                  ? "linear-gradient(135deg,#059669,#34d399)"
                  : "linear-gradient(135deg,#ef4444,#dc2626)",
                color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer",
                boxShadow: confirm.action==="approve"
                  ? "0 6px 18px rgba(52,211,153,0.4)"
                  : "0 6px 18px rgba(239,68,68,0.4)",
              }}>
                {confirm.action==="approve" ? "✅ Yes, Approve" : "🗑️ Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:22 }}>
        <div style={{
          background:"rgba(245,158,11,0.12)", color:"#fbbf24",
          border:"1.5px solid rgba(245,158,11,0.3)",
          padding:"7px 18px", borderRadius:50, fontSize:13, fontWeight:800,
          display:"inline-block",
        }}>
          {total > 0 ? `${total} pending request${total>1?"s":""}` : "No pending requests"}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6 }}>
          {[
            { id:"all",         label:"All",         count: total },
            { id:"users",       label:"Users",       count: pending.users.length },
            { id:"contractors", label:"Contractors", count: pending.contractors.length },
          ].map(t => (
            <button key={t.id} className="pl-tab" onClick={() => setActiveTab(t.id)} style={{
              padding:"7px 16px", borderRadius:50, cursor:"pointer",
              border:`1.5px solid ${activeTab===t.id?"transparent":"rgba(255,255,255,0.1)"}`,
              background: activeTab===t.id ? "linear-gradient(135deg,#7c3aed,#5c67f2)" : "transparent",
              color: activeTab===t.id ? "#fff" : "rgba(255,255,255,0.42)",
              fontSize:13, fontWeight:800,
              boxShadow: activeTab===t.id ? "0 4px 14px rgba(124,58,237,0.35)" : "none",
              transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:6,
            }}>
              {t.label}
              <span style={{ background:"rgba(255,255,255,0.2)", padding:"1px 7px", borderRadius:20, fontSize:11 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.25)", fontSize:15, fontWeight:700 }}>
          ⏳ Loading pending requests...
        </div>
      ) : total === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.25)", fontSize:15, fontWeight:700 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
          No pending requests! All caught up.
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>

          {/* Users */}
          {showUsers && pending.users.map((u, i) => (
            <PersonCard
              key={u._id} person={u} type="user"
              animDelay={i * 0.06}
              onApprove={() => setConfirm({ id:u._id, type:"user",       name:u.name, action:"approve" })}
              onDelete ={() => setConfirm({ id:u._id, type:"user",       name:u.name, action:"delete"  })}
            />
          ))}

          {/* Contractors */}
          {showContractors && pending.contractors.map((c, i) => (
            <PersonCard
              key={c._id} person={c} type="contractor"
              animDelay={(pending.users.length + i) * 0.06}
              onApprove={() => setConfirm({ id:c._id, type:"contractor", name:c.name, action:"approve" })}
              onDelete ={() => setConfirm({ id:c._id, type:"contractor", name:c.name, action:"delete"  })}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ── Reusable person card ────────────────────────────────────
function PersonCard({ person, type, animDelay, onApprove, onDelete }) {
  const isContractor = type === "contractor";
  return (
    <div className="pl-card" style={{
      background:"rgba(255,255,255,0.04)",
      border:"1.5px solid rgba(255,255,255,0.08)",
      borderRadius:18, padding:20,
      display:"flex", flexDirection:"column", gap:12,
      transition:"all 0.25s", cursor:"default",
      animation:`pl-fadeUp 0.4s ${animDelay}s ease both`,
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{
          width:44, height:44, borderRadius:13, flexShrink:0,
          background: isContractor
            ? "linear-gradient(135deg,#06b6d4,#34d399)"
            : "linear-gradient(135deg,#7c3aed,#5c67f2)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:19, fontWeight:900,
        }}>
          {person.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ fontSize:15, fontWeight:900, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{person.name}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{person.email}</div>
        </div>
        <span style={{
          padding:"3px 11px", borderRadius:50, fontSize:11, fontWeight:800, flexShrink:0,
          background: isContractor ? "rgba(6,182,212,0.15)" : "rgba(124,58,237,0.15)",
          color: isContractor ? "#22d3ee" : "#a78bfa",
          border:`1px solid ${isContractor ? "rgba(6,182,212,0.3)" : "rgba(124,58,237,0.3)"}`,
        }}>
          {isContractor ? "🔧 Contractor" : "👤 User"}
        </span>
      </div>

      {/* Contractor extra info */}
      {isContractor && (
        <div style={{ display:"flex", flexDirection:"column", gap:5, paddingLeft:2 }}>
          {person.location    && <InfoLine icon="📍" val={person.location} />}
          {person.phoneNumber && <InfoLine icon="📞" val={person.phoneNumber} />}
          {person.skills?.length > 0 && <InfoLine icon="🛠️" val={person.skills.join(", ")} />}
          {person.wages       && <InfoLine icon="💰" val={`₹${person.wages}/day`} />}
        </div>
      )}

      {/* Date */}
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.28)", fontWeight:600 }}>
        📅 {new Date(person.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
      </div>

      {/* Status */}
      <span style={{
        background:"rgba(245,158,11,0.14)", color:"#fbbf24",
        padding:"4px 13px", borderRadius:50, fontSize:12, fontWeight:800,
        display:"inline-flex", alignItems:"center", gap:5, alignSelf:"flex-start",
      }}>⏳ Pending Approval</span>

      {/* Actions */}
      <div style={{ display:"flex", gap:8, marginTop:2 }}>
        <button className="pl-approve" onClick={onApprove} style={{
          flex:1, padding:"9px", borderRadius:10, border:"none",
          background:"rgba(52,211,153,0.14)", color:"#34d399",
          fontSize:13, fontWeight:800, cursor:"pointer", transition:"background 0.2s",
        }}>✅ Approve</button>
        <button className="pl-delete" onClick={onDelete} style={{
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