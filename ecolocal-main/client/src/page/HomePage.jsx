import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../user/services/productService";
import ProductCard from "../user/components/ProductCard";
import "../user/styles/HomeFeed.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const loadProducts = async () => {
      try {
        setLoading(true);
        // Using the existing fetchProducts service
        const data = await fetchProducts({ limit: 50 });
        setProducts(data.products || []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [navigate]);
  

  return (
    <div className="home-feed-container">
      <header className="home-feed-header">
        <div className="header-content">
          <h1>EcoLocal <span className="logo-leaf">🌿</span></h1>
          <p className="header-subtitle">Sustainable products from your local community</p>
        </div>
      </header>

      <main className="home-feed-main">
        {loading ? (
          <div className="feed-status-container">
            <div className="loader"></div>
            <p>Fetching fresh products...</p>
          </div>
        ) : error ? (
          <div className="feed-status-container error">
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="feed-status-container empty">
            <p>No products found. Admin hasn't uploaded anything yet!</p>
          </div>
        ) : (
          <div className="products-feed-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className="home-feed-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} EcoLocal. All rights reserved.</p>
          <div className="footer-links">
            <span>About</span>
            <span>Support</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
