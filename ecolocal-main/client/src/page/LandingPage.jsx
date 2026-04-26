import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ── Inline SVG Icons ────────────────────────────────── */
const IconFarm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 1 4 4c0 2-1.5 4-4 6C9.5 10 8 8 8 6a4 4 0 0 1 4-4z"/>
    <path d="M3 20h18"/><path d="M5 20v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
    <path d="M9 14v2M15 14v2"/>
  </svg>
);
const IconArtisan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5"/>
    <path d="M12 13v8M8 17l4 4 4-4"/>
    <path d="M7 11l-4 8h18l-4-8"/>
  </svg>
);
const IconRepair = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IconTutor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IconEco = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <path d="M12 22V12M3.27 6.96L12 12.01l8.73-5.05"/>
  </svg>
);
const IconShop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 13.853 17.64 11.545 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

/* ── Service tiles data ──────────────────────────────── */
const SERVICES = [
  { id: 1, Icon: IconFarm,    label: "Farmers",     sub: "Fresh & local produce"   },
  { id: 2, Icon: IconArtisan, label: "Artisans",    sub: "Handcrafted & unique"    },
  { id: 3, Icon: IconRepair,  label: "Repair",      sub: "Fix, reuse, extend life" },
  { id: 4, Icon: IconTutor,   label: "Tutoring",    sub: "Learn from neighbors"    },
  { id: 5, Icon: IconEco,     label: "Eco Goods",   sub: "Sustainable products"    },
  { id: 6, Icon: IconShop,    label: "Local Shops", sub: "Neighbourhood stores"    },
];

/* ── Community Board visual ──────────────────────────── */
const CommunityBoard = () => (
  <div className="community-board">

    {/* Header row */}
    <div className="board-header">
      <span className="board-title">Local Community Services</span>
      <span className="board-count">6 Categories</span>
    </div>

    {/* 3×2 grid of service tiles */}
    <div className="board-grid">
      {SERVICES.map(({ id, Icon, label, sub }) => (
        <div className="service-tile" key={id}>
          <div className="tile-icon-wrap">
            <Icon />
          </div>
          <div>
            <div className="tile-label">{label}</div>
            <div className="tile-sub">{sub}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Stats footer bar */}
    <div className="board-footer">
      <div className="board-footer-stat">
        <span className="bfs-num">200+</span>
        <span className="bfs-label">Local Sellers</span>
      </div>
      <div className="board-footer-stat">
        <span className="bfs-num">50+</span>
        <span className="bfs-label">Services</span>
      </div>
      <div className="board-footer-stat">
        <span className="bfs-num">1 City</span>
        <span className="bfs-label">Your Area</span>
      </div>
    </div>

  </div>
);

/* ── Landing Page ────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ── Auth logic — UNCHANGED ─────────────────────────── */
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const url = isLogin
  //       ? "http://localhost:5000/api/auth/login"
  //       : "http://localhost:5000/api/auth/register";
  //     const { data } = await axios.post(url, formData);
  //     localStorage.setItem("token", data.token);
  //     localStorage.setItem("role", data.user.role);
  //     alert("Login Successful");
  //     window.location.href = data.user.role === "admin" ? "/admin" : "/home";
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Error");
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";

    const { data } = await axios.post(url, formData);

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("name", data.user.name);

    alert("Login Successful");

    // ✅ ROLE-BASED NAVIGATION
    if (data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/welcome");
    }

  } catch (err) {
    alert(err.response?.data?.message || "Error");
  }
};

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };
  /* ──────────────────────────────────────────────────── */

  return (
    <>
      <Header />
      <main>

        {/* ══ HERO ══════════════════════════════════════ */}
        <section className="hero">

          {/* LEFT: editorial text */}
          <div className="hero-content">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-bar" />
              <div className="hero-eyebrow-text">
                <span>Sustainable Marketplace</span>
                
              </div>
            </div>

            <h1>
              EcoLocal<br />
              <em>Marketplace.</em>
            </h1>

            <p className="hero-sub">
              Discover sustainable products and trusted local services
              while supporting your community and protecting the planet.
            </p>

            <a href="#about" className="hero-cta">
              Explore Local Services
              <span className="hero-cta-icon">→</span>
            </a>
          </div>

          {/* RIGHT: community grid — replaces the old blob */}
          <div className="hero-visual">
            <CommunityBoard />
          </div>

        </section>


        {/* ══ ABOUT ════════════════════════════════════ */}
        <section id="about">
          <div className="about-text">
            <span className="section-tag">Who We Are</span>
            <h2 className="section-headline">
              Connecting you with<br /><em>local &amp; sustainable</em>
            </h2>
            <p className="section-body" style={{ maxWidth: "420px" }}>
              EcoLocal connects customers with local artisans, service providers,
              and eco-friendly sellers. We help reduce environmental impact while
              supporting small businesses in your community.
            </p>
            <ul className="about-points">
              <li className="about-point">
                <span className="about-point-dot">🌿</span>
                Curated eco-friendly products from verified local sellers
              </li>
              <li className="about-point">
                <span className="about-point-dot">🤝</span>
                Trusted local services — repair, teach, care, create
              </li>
              <li className="about-point">
                <span className="about-point-dot">♻️</span>
                Every transaction reduces your carbon footprint
              </li>
            </ul>
          </div>
          <div className="about-visual">
            <div className="about-panels">
              <div className="about-panel-bg" />
              <div className="about-panel-main">
                <span className="about-panel-badge">🌱 Community Driven</span>
              </div>
            </div>
          </div>
        </section>


        {/* ══ IMPACT ═══════════════════════════════════ */}
        <section id="impact">
          <div className="impact-inner">
            <div className="impact-top">
              <div>
                <span className="section-tag">Our Purpose</span>
                <h2 className="section-headline" style={{ marginTop: ".2rem" }}>
                  Three pillars of<br /><em>lasting impact</em>
                </h2>
              </div>
              <p className="impact-desc">
                EcoLocal is built on a foundation of environmental stewardship,
                community empowerment, and responsible economic habits.
                Every purchase supports a greener, more connected world.
              </p>
            </div>
            <div className="impact-pillars">
              <div className="pillar">
                <span className="pillar-num">01</span>
                <div className="pillar-icon">🌱</div>
                <h3>Sustainability</h3>
                <p>Promoting eco-friendly products, responsible consumption, and a circular economy that puts the planet first.</p>
                <div className="pillar-line" />
              </div>
              <div className="pillar">
                <span className="pillar-num">02</span>
                <div className="pillar-icon">🏘️</div>
                <h3>Community Support</h3>
                <p>Empowering local businesses, artisans, and service providers to thrive in a connected digital marketplace.</p>
                <div className="pillar-line" />
              </div>
              <div className="pillar">
                <span className="pillar-num">03</span>
                <div className="pillar-icon">📦</div>
                <h3>Responsible Economy</h3>
                <p>Encouraging local trade to reduce supply chain emissions and carbon footprint — one mindful purchase at a time.</p>
                <div className="pillar-line" />
              </div>
            </div>
          </div>
        </section>


        {/* ══ AUTH ════════════════════════════════════ */}
        <section id="login" className="auth-section">

          <div className="auth-eyebrow">
            <span className="section-tag">Your Account</span>
          </div>

          <h2>
            {isLogin ? <>Welcome <em>back</em></> : <>Join <em>EcoLocal</em></>}
          </h2>

          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to access sustainable products and trusted local services."
              : "Create your account and join our growing eco-conscious community."}
          </p>

          <div className="auth-card">
            {/* Tab switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab${isLogin ? " active" : ""}`}
                onClick={() => setIsLogin(true)}
                type="button"
              >Login</button>
              <button
                className={`auth-tab${!isLogin ? " active" : ""}`}
                onClick={() => setIsLogin(false)}
                type="button"
              >Sign Up</button>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="field-group">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" type="text" name="name" placeholder="Jane Doe" onChange={handleChange} />
                </div>
              )}
              <div className="field-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" name="email" placeholder="you@example.com" onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
              </div>
              <button type="submit" className="btn-primary">
                {isLogin ? "Sign In to EcoLocal" : "Create My Account"}
              </button>
            </form>

            <div className="auth-divider"><span>or continue with</span></div>

            <button className="btn-google" onClick={handleGoogleLogin} type="button">
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="auth-toggle">
              <span>{isLogin ? "New to EcoLocal?" : "Already have an account?"}</span>
              <button onClick={() => setIsLogin(!isLogin)} type="button">
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>

          <div className="auth-links">
            <Link to="/change-password">Change Password</Link>
            <span className="dot-sep" />
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

        </section>

      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
