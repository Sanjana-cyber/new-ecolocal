function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">

        {/* Brand column */}
        <div className="footer-brand">
          <div className="footer-brand-logo">EcoLocal</div>
          <p>
            A community-driven marketplace connecting people with sustainable
            products and trusted local services — building a greener, more
            responsible local economy, one transaction at a time.
          </p>
          <span className="footer-tagline">"Buy Local. Live Green. Give Back."</span>
        </div>

        {/* Contact column */}
        <div className="footer-col">
          <p className="footer-col-title">Contact</p>

          <div className="footer-contact-item">
            <span className="footer-contact-icon">✉</span>
            sanjanapandey29256@gmail.com
          </div>

          <div className="footer-contact-item">
            <span className="footer-contact-icon">💬</span>
            WhatsApp: +91 9877932989X
          </div>

          <div className="footer-contact-item">
            <span className="footer-contact-icon">🐙</span>
            <a
              href="https://github.com/Sanjana-cyber"
              target="_blank"
              rel="noreferrer"
            >
              github.com/Sanjana-cyber
            </a>
          </div>
        </div>

        {/* Quick links column */}
        <div className="footer-col">
          <p className="footer-col-title">Platform</p>
          <nav className="footer-links">
            <a href="#about">About EcoLocal</a>
            <a href="#impact">Our Impact</a>
            <a href="#login">Join Community</a>
            <a href="#login">Become a Seller</a>
            <a href="#login">List a Service</a>
          </nav>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p className="footer-copy">
          © {new Date().getFullYear()} EcoLocal — All rights reserved
        </p>

        <div className="footer-social">
          <a href="#" aria-label="Instagram">📸</a>
          <a href="#" aria-label="Twitter">🐦</a>
          <a href="https://github.com/Sanjana-cyber" target="_blank" rel="noreferrer" aria-label="GitHub">🐙</a>
          <a href="#" aria-label="LinkedIn">💼</a>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
