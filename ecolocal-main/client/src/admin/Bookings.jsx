import { useEffect, useState } from "react";
import { getAdminBookings, updateAdminBookingStatus, deleteAdminBooking } from "../services/bookingAdminService";

/* ─── EcoLocal Design Tokens ─── */
const T = {
  forestDeep: "#0d2110", forest: "#1a3d1f", forestMid: "#2c5c32",
  green: "#3d7845", greenBright: "#56a361", greenPale: "#a8d4ae",
  leaf: "#6dbf74", cream: "#f4f1e8", parchment: "#faf8f2",
  ink: "#0e1e10", inkSoft: "#4a6b4e", inkMuted: "#7a9b7e",
  danger: "#b91c1c", dangerBg: "rgba(185,28,28,0.08)", dangerBorder: "rgba(185,28,28,0.2)",
  amber: "#d97706", amberBg: "rgba(217,119,6,0.10)",
  blue: "#2563eb", blueBg: "rgba(37,99,235,0.08)",
};

/* ─── Status config ─── */
const STATUS_CONFIG = {
  PENDING:     { bg: "rgba(59,130,246,0.10)",  color: "#1d4ed8", border: "rgba(59,130,246,0.25)", label: "Pending"     },
  CONFIRMED:   { bg: "rgba(6,182,212,0.10)",   color: "#0e7490", border: "rgba(6,182,212,0.25)",  label: "Confirmed"   },
  IN_PROGRESS: { bg: T.amberBg,                color: T.amber,   border: "rgba(217,119,6,0.25)",  label: "In Progress" },
  COMPLETED:   { bg: "rgba(61,120,69,0.10)",   color: T.green,   border: "rgba(61,120,69,0.25)",  label: "Completed"   },
  CANCELLED:   { bg: T.dangerBg,               color: T.danger,  border: T.dangerBorder,           label: "Cancelled"   },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtPrice = (p) => p != null && p > 0 ? `₹${Number(p).toLocaleString("en-IN")}` : "—";

/* ─── Shared pill ─── */
const Pill = ({ cfg }) => (
  <span style={{
    display: "inline-block", padding: "3px 11px", borderRadius: "100px",
    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap",
  }}>{cfg.label}</span>
);

/* ─── Backdrop ─── */
const Backdrop = ({ onClose, children }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(13,33,16,0.72)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
  }}>
    <div onClick={(e) => e.stopPropagation()}>{children}</div>
  </div>
);

const CloseBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    position: "absolute", top: 14, right: 14,
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(0,0,0,0.07)", border: "none",
    cursor: "pointer", fontSize: 15, color: T.inkMuted,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>✕</button>
);

/* ═══════════════════════════════
   UPDATE STATUS MODAL
═══════════════════════════════ */
const UpdateStatusModal = ({ booking, token, onClose, onUpdated }) => {
  const [status, setStatus] = useState(booking.status || "PENDING");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    if (status === booking.status) { onClose(); return; }
    setSaving(true); setError("");
    try {
      const res = await updateAdminBookingStatus(booking._id, status, token);
      onUpdated(res.booking);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  return (
    <Backdrop onClose={onClose}>
      <div style={{
        background: T.parchment, borderRadius: "24px",
        padding: "36px 40px 32px", width: "100%", maxWidth: "380px",
        position: "relative", boxShadow: "0 24px 70px rgba(13,33,16,0.28)",
        border: "1px solid rgba(44,92,50,0.14)",
      }}>
        <CloseBtn onClick={onClose} />
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>📅</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: T.ink }}>Update Status</div>
          <div style={{ fontSize: "12px", color: T.inkMuted, marginTop: "4px" }}>
            <strong style={{ color: T.inkSoft }}>{booking.serviceName}</strong>
          </div>
        </div>
        <div style={{ marginBottom: "8px", fontSize: "12px", color: T.inkMuted }}>
          Current: <Pill cfg={STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: T.inkSoft, marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>New Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{
            width: "100%", padding: "10px 14px", borderRadius: "12px",
            border: "1.5px solid rgba(44,92,50,0.22)", background: "#fff",
            color: T.ink, fontSize: "14px", fontFamily: "'Outfit', sans-serif",
            outline: "none", cursor: "pointer",
          }}>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
        {error && <div style={{ color: T.danger, fontSize: "13px", marginBottom: "12px", padding: "8px 12px", background: T.dangerBg, borderRadius: "8px" }}>{error}</div>}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "transparent", border: "1.5px solid rgba(44,92,50,0.18)", borderRadius: "100px", color: T.inkSoft, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "10px", background: T.green, border: "none", borderRadius: "100px", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Update"}
          </button>
        </div>
      </div>
    </Backdrop>
  );
};

/* ═══════════════════════════════
   DELETE CONFIRM MODAL
═══════════════════════════════ */
const DeleteModal = ({ booking, token, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  const confirm = async () => {
    setDeleting(true); setError("");
    try {
      await deleteAdminBooking(booking._id, token);
      onDeleted(booking._id);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed");
    } finally { setDeleting(false); }
  };

  return (
    <Backdrop onClose={onClose}>
      <div style={{
        background: T.parchment, borderRadius: "28px",
        padding: "40px 44px", maxWidth: "400px", width: "100%",
        textAlign: "center", boxShadow: "0 24px 70px rgba(13,33,16,0.28)",
        border: "1px solid rgba(44,92,50,0.14)", position: "relative",
      }}>
        <CloseBtn onClick={onClose} />
        <div style={{ fontSize: "44px", marginBottom: "12px" }}>🗑️</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: T.ink, marginBottom: "8px" }}>Delete Booking?</div>
        <div style={{ fontSize: "14px", color: T.inkSoft, marginBottom: "28px", lineHeight: 1.7 }}>
          Booking for <strong>{booking.serviceName}</strong> will be permanently removed.
        </div>
        {error && <div style={{ color: T.danger, fontSize: "13px", marginBottom: "12px", padding: "8px 12px", background: T.dangerBg, borderRadius: "8px" }}>{error}</div>}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "10px 26px", background: "transparent", color: T.inkSoft, border: "1.5px solid rgba(44,92,50,0.22)", borderRadius: "100px", fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
          <button onClick={confirm} disabled={deleting} style={{ padding: "10px 26px", background: "#b91c1c", color: "#fff", border: "none", borderRadius: "100px", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", opacity: deleting ? 0.7 : 1, boxShadow: "0 4px 16px rgba(185,28,28,0.35)" }}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Backdrop>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN BOOKINGS PAGE
═══════════════════════════════════════════════════════════════════════ */
const Bookings = () => {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [page,     setPage]     = useState(1);

  /* Filters */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort,   setSort]   = useState("latest");

  /* Modals */
  const [statusTarget, setStatusTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ── Fetch ── */
  const fetchBookings = async (pg = page) => {
    setLoading(true);
    try {
      const res = await getAdminBookings({ status, sort, search, page: pg, limit: 12 }, token);
      const raw = res.bookings || [];
      const unique = Array.from(new Map(raw.map((b) => [String(b._id), b])).values());
      setBookings(unique);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBookings(1); setPage(1); }, [status, sort]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBookings(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings(1);
  };

  /* Optimistic updates */
  const onBookingUpdated = (updated) => {
    setBookings((prev) => prev.map((b) => b._id === updated._id ? updated : b));
  };
  const onBookingDeleted = (id) => {
    setBookings((prev) => prev.filter((b) => b._id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  const COLS = ["Booking ID", "Customer", "Service", "Provider", "Booked On", "Scheduled", "Completion", "Status", "Price", "Actions"];

  const inputStyle = {
    padding: "9px 16px", background: "#fff",
    border: "1.5px solid rgba(44,92,50,0.18)", borderRadius: "100px",
    color: T.ink, fontSize: "13px", outline: "none",
    fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "'Outfit', system-ui, sans-serif", color: T.ink }}>

      {/* ── Hero (blue-tinted to distinguish from orders) ── */}
      <div style={{
        background: `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(17,24,39,0) 0%, rgba(8,16,36,0.7) 100%),
                     radial-gradient(ellipse 100% 100% at 50% 50%, #0d1926 0%, #122040 40%, #1a3060 70%, #0d1a38 100%)`,
        padding: "52px 40px 44px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(ellipse 5% 7% at 20% 25%, rgba(96,165,250,0.15) 0%, transparent 100%), radial-gradient(ellipse 4% 6% at 75% 35%, rgba(59,130,246,0.12) 0%, transparent 100%)` }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#93c5fd", padding: "6px 16px", border: "1px solid rgba(147,197,253,0.28)", borderRadius: "100px", background: "rgba(37,99,235,0.20)", backdropFilter: "blur(8px)", marginBottom: "20px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 8px #60a5fa", flexShrink: 0 }} />
            Admin · EcoLocal
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#fff", margin: "0 0 6px", textShadow: "0 4px 24px rgba(0,0,0,0.4)", lineHeight: 1.1 }}>
            Booking <em style={{ fontStyle: "italic", fontWeight: 300, color: "#93c5fd" }}>Management</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 300, margin: 0 }}>
            {loading ? "Loading…" : `${total} total booking${total !== 1 ? "s" : ""} · Page ${page} of ${pages}`}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ background: T.parchment, borderBottom: "1px solid rgba(44,92,50,0.12)", padding: "16px 40px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flex: "1 1 300px" }}>
          <input
            type="text" placeholder="🔍  Search booking, user, service…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => (e.target.style.borderColor = T.blue)}
            onBlur={(e) => (e.target.style.borderColor = "rgba(44,92,50,0.18)")}
          />
          <button type="submit" style={{ padding: "9px 20px", background: T.blue, color: "#fff", border: "none", borderRadius: "100px", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>Search</button>
        </form>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>

        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="latest">🕐 Latest First</option>
          <option value="oldest">🕐 Oldest First</option>
          <option value="soonest">📅 Soonest Booking</option>
        </select>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ padding: "16px 40px 0", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {[
          { label: "Total",       count: total,                                        icon: "📅", color: T.blue   },
          { label: "Pending",     count: bookings.filter(b=>b.status==="PENDING").length,     icon: "🕐", color: "#1d4ed8" },
          { label: "In Progress", count: bookings.filter(b=>b.status==="IN_PROGRESS").length, icon: "⚙️", color: T.amber   },
          { label: "Completed",   count: bookings.filter(b=>b.status==="COMPLETED").length,   icon: "✅", color: T.green   },
          { label: "Cancelled",   count: bookings.filter(b=>b.status==="CANCELLED").length,   icon: "❌", color: T.danger  },
        ].map(({ label, count, icon, color }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid rgba(44,92,50,0.10)", borderRadius: "16px", padding: "11px 18px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 8px rgba(13,33,16,0.04)" }}>
            <span style={{ fontSize: "20px" }}>{icon}</span>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: "10px", color: T.inkMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ padding: "20px 40px 32px" }}>
        <div style={{ background: "#fff", border: "1px solid rgba(44,92,50,0.12)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 24px rgba(13,33,16,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(37,99,235,0.05)" }}>
                  {COLS.map((h) => (
                    <th key={h} style={{ padding: "13px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1e3a5f", borderBottom: "1px solid rgba(37,99,235,0.10)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={COLS.length} style={{ textAlign: "center", padding: "70px", color: T.inkMuted }}>⏳ Loading bookings…</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={COLS.length} style={{ textAlign: "center", padding: "70px", color: T.inkMuted }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
                    <div>No bookings found</div>
                  </td></tr>
                ) : bookings.map((b, i) => {
                  const scfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
                  const userName = b.user?.name || "—";
                  const userEmail = b.user?.email || "";
                  return (
                    <tr key={b._id}
                      style={{ transition: "background 0.18s", animation: `ecoFadeUp 0.3s ease ${i * 0.03}s both` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(37,99,235,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={TD}><span style={{ fontFamily: "monospace", fontSize: "12px", color: T.inkSoft }}>#{b._id.slice(-8).toUpperCase()}</span></td>
                      <td style={TD}>
                        <div style={{ fontWeight: 600, fontSize: "13.5px", color: T.ink }}>{userName}</div>
                        <div style={{ fontSize: "11.5px", color: T.inkMuted }}>{userEmail}</div>
                      </td>
                      <td style={TD}><span style={{ fontWeight: 500, fontSize: "13.5px", color: T.ink }}>{b.serviceName || "—"}</span></td>
                      <td style={TD}><span style={{ fontSize: "12.5px", color: T.inkSoft }}>🔧 {b.providerName || "—"}</span></td>
                      <td style={TD}><span style={{ fontSize: "12px", color: T.inkSoft }}>{fmtDate(b.createdAt)}</span></td>
                      <td style={TD}><span style={{ fontSize: "12px", color: T.inkSoft }}>{fmtDate(b.bookingDate)}</span></td>
                      <td style={TD}><span style={{ fontSize: "12px", color: T.inkSoft }}>{fmtDate(b.completionDate)}</span></td>
                      <td style={TD}><Pill cfg={scfg} /></td>
                      <td style={TD}><span style={{ fontSize: "13px", fontWeight: 700, color: T.blue }}>{fmtPrice(b.totalPrice)}</span></td>
                      <td style={TD}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <ABtn
                            onClick={() => setStatusTarget(b)}
                            bg={T.blueBg} hoverBg={T.blue}
                            color={T.blue} hoverColor="#fff"
                            border="rgba(37,99,235,0.22)"
                          >✏️ Status</ABtn>
                          <ABtn
                            onClick={() => setDeleteTarget(b)}
                            bg={T.dangerBg} hoverBg={T.danger}
                            color={T.danger} hoverColor="#fff"
                            border={T.dangerBorder}
                          >🗑️ Delete</ABtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px", flexWrap: "wrap" }}>
            <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</PageBtn>
            {[...Array(pages).keys()].map((x) => (
              <PageBtn key={x + 1} onClick={() => setPage(x + 1)} active={page === x + 1}>{x + 1}</PageBtn>
            ))}
            <PageBtn onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>›</PageBtn>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {statusTarget && (
        <UpdateStatusModal booking={statusTarget} token={token} onClose={() => setStatusTarget(null)} onUpdated={(updated) => { onBookingUpdated(updated); setStatusTarget(null); }} />
      )}
      {deleteTarget && (
        <DeleteModal booking={deleteTarget} token={token} onClose={() => setDeleteTarget(null)} onDeleted={onBookingDeleted} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,300&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes ecoFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: #7a9b7e; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-thumb { background:rgba(37,99,235,0.18); border-radius:3px; }
      `}</style>
    </div>
  );
};

/* ─── Shared cell style ─── */
const TD = { padding: "13px 14px", borderBottom: "1px solid rgba(44,92,50,0.07)", verticalAlign: "middle" };

/* ─── Action button ─── */
const ABtn = ({ onClick, bg, hoverBg, color, hoverColor, border, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "5px 12px", fontSize: "11.5px", fontWeight: 600,
        background: hov ? hoverBg : bg, color: hov ? hoverColor : color,
        border: `1px solid ${border}`, borderRadius: "100px",
        cursor: "pointer", transition: "all 0.18s", fontFamily: "'Outfit', sans-serif",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? "0 4px 10px rgba(0,0,0,0.10)" : "none",
        whiteSpace: "nowrap",
      }}
    >{children}</button>
  );
};

/* ─── Pagination button ─── */
const PageBtn = ({ onClick, disabled, active, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "36px", height: "36px", borderRadius: "100px",
        border: active ? "1.5px solid #2563eb" : "1px solid rgba(44,92,50,0.22)",
        background: active ? "#2563eb" : hov ? "rgba(37,99,235,0.06)" : "#fff",
        color: active ? "#fff" : "#4a6b4e",
        fontWeight: 600, fontSize: "13px", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1, transition: "all 0.18s",
        fontFamily: "'Outfit', sans-serif",
      }}
    >{children}</button>
  );
};

export default Bookings;
