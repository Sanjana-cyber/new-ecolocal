import React from "react";
import Footer from "../components/Footer";
import "./welcomeGateway.css"; // Reuse consistency

const ServicesLanding = () => {
  return (
    <div className="eco-welcome-page">
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div className="hero-glass-card" style={{ maxWidth: '600px' }}>
          <h1 className="hero-heading" style={{ fontSize: '2.5rem' }}>Services Coming Soon</h1>
          <p className="hero-username" style={{ marginTop: '20px' }}>
            We are preparing trusted local services for you. Our team is working hard to bring verified professionals right to your doorstep.
          </p>
          <button 
            onClick={() => window.history.back()}
            style={{
              marginTop: '30px',
              padding: '12px 30px',
              borderRadius: '12px',
              border: 'none',
              background: '#166534',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Go Back
          </button>
        </div>
      </div>
      <div className="gateway-footer">
        <Footer />
      </div>
    </div>
  );
};

export default ServicesLanding;
