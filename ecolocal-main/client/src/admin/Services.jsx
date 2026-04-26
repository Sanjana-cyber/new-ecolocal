import { useEffect, useState } from "react";
import { getServices, deleteService } from "../services/serviceService";
import { useNavigate } from "react-router-dom";

/* ─── EcoLocal design tokens ─── */
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
};

const resolveImage = (images) => {
  if (!images || images.length === 0) return "http://localhost:5000/uploads/default.png";
  const src = images[0];
  if (src.startsWith("http") || src.startsWith("blob")) return src;
  if (src.startsWith("/")) return `http://localhost:5000${src}`;
  return `http://localhost:5000/uploads/${src}`;
};

/* ═══════════════════ Component ═══════════════════ */
const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices({ keyword, category, minPrice, maxPrice, page });
      setServices(data.services || []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Error fetching services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [keyword, category, minPrice, maxPrice, page]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteService(deleteTarget.id, token);
      setDeleteTarget(null);
      fetchServices();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting service ❌");
    }
  };

  /* availability badge style */
  const availStyle = (val) => ({
    display: "inline-block",
    background: val === "available"
      ? "rgba(61,120,69,0.1)"
      : val === "by-appointment"
        ? "rgba(161,126,20,0.1)"
        : "rgba(185,28,28,0.08)",
    color: val === "available" ? T.green : val === "by-appointment" ? "#92700a" : "#b91c1c",
    padding: "4px 12px",
    borderRadius: "100px",
    fontSize: "12px", fontWeight: 600,
    border: `1px solid ${val === "available" ? "rgba(61,120,69,0.2)" : val === "by-appointment" ? "rgba(161,126,20,0.2)" : "rgba(185,28,28,0.2)"}`,
    textTransform: "capitalize",
  });

  return (
    <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "'Outfit', system-ui, sans-serif", color: T.ink }}>

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(13,33,16,0.72)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: T.parchment,
            border: `1px solid rgba(44,92,50,0.18)`,
            borderRadius: "28px", padding: "40px 44px",
            maxWidth: "400px", width: "90%", textAlign: "center",
            boxShadow: "0 24px 70px rgba(13,33,16,0.25)",
          }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>🗑️</div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "22px", fontWeight: 700, color: T.ink, marginBottom: "8px",
            }}>Delete Service?</div>
            <div style={{ fontSize: "14px", color: T.inkSoft, marginBottom: "28px", lineHeight: 1.7 }}>
              <strong style={{ color: T.ink }}>{deleteTarget.serviceName}</strong> will be permanently removed.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "10px 26px", background: "transparent", color: T.inkSoft,
                  border: `1.5px solid rgba(44,92,50,0.22)`, borderRadius: "100px",
                  fontWeight: 500, fontSize: "14px", cursor: "pointer",
                  fontFamily: "'Outfit', system-ui, sans-serif",
                }}
              >Cancel</button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "10px 26px", background: "#b91c1c", color: "#fff",
                  border: "none", borderRadius: "100px",
                  fontWeight: 600, fontSize: "14px", cursor: "pointer",
                  fontFamily: "'Outfit', system-ui, sans-serif",
                  boxShadow: "0 4px 16px rgba(185,28,28,0.35)",
                }}
              >Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div style={{
        background: `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(26,61,31,0) 0%, rgba(8,24,10,0.7) 100%),
                     radial-gradient(ellipse 100% 100% at 50% 50%, #0d2e10 0%, #1a4d1c 40%, #2c6b30 70%, #1a4018 100%)`,
        padding: "52px 40px 48px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            radial-gradient(ellipse 4% 6% at 15% 20%, rgba(109,191,116,0.18) 0%, transparent 100%),
            radial-gradient(ellipse 5% 7% at 80% 30%, rgba(86,163,97,0.14) 0%, transparent 100%),
            radial-gradient(ellipse 3% 5% at 50% 10%, rgba(109,191,116,0.12) 0%, transparent 100%)`,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontSize: "11px", fontWeight: 500, letterSpacing: "0.2em",
            textTransform: "uppercase", color: T.greenPale,
            padding: "6px 16px",
            border: "1px solid rgba(168,212,174,0.28)", borderRadius: "100px",
            background: "rgba(61,120,69,0.22)", backdropFilter: "blur(8px)",
            marginBottom: "20px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.leaf, boxShadow: `0 0 8px ${T.leaf}`, flexShrink: 0 }} />
            Admin · EcoLocal
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700, color: "#fff",
                margin: "0 0 6px",
                textShadow: "0 4px 24px rgba(0,0,0,0.4)", lineHeight: 1.1,
              }}>
                Service <em style={{ fontStyle: "italic", fontWeight: 300, color: T.greenPale }}>Catalog</em>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 300, margin: 0 }}>
                {loading ? "Loading…" : `${services.length} service${services.length !== 1 ? "s" : ""} listed`}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/add-service")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "13px 28px", background: T.green, color: "#fff",
                border: "none", borderRadius: "100px",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 8px 28px rgba(61,120,69,0.45)", transition: "all 0.22s",
                fontFamily: "'Outfit', system-ui, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.greenBright;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 36px rgba(86,163,97,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.green;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(61,120,69,0.45)";
              }}
            >
              ＋ Add Service
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{
        background: T.parchment,
        borderBottom: `1px solid rgba(44,92,50,0.12)`,
        padding: "18px 40px",
        display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center",
      }}>
        {[
          { placeholder: "🔍  Search by name…", value: keyword, setter: setKeyword, type: "text" },
          { placeholder: "🏷️  Category…", value: category, setter: setCategory, type: "select", options: ["repair", "cleaning", "delivery", "consulting", "local-help"] },
          { placeholder: "₹  Min price", value: minPrice, setter: setMinPrice, type: "number" },
          { placeholder: "₹  Max price", value: maxPrice, setter: setMaxPrice, type: "number" },
        ].map(({ placeholder, value, setter, type, options }) => (
          type === "select" ? (
            <select
              key={placeholder}
              value={value}
              onChange={(e) => { setter(e.target.value); setPage(1); }}
              style={{
                flex: "1 1 160px",
                background: "#fff",
                border: `1.5px solid rgba(44,92,50,0.18)`,
                borderRadius: "100px",
                padding: "9px 18px",
                color: T.ink,
                fontSize: "13.5px",
                outline: "none",
                fontFamily: "'Outfit', system-ui, sans-serif",
                transition: "border-color 0.2s",
                cursor: "pointer",
              }}
            >
              <option value="">{placeholder}</option>
              {options.map(opt => (
                <option key={opt} value={opt}>
                  {opt.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={placeholder}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => { setter(e.target.value); setPage(1); }}
              style={{
                flex: "1 1 160px",
                background: "#fff",
                border: `1.5px solid rgba(44,92,50,0.18)`,
                borderRadius: "100px",
                padding: "9px 18px",
                color: T.ink,
                fontSize: "13.5px",
                outline: "none",
                fontFamily: "'Outfit', system-ui, sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = T.green)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(44,92,50,0.18)")}
            />
          )
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ padding: "32px 40px" }}>
        <div style={{
          background: "#fff",
          border: `1px solid rgba(44,92,50,0.12)`,
          borderRadius: "24px", overflow: "hidden",
          boxShadow: "0 4px 24px rgba(13,33,16,0.06)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(61,120,69,0.07)" }}>
                {["Image", "Service Name", "Provider", "Price", "Category", "Location", "Availability", "Actions"].map((h) => (
                  <th key={h} style={{
                    padding: "14px 18px", textAlign: "left",
                    fontSize: "11px", fontWeight: 600,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: T.forestMid,
                    borderBottom: `1px solid rgba(44,92,50,0.12)`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "60px", color: T.inkMuted, fontSize: "15px" }}>⏳ Loading services…</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "60px", color: T.inkMuted }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>🛠️</div>
                  <div>No services found</div>
                </td></tr>
              ) : services.map((s, i) => (
                <tr
                  key={s._id}
                  style={{ transition: "background 0.18s", animation: `ecoFadeUp 0.35s ease ${i * 0.04}s both` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(61,120,69,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Image */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle" }}>
                    <img
                      src={s.mainImage ? (s.mainImage.startsWith('/') ? `http://localhost:5000${s.mainImage}` : `http://localhost:5000/uploads/${s.mainImage}`) : "http://localhost:5000/uploads/default.png"} 
                      alt={s.serviceName}
                      style={{
                        width: "52px", height: "52px", objectFit: "cover",
                        borderRadius: "12px",
                        border: `2px solid rgba(61,120,69,0.2)`,
                        boxShadow: "0 2px 8px rgba(13,33,16,0.1)",
                      }}
                      onError={(e) => (e.currentTarget.src = "http://localhost:5000/uploads/default.png")}
                    />
                  </td>
                  {/* Name */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle" }}>
                    <span style={{ fontWeight: 600, color: T.ink, fontSize: "14.5px" }}>{s.serviceName}</span>
                  </td>
                  {/* Provider */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle", color: T.inkSoft, fontSize: "13.5px" }}>
                    {s.providerName || "—"}
                  </td>
                  {/* Price */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle" }}>
                    <span style={{
                      display: "inline-block",
                      background: "rgba(61,120,69,0.1)", color: T.forestMid,
                      padding: "4px 12px", borderRadius: "100px",
                      fontSize: "13px", fontWeight: 600,
                      border: `1px solid rgba(61,120,69,0.2)`,
                    }}>₹{s.basePrice}</span>
                  </td>
                  {/* Category */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle" }}>
                    <span style={{
                      display: "inline-block",
                      background: "rgba(44,92,50,0.08)", color: T.inkSoft,
                      padding: "4px 12px", borderRadius: "100px",
                      fontSize: "12px", fontWeight: 500,
                      border: `1px solid rgba(44,92,50,0.15)`, textTransform: "capitalize",
                    }}>{s.category || "—"}</span>
                  </td>
                  {/* Location */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle", color: T.inkSoft, fontSize: "13.5px" }}>
                    {s.location || "—"}
                  </td>
                  {/* Availability */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle" }}>
                    <span style={availStyle(s.availabilityStatus)}>{s.availabilityStatus || "—"}</span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: "14px 18px", borderBottom: `1px solid rgba(44,92,50,0.07)`, verticalAlign: "middle" }}>
                    <button
                      onClick={() => navigate(`/admin/edit-service/${s._id}`)}
                      style={{
                        padding: "7px 18px",
                        background: "rgba(61,120,69,0.1)", color: T.green,
                        border: `1px solid rgba(61,120,69,0.25)`, borderRadius: "100px",
                        fontSize: "12.5px", fontWeight: 600,
                        cursor: "pointer", marginRight: "8px", transition: "all 0.18s",
                        fontFamily: "'Outfit', system-ui, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = T.green;
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(61,120,69,0.1)";
                        e.currentTarget.style.color = T.green;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    > Edit</button>
                    <button
                      onClick={() => setDeleteTarget({ id: s._id, serviceName: s.serviceName })}
                      style={{
                        padding: "7px 18px",
                        background: "rgba(185,28,28,0.08)", color: "#b91c1c",
                        border: `1px solid rgba(185,28,28,0.2)`, borderRadius: "100px",
                        fontSize: "12.5px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.18s",
                        fontFamily: "'Outfit', system-ui, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#b91c1c";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(185,28,28,0.08)";
                        e.currentTarget.style.color = "#b91c1c";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    > Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "28px", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{
                width: "38px", height: "38px", borderRadius: "100px",
                border: `1px solid rgba(44,92,50,0.22)`,
                background: "#fff", color: T.inkSoft,
                fontWeight: 600, cursor: "pointer",
                fontFamily: "'Outfit', system-ui, sans-serif",
              }}
            >‹</button>
            {[...Array(pages).keys()].map((x) => (
              <button
                key={x + 1} onClick={() => setPage(x + 1)}
                style={{
                  width: "38px", height: "38px", borderRadius: "100px",
                  border: page === x + 1 ? `1.5px solid ${T.green}` : `1px solid rgba(44,92,50,0.22)`,
                  background: page === x + 1 ? T.green : "#fff",
                  color: page === x + 1 ? "#fff" : T.inkSoft,
                  fontWeight: 600, cursor: "pointer", transition: "all 0.18s",
                  fontFamily: "'Outfit', system-ui, sans-serif",
                }}
              >{x + 1}</button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              style={{
                width: "38px", height: "38px", borderRadius: "100px",
                border: `1px solid rgba(44,92,50,0.22)`,
                background: "#fff", color: T.inkSoft,
                fontWeight: 600, cursor: "pointer",
                fontFamily: "'Outfit', system-ui, sans-serif",
              }}
            >›</button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes ecoFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #7a9b7e; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
};

export default Services;
