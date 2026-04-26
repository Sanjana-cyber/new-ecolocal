// src/admin/AdminSidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin",          label: "Dashboard", icon: DashboardIcon },
  { to: "/admin/products", label: "Products",  icon: ProductsIcon  },
  { to: "/admin/services", label: "Services",  icon: ServicesIcon  },
  { to: "/admin/users",    label: "Users",     icon: UsersIcon     },
  { to: "/admin/orders",   label: "Orders",    icon: OrdersIcon    },
  { to: "/admin/bookings", label: "Bookings",  icon: BookingsIcon  },
];

/* ── SVG icons ── */
function DashboardIcon({ active }) {
  const c = active ? "rgba(168,212,174,0.8)" : "rgba(168,212,174,0.38)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? "rgba(168,212,174,0.55)" : "rgba(168,212,174,0.28)"}/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={c} opacity="0.6"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={c} opacity="0.6"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={c} opacity="0.6"/>
    </svg>
  );
}
function ProductsIcon({ active }) {
  const c = active ? "rgba(168,212,174,0.82)" : "rgba(168,212,174,0.40)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5 L8 2 L14 5 L14 11 L8 14 L2 11Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M8 2 L8 14" stroke={c} strokeWidth="0.8" opacity="0.5"/>
      <path d="M2 5 L14 5"  stroke={c} strokeWidth="0.8" opacity="0.5"/>
    </svg>
  );
}
function ServicesIcon({ active }) {
  const c = active ? "rgba(168,212,174,0.82)" : "rgba(168,212,174,0.40)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke={c} strokeWidth="1.2"/>
      <path d="M8 1v3M8 12v3M1 8h3M12 8h3" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.65"/>
      <path d="M3.5 3.5l2.1 2.1M10.4 10.4l2.1 2.1M12.5 3.5l-2.1 2.1M5.6 10.4l-2.1 2.1" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
    </svg>
  );
}
function UsersIcon({ active }) {
  const c = active ? "rgba(168,212,174,0.82)" : "rgba(168,212,174,0.40)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke={c} strokeWidth="1.2"/>
      <path d="M1 13C1 10.2 3.2 8 6 8s5 2.2 5 5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="12" cy="5.5" r="1.8" stroke={c} strokeWidth="1" opacity="0.6"/>
      <path d="M10 11.5C10.8 10.6 11.4 10.2 12 10.2c1.6 0 3 1.2 3 2.8" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}
function OrdersIcon({ active }) {
  const c = active ? "rgba(168,212,174,0.82)" : "rgba(168,212,174,0.40)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="2" stroke={c} strokeWidth="1.2"/>
      <path d="M5 5h6M5 8h6M5 11h4" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}
function BookingsIcon({ active }) {
  const c = active ? "rgba(168,212,174,0.82)" : "rgba(168,212,174,0.40)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="12" rx="2" stroke={c} strokeWidth="1.2"/>
      <path d="M5 1v4M11 1v4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M1 7h14" stroke={c} strokeWidth="1" opacity="0.5"/>
      <circle cx="5" cy="10.5" r="1" fill={c} opacity="0.7"/>
      <circle cx="8" cy="10.5" r="1" fill={c} opacity="0.7"/>
      <circle cx="11" cy="10.5" r="1" fill={c} opacity="0.4"/>
    </svg>
  );
}

const AdminSidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{
      width: "230px",
      minWidth: "230px",
      background: "#0d2110",
      borderRight: "1px solid rgba(109,191,116,0.10)",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>

      {/* Forest depth layers */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 80% 40% at 10% 15%, rgba(61,120,69,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 90% 70%, rgba(29,70,22,0.22) 0%, transparent 55%),
          radial-gradient(ellipse 40% 30% at 50% 95%, rgba(86,163,97,0.10) 0%, transparent 50%)
        `,
      }} />

      {/* Botanical vine line */}
      <div style={{
        position: "absolute", top: 80, bottom: 80, left: 20, width: 1, pointerEvents: "none",
        background: "linear-gradient(to bottom, transparent, rgba(109,191,116,0.15) 20%, rgba(109,191,116,0.25) 50%, rgba(109,191,116,0.15) 80%, transparent)",
      }} />

      {/* Decorative leaf */}
      <svg style={{ position:"absolute", top:36, right:8, width:52, height:68, opacity:0.055, pointerEvents:"none" }} viewBox="0 0 52 68">
        <path d="M26 2C42 8,50 24,44 44C38 58,26 64,16 60C6 56,2 44,4 30C6 16,14 4,26 2Z" fill="#6dbf74" transform="rotate(12,26,34)"/>
        <path d="M26 2C26 26,22 44,14 60" stroke="#a8d4ae" strokeWidth="1" fill="none" opacity="0.5"/>
      </svg>

      {/* ── Brand ── */}
      <div style={{
        padding: "22px 20px 18px",
        borderBottom: "1px solid rgba(109,191,116,0.10)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          {/* Leaf logo mark */}
          <svg width="30" height="30" viewBox="0 0 30 30" style={{ flexShrink:0 }}>
            <path d="M15 2C22 6,27 13,25 20C23 26,17 29,11 27C5 25,1 19,3 12C5 5,10 1,15 2Z" fill="#3d7845"/>
            <path d="M15 2C15 13,13 21,9 27" stroke="#a8d4ae" strokeWidth="1.1" fill="none" opacity="0.55"/>
            <path d="M15 9C17.5 11,20 13,22 17" stroke="#a8d4ae" strokeWidth="0.8" fill="none" opacity="0.35"/>
          </svg>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 17, fontWeight: 500,
            color: "#f4f1e8", letterSpacing:"0.01em",
          }}>
            Eco<em style={{ fontStyle:"italic", fontWeight:300, color:"#a8d4ae" }}>Local</em>
          </span>
        </div>
        <div style={{
          fontSize: 9, fontWeight: 500, letterSpacing:"0.28em",
          textTransform:"uppercase", color:"rgba(168,212,174,0.30)",
          paddingLeft: 40,
        }}>Admin Panel</div>
      </div>

      {/* ── Nav ── */}
      <nav style={{
        flex: 1, padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: 2,
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontSize: 8.5, fontWeight: 500, letterSpacing: "0.26em",
          textTransform: "uppercase", color: "rgba(168,212,174,0.22)",
          padding: "8px 4px 4px",
        }}>Navigation</div>

        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/admin"
              ? location.pathname === "/admin" || location.pathname === "/admin/"
              : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex", alignItems: "center", gap: 0,
                borderRadius: 10, textDecoration: "none", position: "relative",
                overflow: "hidden",
                background: isActive ? "rgba(61,120,69,0.20)" : "transparent",
                border: isActive
                  ? "1px solid rgba(109,191,116,0.20)"
                  : "1px solid transparent",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(109,191,116,0.08)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <div style={{
                  position:"absolute", left:0, top:0, bottom:0, width:3,
                  background:"linear-gradient(to bottom, #56a361, #3d7845)",
                  borderRadius:"0 2px 2px 0",
                }}/>
              )}

              {/* Icon */}
              <div style={{ width:38, height:40, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon active={isActive} />
              </div>

              {/* Label */}
              <span style={{
                flex: 1, padding: "10px 12px 10px 0",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#edf4ee" : "rgba(237,244,238,0.42)",
                letterSpacing: "0.01em", lineHeight: 1,
                transition: "color 0.18s",
              }}>{label}</span>

              {/* Active organic dot */}
              {isActive && (
                <div style={{
                  width:6, height:6, borderRadius:"50% 50% 40% 60% / 50% 40% 60% 50%",
                  background:"#6dbf74", marginRight:12, flexShrink:0,
                  boxShadow:"0 0 6px rgba(109,191,116,0.55)",
                }}/>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ padding:"12px 12px 18px", position:"relative", zIndex:1 }}>
        <div style={{ height:1, background:"rgba(109,191,116,0.08)", marginBottom:10 }} />

        {/* User pill */}
        <div style={{
          display:"flex", alignItems:"center", gap:9,
          padding:"8px 10px", borderRadius:10,
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(109,191,116,0.08)",
          marginBottom:8,
        }}>
          <div style={{
            width:28, height:28,
            borderRadius:"50% 50% 40% 60% / 50% 40% 60% 50%",
            background:"linear-gradient(135deg, #3d7845, #1a3d1f)",
            border:"1px solid rgba(109,191,116,0.30)",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0,
            fontFamily:"'Playfair Display', serif",
            fontSize:11, fontStyle:"italic", color:"#a8d4ae",
          }}>A</div>
          <span style={{
            fontSize:12, fontWeight:400,
            color:"rgba(237,244,238,0.48)",
            flex:1, whiteSpace:"nowrap",
            overflow:"hidden", textOverflow:"ellipsis",
          }}>Admin</span>
          <div style={{
            width:5, height:5, borderRadius:"50%",
            background:"#6dbf74", flexShrink:0,
          }}/>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width:"100%", display:"flex", alignItems:"center", gap:9,
            padding:"9px 12px",
            background:"rgba(239,68,68,0.08)",
            border:"1px solid rgba(239,68,68,0.18)",
            borderRadius:10, color:"rgba(248,113,113,0.80)",
            fontFamily:"'Outfit', sans-serif",
            fontSize:12, fontWeight:400, cursor:"pointer",
            letterSpacing:"0.02em", transition:"all 0.18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.32)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.18)";
            e.currentTarget.style.color = "rgba(248,113,113,0.80)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L14 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M6 2H3C2.4 2 2 2.4 2 3V13C2 13.6 2.4 14 3 14H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Logout
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,300&family=Outfit:wght@300;400;500&display=swap');
      `}</style>
    </div>
  );
};

export default AdminSidebar;