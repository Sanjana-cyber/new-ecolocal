import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./page/LandingPage";
import GoogleSuccess from "./page/GoogleSuccess";
import ChangePassword from "./page/ChangePassword";
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";
import HomePage from "./page/HomePage";
import WelcomeGateway from "./page/WelcomeGateway";
import ServicesLanding from "./page/ServicesLanding";

// 🔐 Admin
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import Products from "./admin/Products";
import AddProduct from "./admin/AddProduct";
import EditProduct from "./admin/EditProduct";
import Services from "./admin/Services";
import AddService from "./admin/AddService";
import Users from "./admin/Users";
import Orders from "./admin/Orders";
import Bookings from "./admin/Bookings";

// 🛍️ User Panel
import { CartProvider } from "./user/context/CartContext";
import { WishlistProvider } from "./user/context/WishlistContext";
import UserShop from "./user/pages/UserShop";
import ProductDetail from "./user/pages/ProductDetail";
import CartPage from "./user/pages/CartPage";
import WishlistPage from "./user/pages/WishlistPage";
import MyOrdersPage from "./user/pages/MyOrdersPage";
import CheckoutPage from "./user/pages/CheckoutPage";
import CategoriesPage from "./user/pages/CategoriesPage";

import "./App.css";
import "./index.css";

function App() {
  return (
    <CartProvider>
    <WishlistProvider>
    <BrowserRouter>
      <Routes>

        {/* 🌍 PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/welcome" element={<WelcomeGateway />} />
        <Route path="/services" element={<ServicesLanding />} />
        <Route path="/google-success" element={<GoogleSuccess />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🔐 ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="services" element={<Services />} />
          <Route path="add-service" element={<AddService />} />
          <Route path="edit-service/:id" element={<AddService />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>

        {/* 🛍️ USER SHOP */}
        <Route path="/shop" element={<UserShop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/categories" element={<CategoriesPage />} />

      </Routes>
    </BrowserRouter>
    </WishlistProvider>
    </CartProvider>
  );
}

export default App;
