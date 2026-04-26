import { useEffect, useState } from "react";
import {
  getAllUsers,
  changeUserRole,
  getUserOrders,
  getUserBookings,
} from "../services/userManagementService";

/* ─── EcoLocal "Forest Immersion" Design Tokens ─── */
const T = {
  forestDeep: "#0d2110",
  forest: "#1a3d1f",
  forestMid: "#2c5c32",
  green: "#3d7845",
  greenBright: "#56a361",
  greenPale: "#a8d4ae",
  leaf: "#6dbf74",
  cream: "#f4f1e8",
  creamDark: "#e8e4d8",
  parchment: "#faf8f2",
  ink: "#0e1e10",
  inkSoft: "#4a6b4e",
  inkMuted: "#7a9b7e",
  danger: "#b91c1c",
  dangerBg: "rgba(185,28,28,0.08)",
  dangerBorder: "rgba(185,28,28,0.2)",
  amber: "#d97706",
  amberBg: "rgba(217,119,6,0.10)",
  purple: "#7c3aed",
  purpleBg: "rgba(124,58,237,0.10)",
};

/* ─── Role Badge Config ─── */
const roleBadge = (role) => {
  if (role === "admin")
    return { bg: T.purpleBg, color: T.purple, border: "rgba(124,58,237,0.22)", label: "Admin" };
  if (role === "provider")
    return { bg: T.amberBg, color: T.amber, border: "rgba(217,119,6,0.22)", label: "Provider" };
  return { bg: "rgba(61,120,69,0.09)", color: T.green, border: "rgba(61,120,69,0.2)", label: "User" };
};

/* ─── Order Status Badge Config ─── */
const orderStatusBadge = (status) => {
  const map = {
    PLACED: { bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", border: "rgba(59,130,246,0.22)" },
    CONFIRMED: { bg: "rgba(6,182,212,0.1)", color: "#0e7490", border: "rgba(6,182,212,0.22)" },
    PACKED: { bg: "rgba(234,179,8,0.1)", color: "#a16207", border: "rgba(234,179,8,0.22)" },
    SHIPPED: { bg: T.amberBg, color: T.amber, border: "rgba(217,119,6,0.22)" },
    DELIVERED: { bg: "rgba(61,120,69,0.09)", color: T.green, border: "rgba(61,120,69,0.2)" },
    CANCELLED: { bg: T.dangerBg, color: T.danger, border: T.dangerBorder },
  };
  return map[status] || map.PLACED;
};

/* ─── Booking Status Badge Config ─── */
const bookingStatusBadge = (status) => {
  const map = {
    PENDING: { bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", border: "rgba(59,130,246,0.22)" },
    CONFIRMED: { bg: "rgba(6,182,212,0.1)", color: "#0e7490", border: "rgba(6,182,212,0.22)" },
    IN_PROGRESS: { bg: T.amberBg, color: T.amber, border: "rgba(217,119,6,0.22)" },
    COMPLETED: { bg: "rgba(61,120,69,0.09)", color: T.green, border: "rgba(61,120,69,0.2)" },
    CANCELLED: { bg: T.dangerBg, color: T.danger, border: T.dangerBorder },
  };
  return map[status] || map.PENDING;
};

/* ─── Helpers ─── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const Pill = ({ bg, color, border, label }) => (
  <span style={{
    display: "inline-block",
    background: bg, color, border: `1px solid ${border}`,
    borderRadius: "100px", padding: "3px 11px",
    fontSize: "11.5px", fontWeight: 600,
    letterSpacing: "0.04em",
  }}>{label}</span>
);

const CountBadge = ({ count, color = T.green }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: "28px", height: "22px", borderRadius: "100px",
    background: count > 0 ? "rgba(61,120,69,0.10)" : "rgba(0,0,0,0.04)",
    color: count > 0 ? color : T.inkMuted,
    fontSize: "12px", fontWeight: 700,
    border: `1px solid ${count > 0 ? "rgba(61,120,69,0.18)" : "rgba(0,0,0,0.08)"}`,
    padding: "0 8px",
  }}>{count}</span>
);

/* ─── Btn helper ─── */
const ActionBtn = ({ onClick, bg, hoverBg, color, hoverColor, border, children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "6px 14px",
        background: hov ? hoverBg : bg,
        color: hov ? hoverColor : color,
        border: `1px solid ${border}`,
        borderRadius: "100px",
        fontSize: "12px", fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.18s",
        fontFamily: "'Outfit', system-ui, sans-serif",
        transform: hov ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hov ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
        whiteSpace: "nowrap",
      }}
    >{children}</button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════════════════════ */

/* ── Backdrop ── */
const Backdrop = ({ onClose, children }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(13,33,16,0.70)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}
  >
    <div onClick={(e) => e.stopPropagation()}>{children}</div>
  </div>
);

/* ── Close button ── */
const CloseBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    position: "absolute", top: 16, right: 16,
    width: 30, height: 30, borderRadius: "50%",
    background: "rgba(0,0,0,0.06)", border: "none",
    cursor: "pointer", fontSize: 16, color: T.inkMuted,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.18s",
  }}>✕</button>
);

/* ─────────────────────────────────────────────
   CHANGE ROLE MODAL
───────────────────────────────────────────── */
const ChangeRoleModal = ({ user, token, onClose, onSuccess }) => {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (role === user.role) { onClose(); return; }
    setSaving(true); setError("");
    try {
      await changeUserRole(user._id, role, token);
      onSuccess(user._id, role);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update role");
    } finally { setSaving(false); }
  };

  return (
    <Backdrop onClose={onClose}>
      <div style={{
        background: T.parchment,
        border: "1px solid rgba(44,92,50,0.16)",
        borderRadius: "24px",
        padding: "36px 40px 32px",
        width: "100%", maxWidth: "380px",
        position: "relative",
        boxShadow: "0 24px 70px rgba(13,33,16,0.28)",
      }}>
        <CloseBtn onClick={onClose} />

        {/* Icon + Title */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "38px", marginBottom: "8px" }}>🔐</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 700, color: T.ink }}>
            Change Role
          </div>
          <div style={{ fontSize: "13px", color: T.inkMuted, marginTop: "4px" }}>
            for <strong style={{ color: T.inkSoft }}>{user.name}</strong>
          </div>
        </div>

        {/* Current role chip */}
        <div style={{ marginBottom: "16px", fontSize: "12px", color: T.inkMuted }}>
          Current role: <Pill {...roleBadge(user.role)} />
        </div>

        {/* Dropdown */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: T.inkSoft, marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            New Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: "12px",
              border: `1.5px solid rgba(44,92,50,0.22)`,
              background: "#fff",
              color: T.ink, fontSize: "14px",
              fontFamily: "'Outfit', system-ui, sans-serif",
              outline: "none", cursor: "pointer",
              appearance: "auto",
            }}
          >
            <option value="user"> User</option>
            <option value="admin"> Admin</option>

          </select>
        </div>

        {error && (
          <div style={{ color: T.danger, fontSize: "13px", marginBottom: "12px", padding: "8px 12px", background: T.dangerBg, borderRadius: "8px" }}>{error}</div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", background: "transparent",
            border: "1.5px solid rgba(44,92,50,0.18)", borderRadius: "100px",
            color: T.inkSoft, fontWeight: 500, fontSize: "13px", cursor: "pointer",
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, padding: "10px", background: T.green,
            border: "none", borderRadius: "100px",
            color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer",
            fontFamily: "'Outfit', system-ui, sans-serif",
            opacity: saving ? 0.7 : 1,
          }}>{saving ? "Saving…" : "Save Role"}</button>
        </div>
      </div>
    </Backdrop>
  );
};

/* ─────────────────────────────────────────────
   VIEW ORDERS MODAL
───────────────────────────────────────────── */
const OrdersModal = ({ user, token, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserOrders(user._id, token);
        setData(res);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load orders");
      } finally { setLoading(false); }
    })();
  }, [user._id, token]);

  return (
    <Backdrop onClose={onClose}>
      <div style={{
        background: T.parchment,
        border: "1px solid rgba(44,92,50,0.16)",
        borderRadius: "24px",
        width: "100%", maxWidth: "680px",
        maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        position: "relative",
        boxShadow: "0 24px 70px rgba(13,33,16,0.28)",
        overflow: "hidden",
      }}>
        <CloseBtn onClick={onClose} />

        {/* Header */}
        <div style={{
          padding: "24px 32px 20px",
          borderBottom: "1px solid rgba(44,92,50,0.10)",
          background: `linear-gradient(135deg, ${T.forest} 0%, ${T.forestMid} 100%)`,
        }}>
          <div style={{ fontSize: "13px", color: T.greenPale, fontWeight: 500, marginBottom: "4px" }}>
            📦 Orders for
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            {user.name}
          </div>
          {!loading && data && (
            <div style={{ marginTop: "8px" }}>
              <CountBadge count={data.totalOrders} />
              <span style={{ marginLeft: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                total order{data.totalOrders !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: T.inkMuted }}>⏳ Loading orders…</div>
          ) : error ? (
            <div style={{ color: T.danger, textAlign: "center", padding: "30px" }}>{error}</div>
          ) : !data?.orders?.length ? (
            <div style={{ textAlign: "center", padding: "50px", color: T.inkMuted }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
              <div>No orders found for this user.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.orders.map((order, i) => {
                const sb = orderStatusBadge(order.status);
                return (
                  <div key={order._id} style={{
                    background: "#fff",
                    border: "1px solid rgba(44,92,50,0.10)",
                    borderRadius: "16px",
                    padding: "16px 18px",
                    boxShadow: "0 2px 8px rgba(13,33,16,0.04)",
                    animation: `ecoFadeUp 0.3s ease ${i * 0.04}s both`,
                  }}>
                    {/* Order header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <div style={{ fontSize: "11px", color: T.inkMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Order ID</div>
                        <div style={{ fontSize: "12px", color: T.inkSoft, fontFamily: "monospace" }}>#{order._id.slice(-8).toUpperCase()}</div>
                      </div>
                      <Pill {...sb} label={order.status} />
                    </div>

                    {/* Items */}
                    <div style={{ borderTop: "1px solid rgba(44,92,50,0.08)", paddingTop: "10px" }}>
                      {order.orderItems.map((item, j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                          <span style={{ fontSize: "13.5px", color: T.ink, fontWeight: 500 }}>{item.name}</span>
                          <span style={{ fontSize: "12.5px", color: T.inkSoft }}>
                            ×{item.quantity} &nbsp;—&nbsp; <strong>₹{(item.price * item.quantity).toLocaleString()}</strong>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Dates + Total */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(44,92,50,0.08)" }}>
                      <div>
                        <div style={{ fontSize: "11px", color: T.inkMuted, marginBottom: "2px" }}>Ordered</div>
                        <div style={{ fontSize: "12.5px", color: T.inkSoft }}>{fmtDate(order.orderedAt)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: T.inkMuted, marginBottom: "2px" }}>Delivered</div>
                        <div style={{ fontSize: "12.5px", color: T.inkSoft }}>{fmtDate(order.deliveredAt)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "11px", color: T.inkMuted, marginBottom: "2px" }}>Total</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: T.green }}>₹{order.totalPrice?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Backdrop>
  );
};

/* ─────────────────────────────────────────────
   VIEW BOOKINGS MODAL
───────────────────────────────────────────── */
const BookingsModal = ({ user, token, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserBookings(user._id, token);
        setData(res);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load bookings");
      } finally { setLoading(false); }
    })();
  }, [user._id, token]);

  return (
    <Backdrop onClose={onClose}>
      <div style={{
        background: T.parchment,
        border: "1px solid rgba(44,92,50,0.16)",
        borderRadius: "24px",
        width: "100%", maxWidth: "680px",
        maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        position: "relative",
        boxShadow: "0 24px 70px rgba(13,33,16,0.28)",
        overflow: "hidden",
      }}>
        <CloseBtn onClick={onClose} />

        {/* Header */}
        <div style={{
          padding: "24px 32px 20px",
          borderBottom: "1px solid rgba(44,92,50,0.10)",
          background: `linear-gradient(135deg, #1a2a4a 0%, #1e3a5f 100%)`,
        }}>
          <div style={{ fontSize: "13px", color: "#93c5fd", fontWeight: 500, marginBottom: "4px" }}>
            📅 Bookings for
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            {user.name}
          </div>
          {!loading && data && (
            <div style={{ marginTop: "8px" }}>
              <CountBadge count={data.totalBookings} color="#3b82f6" />
              <span style={{ marginLeft: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                total booking{data.totalBookings !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: T.inkMuted }}>⏳ Loading bookings…</div>
          ) : error ? (
            <div style={{ color: T.danger, textAlign: "center", padding: "30px" }}>{error}</div>
          ) : !data?.bookings?.length ? (
            <div style={{ textAlign: "center", padding: "50px", color: T.inkMuted }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
              <div>No bookings found for this user.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.bookings.map((bk, i) => {
                const sb = bookingStatusBadge(bk.status);
                return (
                  <div key={bk._id} style={{
                    background: "#fff",
                    border: "1px solid rgba(44,92,50,0.10)",
                    borderRadius: "16px",
                    padding: "16px 18px",
                    boxShadow: "0 2px 8px rgba(13,33,16,0.04)",
                    animation: `ecoFadeUp 0.3s ease ${i * 0.04}s both`,
                  }}>
                    {/* Header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: T.ink }}>{bk.serviceName}</div>
                        <div style={{ fontSize: "12.5px", color: T.inkSoft, marginTop: "2px" }}>
                          🔧 {bk.provider}
                        </div>
                      </div>
                      <Pill {...sb} label={bk.status.replace("_", " ")} />
                    </div>

                    {/* Dates + Price */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(44,92,50,0.08)" }}>
                      <div>
                        <div style={{ fontSize: "11px", color: T.inkMuted, marginBottom: "2px" }}>Booked</div>
                        <div style={{ fontSize: "12.5px", color: T.inkSoft }}>{fmtDate(bk.bookingDate)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: T.inkMuted, marginBottom: "2px" }}>Completion</div>
                        <div style={{ fontSize: "12.5px", color: T.inkSoft }}>{fmtDate(bk.completionDate)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "11px", color: T.inkMuted, marginBottom: "2px" }}>Price</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1d4ed8" }}>
                          {bk.totalPrice ? `₹${bk.totalPrice.toLocaleString()}` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Backdrop>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════════ */
const Users = () => {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  /* Modal state */
  const [roleTarget, setRoleTarget] = useState(null); // user obj
  const [ordersTarget, setOrdersTarget] = useState(null);
  const [bookingsTarget, setBookingsTarget] = useState(null);

  /* ── Fetch users — runs ONCE on mount only ── */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(token);
      // Defensive: deduplicate by _id in case API or StrictMode returns duplicates
      const raw = res.users || [];
      const uniqueUsers = Array.from(
        new Map(raw.map((u) => [String(u._id), u])).values()
      );
      setUsers(uniqueUsers);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, []);

  /* ── Optimistic role update ── */
  const onRoleUpdate = (id, newRole) => {
    setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: newRole } : u));
  };

  /* ── Filter ── */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* ─── Table columns ─── */
  const COLS = ["Name", "Email", "Role", "Joined", "Orders", "Bookings", "Change Role", "Actions"];

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "'Outfit', system-ui, sans-serif", color: T.ink }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(26,61,31,0) 0%, rgba(8,24,10,0.7) 100%),
                     radial-gradient(ellipse 100% 100% at 50% 50%, #0d2e10 0%, #1a4d1c 40%, #2c6b30 70%, #1a4018 100%)`,
        padding: "52px 40px 44px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* canopy glows */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            radial-gradient(ellipse 4% 6% at 15% 20%, rgba(109,191,116,0.18) 0%, transparent 100%),
            radial-gradient(ellipse 5% 7% at 80% 30%, rgba(86,163,97,0.14) 0%, transparent 100%),
            radial-gradient(ellipse 3% 5% at 50% 10%, rgba(109,191,116,0.12) 0%, transparent 100%)`,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontSize: "11px", fontWeight: 500, letterSpacing: "0.2em",
            textTransform: "uppercase", color: T.greenPale,
            padding: "6px 16px",
            border: "1px solid rgba(168,212,174,0.28)",
            borderRadius: "100px",
            background: "rgba(61,120,69,0.22)",
            backdropFilter: "blur(8px)",
            marginBottom: "20px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.leaf, boxShadow: `0 0 8px ${T.leaf}`, flexShrink: 0 }} />
            Admin · EcoLocal
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700, color: "#fff",
              margin: "0 0 6px",
              textShadow: "0 4px 24px rgba(0,0,0,0.4)",
              lineHeight: 1.1,
            }}>
              User <em style={{ fontStyle: "italic", fontWeight: 300, color: T.greenPale }}>Management</em>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 300, margin: 0 }}>
              {loading ? "Loading…" : `${users.length} registered user${users.length !== 1 ? "s" : ""} · ${filtered.length} shown`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{
        background: T.parchment,
        borderBottom: "1px solid rgba(44,92,50,0.12)",
        padding: "16px 40px",
        display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
      }}>
        <input
          id="user-search"
          type="text"
          placeholder="🔍  Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 240px", padding: "9px 18px",
            background: "#fff", border: "1.5px solid rgba(44,92,50,0.18)",
            borderRadius: "100px", color: T.ink, fontSize: "13.5px",
            outline: "none", fontFamily: "'Outfit', system-ui, sans-serif",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = T.green)}
          onBlur={(e) => (e.target.style.borderColor = "rgba(44,92,50,0.18)")}
        />
        <select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: "9px 18px",
            background: "#fff", border: "1.5px solid rgba(44,92,50,0.18)",
            borderRadius: "100px", color: T.ink, fontSize: "13.5px",
            outline: "none", cursor: "pointer",
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          <option value="">All Roles</option>
          <option value="user"> User</option>
          <option value="admin"> Admin</option>

        </select>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ padding: "16px 40px 0", display: "flex", gap: "14px", flexWrap: "wrap" }}>
        {[
          { label: "Total Users", count: users.length, icon: "👥", color: T.green },
          { label: "Admins", count: users.filter(u => u.role === "admin").length, icon: "🛡️", color: T.purple },
          // { label: "Providers", count: users.filter(u => u.role === "provider").length, icon: "🔧", color: T.amber  },
          { label: "Users", count: users.filter(u => u.role === "user").length, icon: "👤", color: T.green },
        ].map(({ label, count, icon, color }) => (
          <div key={label} style={{
            background: "#fff",
            border: "1px solid rgba(44,92,50,0.10)",
            borderRadius: "16px",
            padding: "12px 20px",
            display: "flex", alignItems: "center", gap: "12px",
            boxShadow: "0 2px 8px rgba(13,33,16,0.04)",
            minWidth: "140px",
          }}>
            <span style={{ fontSize: "22px" }}>{icon}</span>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: "11px", color: T.inkMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ padding: "20px 40px 40px" }}>
        <div style={{
          background: "#fff",
          border: "1px solid rgba(44,92,50,0.12)",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(13,33,16,0.06)",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(61,120,69,0.07)" }}>
                  {COLS.map((h) => (
                    <th key={h} style={{
                      padding: "13px 16px", textAlign: "left",
                      fontSize: "11px", fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: T.forestMid,
                      borderBottom: "1px solid rgba(44,92,50,0.12)",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={COLS.length} style={{ textAlign: "center", padding: "70px", color: T.inkMuted, fontSize: "15px" }}>
                    ⏳ Loading users…
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={COLS.length} style={{ textAlign: "center", padding: "70px", color: T.inkMuted }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>👤</div>
                    <div>No users found</div>
                  </td></tr>
                ) : filtered.map((u, i) => {
                  const rb = roleBadge(u.role);
                  return (
                    <tr
                      key={u._id}
                      style={{ transition: "background 0.18s", animation: `ecoFadeUp 0.3s ease ${i * 0.035}s both` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(61,120,69,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Name */}
                      <td style={TD}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "34px", height: "34px", borderRadius: "50%",
                            background: `linear-gradient(135deg, ${T.green}, ${T.forestMid})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: "14px",
                            border: "2px solid rgba(61,120,69,0.2)",
                            flexShrink: 0,
                          }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: T.ink, fontSize: "14px" }}>{u.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={TD}>
                        <span style={{ color: T.inkSoft, fontSize: "13px" }}>{u.email}</span>
                      </td>

                      {/* Role */}
                      <td style={TD}>
                        <Pill {...rb} />
                      </td>

                      {/* Joined */}
                      <td style={TD}>
                        <span style={{ fontSize: "13px", color: T.inkSoft }}>{fmtDate(u.createdAt)}</span>
                      </td>

                      {/* Orders count */}
                      <td style={TD}>
                        <CountBadge count={u.totalOrders} />
                      </td>

                      {/* Bookings count */}
                      <td style={TD}>
                        <CountBadge count={u.totalBookings} color="#3b82f6" />
                      </td>

                      {/* Change Role */}
                      <td style={TD}>
                        <ActionBtn
                          onClick={() => setRoleTarget(u)}
                          bg={T.purpleBg}
                          hoverBg={T.purple}
                          color={T.purple}
                          hoverColor="#fff"
                          border="rgba(124,58,237,0.25)"
                        >
                          🔐 Change Role
                        </ActionBtn>
                      </td>

                      {/* Actions */}
                      <td style={TD}>
                        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                          <ActionBtn
                            onClick={() => setOrdersTarget(u)}
                            bg="rgba(61,120,69,0.08)"
                            hoverBg={T.green}
                            color={T.green}
                            hoverColor="#fff"
                            border="rgba(61,120,69,0.22)"
                          >
                            📦 Orders
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => setBookingsTarget(u)}
                            bg="rgba(59,130,246,0.08)"
                            hoverBg="#3b82f6"
                            color="#1d4ed8"
                            hoverColor="#fff"
                            border="rgba(59,130,246,0.22)"
                          >
                            📅 Bookings
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {roleTarget && (
        <ChangeRoleModal
          user={roleTarget}
          token={token}
          onClose={() => setRoleTarget(null)}
          onSuccess={onRoleUpdate}
        />
      )}
      {ordersTarget && (
        <OrdersModal
          user={ordersTarget}
          token={token}
          onClose={() => setOrdersTarget(null)}
        />
      )}
      {bookingsTarget && (
        <BookingsModal
          user={bookingsTarget}
          token={token}
          onClose={() => setBookingsTarget(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes ecoFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #7a9b7e; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(61,120,69,0.22); border-radius: 3px; }
      `}</style>
    </div>
  );
};

/* ─── Shared TD style ─── */
const TD = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(44,92,50,0.07)",
  verticalAlign: "middle",
};

export default Users;
