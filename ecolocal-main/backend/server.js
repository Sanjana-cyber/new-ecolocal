// server.js  (at project root)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const passport = require("passport");
require("./config/passport");  // configure google strategy
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


// 1) Global middleware
app.use(express.json());
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
//initialize passport
app.use(passport.initialize());
// 2) DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// 3) Routes
console.log('Loading auth routes...');
const authRoutes = require('./bmodels/routes/authRoute');
app.use('/api/auth', authRoutes);
console.log('Auth routes loaded at /api/auth');

console.log('Loading user routes...');
const userRoutes = require('./bmodels/routes/userRoute');
app.use('/api/users', userRoutes);
console.log('User routes loaded at /api/users');

console.log('Loading product routes...');
const productRoutes = require('./bmodels/routes/productRoutes');
app.use('/api/products', productRoutes);
console.log('Product routes loaded at /api/products'); 

const serviceRoutes = require("./bmodels/routes/serviceRoutes");
app.use("/api/services", serviceRoutes);
console.log('Service  routes loaded at /api/servicess'); 

console.log('🔄 Loading cart routes');
const cartRoutes = require('./bmodels/routes/cartRoutes');
app.use('/api/cart', cartRoutes);
console.log('✅ Cart routes loaded');

console.log('🔄 Loading order routes ...');
const orderRoutes = require('./bmodels/routes/orderRoutes');
app.use('/api/orders', orderRoutes);
console.log('✅ Order routes loaded');

console.log('🔄 Loading wishlist routes...');
const wishlistRoutes = require('./bmodels/routes/wishlistRoutes');
app.use('/api/wishlist', wishlistRoutes);
console.log('✅ Wishlist routes loaded at /api/wishlist');

console.log('🔄 Loading admin routes...');
const adminRoutes = require('./bmodels/routes/adminRoutes');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes loaded at /api/admin');

console.log('🔄 Loading upload routes ...');
const uploadRoutes = require('./bmodels/routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

console.log('🔄 Loading vision search routes ...');
const visionRoutes = require('./bmodels/routes/visionRoutes');
app.use('/api/vision-search', visionRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Uploads & static folder loaded');

// 4) Root test route (optional)
app.get('/', (req, res) => {
  res.send('API is running...');
});


// 5) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

