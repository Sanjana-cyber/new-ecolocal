import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./welcomeGateway.css";

// Import images from assets
import ecoProductsImg from "../assets/eco_products.png";
import localServicesImg from "../assets/local_services.png";

const WelcomeGateway = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user name from localStorage
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setUserName(storedName);
    }
    
    // Smooth fade-in effect on load
    window.scrollTo(0, 0);
  }, []);

  const handleShopClick = () => {
    navigate("/shop");
  };

  const handleServicesClick = () => {
    navigate("/services");
  };

  return (
    <div className="eco-welcome-page">
      {/* SECTION 1 — HERO WELCOME */}
      <section className="hero-welcome-container">
        <div className="hero-glass-card">
          <h1 className="hero-heading">Welcome to EcoLocal 🌿</h1>
          <p className="hero-username">
            What would you like to explore today, <strong>{userName || "Friend"}</strong>?
          </p>
        </div>
      </section>

      {/* SECTION 2 & 3 IN PASTEL WRAPPER */}
      <div className="choices-wrapper">
        {/* SECTION 2 — TWO PREMIUM CHOICE CARDS */}
        <section className="choice-cards-container">
          {/* CARD 1: Shop Local Products */}
          <div className="choice-card" onClick={handleShopClick}>
            <div className="card-image-wrap">
              <img src={ecoProductsImg} alt="Local Eco Products" />
              <div className="card-overlay"></div>
            </div>
            <div className="card-content">
              <h2 className="card-title">Shop Products</h2>
              <p className="card-subtitle">
                Discover sustainable local products from nearby sellers and reduce your carbon footprint.
              </p>
              <div className="card-cta">
                Explore Products <span>→</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Book Local Services */}
          <div className="choice-card" onClick={handleServicesClick}>
            <div className="card-image-wrap">
              <img src={localServicesImg} alt="Local Services" />
              <div className="card-overlay"></div>
            </div>
            <div className="card-content">
              <h2 className="card-title">Book Services</h2>
              <p className="card-subtitle">
                Find trusted local professionals near you for repair, tutoring, cleaning, and more.
              </p>
              <div className="card-cta">
                Explore Services <span>→</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — STATS BAR */}
        <section className="stats-strip-container">
          <div className="stats-strip">
            <div className="stat-item">
              <span className="stat-value">100+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">50+</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">10+</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 4 — FOOTER */}
      <div className="gateway-footer">
        <Footer />
      </div>
    </div>
  );
};

export default WelcomeGateway;
