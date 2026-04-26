import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">

      {/* Logo pill badge */}
      <div className="logo">
        <Link to="/">EcoLocal</Link>
      </div>

      {/* Navigation */}
      <nav className="nav">
        <a href="#about">About</a>
        <a href="#impact">Impact</a>
        <a href="#login">Community</a>
        {/* Green pill CTA — signature button from reference */}
        <a href="#login" className="nav-cta">Get Started</a>
      </nav>

    </header>
  );
}

export default Header;
