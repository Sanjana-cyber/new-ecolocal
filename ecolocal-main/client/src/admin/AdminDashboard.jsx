import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

/* ─── Design Tokens ─── */
const T = {
  forestDeep: "#0d2110", forest: "#1a3d1f", forestMid: "#2c5c32",
  green: "#3d7845", greenBright: "#56a361", greenPale: "#a8d4ae",
  leaf: "#6dbf74", cream: "#f4f1e8", parchment: "#faf8f2",
  ink: "#0e1e10", inkSoft: "#4a6b4e", inkMuted: "#7a9b7e",
  danger: "#b91c1c", amber: "#d97706",
  blue: "#2563eb", purple: "#7c3aed",
  white: "#ffffff",
};

/* ─── Color palettes for charts ─── */
const ORDER_COLORS  = { PLACED:"#3b82f6", CONFIRMED:"#06b6d4", PACKED:"#eab308", SHIPPED:"#d97706", DELIVERED:"#3d7845", CANCELLED:"#b91c1c" };
const BOOKING_COLORS= { PENDING:"#3b82f6", CONFIRMED:"#06b6d4", IN_PROGRESS:"#d97706", "IN PROGRESS":"#d97706", COMPLETED:"#3d7845", CANCELLED:"#b91c1c" };
const CAT_PALETTE   = ["#3d7845","#56a361","#6dbf74","#a8d4ae","#2c5c32","#d97706","#7c3aed","#2563eb","#06b6d4","#eab308"];

const fmtINR  = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "—";

/* ─── Summary card ─── */
const StatCard = ({ icon, label, value, sub, accent, delay = 0 }) => (
  <div style={{
    background: T.white,
    border: "1px solid rgba(44,92,50,0.10)",
    borderRadius: "20px",
    padding: "22px 24px",
    boxShadow: "0 4px 20px rgba(13,33,16,0.06)",
    display: "flex", flexDirection: "column", gap: "8px",
    animation: `ecoFadeUp 0.4s ease ${delay}s both`,
    position: "relative", overflow: "hidden",
    flex: "1 1 160px",
    minWidth: "160px",
  }}>
    {/* accent line */}
    <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background: accent, borderRadius:"20px 20px 0 0" }} />
    <div style={{ fontSize:"28px", lineHeight:1 }}>{icon}</div>
    <div style={{ fontSize:"28px", fontWeight:700, color: accent, lineHeight:1, marginTop:"4px" }}>{value}</div>
    <div style={{ fontSize:"13px", fontWeight:600, color: T.inkSoft, letterSpacing:"0.02em" }}>{label}</div>
    {sub && <div style={{ fontSize:"11px", color: T.inkMuted }}>{sub}</div>}
  </div>
);

/* ─── Chart container card ─── */
const ChartCard = ({ title, sub, children, delay = 0 }) => (
  <div style={{
    background: T.white,
    border: "1px solid rgba(44,92,50,0.10)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(13,33,16,0.06)",
    animation: `ecoFadeUp 0.4s ease ${delay}s both`,
  }}>
    <div style={{ marginBottom:"18px" }}>
      <div style={{ fontSize:"15px", fontWeight:700, color: T.ink }}>{title}</div>
      {sub && <div style={{ fontSize:"12px", color: T.inkMuted, marginTop:"2px" }}>{sub}</div>}
    </div>
    {children}
  </div>
);

/* ─── Recharts custom tooltip ─── */
const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid rgba(44,92,50,0.15)", borderRadius:"12px", padding:"10px 14px", boxShadow:"0 8px 24px rgba(13,33,16,0.12)", fontSize:"13px" }}>
      <div style={{ fontWeight:600, color: T.ink, marginBottom:"4px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight:500 }}>
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
        </div>
      ))}
    </div>
  );
};

/* ─── Pie custom label ─── */
const PieLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r  = outerRadius + 22;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill={T.inkSoft} textAnchor={x > cx ? "start" : "end"} fontSize={11} fontWeight={500} fontFamily="'Outfit', sans-serif">
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

/* ─── Status row for "recent orders" table ─── */
const STATUS_CFG = {
  PLACED:    { bg:"rgba(59,130,246,0.1)",  color:"#1d4ed8", border:"rgba(59,130,246,0.22)" },
  CONFIRMED: { bg:"rgba(6,182,212,0.1)",   color:"#0e7490", border:"rgba(6,182,212,0.22)"  },
  PACKED:    { bg:"rgba(234,179,8,0.1)",   color:"#a16207", border:"rgba(234,179,8,0.22)"  },
  SHIPPED:   { bg:"rgba(217,119,6,0.1)",   color:"#d97706", border:"rgba(217,119,6,0.22)"  },
  DELIVERED: { bg:"rgba(61,120,69,0.1)",   color:"#3d7845", border:"rgba(61,120,69,0.22)"  },
  CANCELLED: { bg:"rgba(185,28,28,0.08)",  color:"#b91c1c", border:"rgba(185,28,28,0.2)"   },
};
const SPill = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PLACED;
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:"100px", background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontSize:"11px", fontWeight:600 }}>
      {status}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
═══════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  /* ── Fetch ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard data");
        console.error("Dashboard stats error:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ minHeight:"100vh", background: T.cream, fontFamily:"'Outfit', system-ui, sans-serif", color: T.ink }}>

      {/* ── Hero ── */}
      <div style={{
        background: `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(26,61,31,0) 0%, rgba(8,24,10,0.7) 100%),
                     radial-gradient(ellipse 100% 100% at 50% 50%, #0d2e10 0%, #1a4d1c 40%, #2c6b30 70%, #1a4018 100%)`,
        padding: "52px 40px 44px", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:`radial-gradient(ellipse 4% 6% at 15% 20%, rgba(109,191,116,0.18) 0%, transparent 100%), radial-gradient(ellipse 5% 7% at 80% 30%, rgba(86,163,97,0.14) 0%, transparent 100%)` }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", fontSize:"11px", fontWeight:500, letterSpacing:"0.2em", textTransform:"uppercase", color: T.greenPale, padding:"6px 16px", border:"1px solid rgba(168,212,174,0.28)", borderRadius:"100px", background:"rgba(61,120,69,0.22)", backdropFilter:"blur(8px)", marginBottom:"20px" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background: T.leaf, boxShadow:`0 0 8px ${T.leaf}`, flexShrink:0 }} />
            Admin · EcoLocal
          </div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:700, color:"#fff", margin:"0 0 6px", textShadow:"0 4px 24px rgba(0,0,0,0.4)", lineHeight:1.1 }}>
            Analytics <em style={{ fontStyle:"italic", fontWeight:300, color: T.greenPale }}>Dashboard</em>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", fontWeight:300, margin:0 }}>
            {loading ? "Loading analytics…" : "Live data from your EcoLocal platform"}
          </p>
        </div>
      </div>

      <div style={{ padding:"32px 40px 48px", display:"flex", flexDirection:"column", gap:"28px" }}>

        {/* ── Loading / Error states ── */}
        {loading && (
          <div style={{ textAlign:"center", padding:"60px", color: T.inkMuted, fontSize:"15px" }}>
            <div style={{ fontSize:"40px", marginBottom:"12px" }}>⏳</div>
            Loading dashboard data…
          </div>
        )}

        {error && !loading && (
          <div style={{ padding:"24px", background:"rgba(185,28,28,0.06)", border:"1px solid rgba(185,28,28,0.2)", borderRadius:"16px", color: T.danger, textAlign:"center" }}>
            ⚠️ {error}
          </div>
        )}

        {stats && !loading && (<>

          {/* ══════════════════════════════
              SUMMARY CARDS
          ══════════════════════════════ */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"14px" }}>
            <StatCard icon="👥" label="Total Users"    value={stats.totalUsers}    accent={T.green}  delay={0}    />
            <StatCard icon="📦" label="Total Products" value={stats.totalProducts} accent={T.blue}   delay={0.05} />
            <StatCard icon="🔧" label="Total Services" value={stats.totalServices} accent={T.amber}  delay={0.10} />
            <StatCard icon="🛒" label="Total Orders"   value={stats.totalOrders}   accent={T.purple} delay={0.15} />
            <StatCard icon="📅" label="Total Bookings" value={stats.totalBookings} accent="#06b6d4"  delay={0.20} />
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={fmtINR(stats.totalRevenue)}
              accent="#16a34a"
              delay={0.25}
              sub="From all orders"
            />
          </div>

          {/* ══════════════════════════════
              ROW 1 — LINE + BAR CHARTS
          ══════════════════════════════ */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(420px, 1fr))", gap:"20px" }}>

            {/* Orders trend line chart */}
            <ChartCard title="📈 Orders Trend" sub="Last 7 days — daily order count" delay={0.3}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={stats.ordersTrend} margin={{ top:4, right:16, bottom:4, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,92,50,0.10)" />
                  <XAxis dataKey="date" tick={{ fontSize:11, fill: T.inkMuted, fontFamily:"'Outfit'" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11, fill: T.inkMuted, fontFamily:"'Outfit'" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="orders" name="Orders"
                    stroke={T.green} strokeWidth={2.5} dot={{ r:4, fill: T.green, strokeWidth:0 }}
                    activeDot={{ r:6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Revenue bar chart */}
            <ChartCard title="💰 Revenue Trend" sub="Last 7 days — daily revenue (₹)" delay={0.35}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.revenueTrend} margin={{ top:4, right:16, bottom:4, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,92,50,0.10)" />
                  <XAxis dataKey="date" tick={{ fontSize:11, fill: T.inkMuted, fontFamily:"'Outfit'" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11, fill: T.inkMuted, fontFamily:"'Outfit'" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                  <Tooltip content={<CustomTooltip prefix="₹" />} />
                  <Bar dataKey="revenue" name="Revenue" fill={T.greenBright || "#56a361"} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ══════════════════════════════
              ROW 2 — PIE CHARTS
          ══════════════════════════════ */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"20px" }}>

            {/* Order status pie */}
            <ChartCard title="🛒 Order Status" sub="Distribution by status" delay={0.40}>
              {stats.orderStatusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.orderStatusData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {stats.orderStatusData.map((entry) => (
                        <Cell key={entry.name} fill={ORDER_COLORS[entry.name] || T.inkMuted} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:"12px", fontFamily:"'Outfit'" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Booking status pie */}
            <ChartCard title="📅 Booking Status" sub="Distribution by status" delay={0.45}>
              {stats.bookingStatusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.bookingStatusData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {stats.bookingStatusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={BOOKING_COLORS[entry.name?.toUpperCase().replace(" ","_")] || BOOKING_COLORS[entry.name] || T.inkMuted}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:"12px", fontFamily:"'Outfit'" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Category distribution pie */}
            <ChartCard title="🏷️ Category Distribution" sub="Products + Services by category" delay={0.50}>
              {stats.categoryData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%" cy="50%"
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {stats.categoryData.map((entry, i) => (
                        <Cell key={entry.name} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:"12px", fontFamily:"'Outfit'" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ══════════════════════════════
              RECENT ORDERS TABLE
          ══════════════════════════════ */}
          <ChartCard title="🕐 Recent Orders" sub="Last 5 orders placed on the platform" delay={0.55}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"rgba(61,120,69,0.06)" }}>
                    {["Order ID","Customer","Email","Total","Status","Date"].map((h) => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:"10.5px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color: T.forestMid, borderBottom:"1px solid rgba(44,92,50,0.10)", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats.recentOrders || []).length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:"center", padding:"40px", color: T.inkMuted }}>No orders yet</td></tr>
                  ) : (stats.recentOrders || []).map((o, i) => (
                    <tr key={o._id}
                      style={{ animation:`ecoFadeUp 0.3s ease ${i * 0.05}s both` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(61,120,69,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={TD}><span style={{ fontFamily:"monospace", fontSize:"12px", color: T.inkSoft }}>#{o._id.toString().slice(-8).toUpperCase()}</span></td>
                      <td style={TD}><span style={{ fontWeight:600, color: T.ink, fontSize:"13.5px" }}>{o.user}</span></td>
                      <td style={TD}><span style={{ fontSize:"12px", color: T.inkMuted }}>{o.email}</span></td>
                      <td style={TD}><span style={{ fontWeight:700, color: T.green, fontSize:"13.5px" }}>{fmtINR(o.total)}</span></td>
                      <td style={TD}><SPill status={o.status} /></td>
                      <td style={TD}><span style={{ fontSize:"12px", color: T.inkSoft }}>{fmtDate(o.date)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

        </>)}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,300&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes ecoFadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-thumb { background:rgba(61,120,69,0.22); border-radius:3px; }
      `}</style>
    </div>
  );
};

/* ─── Empty chart placeholder ─── */
const EmptyChart = () => (
  <div style={{ height:"260px", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"10px", color: T.inkMuted }}>
    <div style={{ fontSize:"36px" }}>📊</div>
    <div style={{ fontSize:"13px" }}>No data yet</div>
  </div>
);

/* ─── Shared TD ─── */
const TD = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(44,92,50,0.07)",
  verticalAlign: "middle",
};

export default AdminDashboard;
