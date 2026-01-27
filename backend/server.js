const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize app FIRST
const app = express();

/* ======================
   Middleware
====================== */
app.use(
  cors({
    origin: "*",
    credentials: true
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   MongoDB Connection
====================== */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

/* ======================
   Import Routes (after app is initialized)
====================== */
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const contactRoutes = require('./routes/contact');
const contentRoutes = require('./routes/content');
const adminUserRoutes = require('./routes/adminUsers');
const teacherRoutes = require('./routes/teacher');

/* ======================
   API Routes
====================== */

app.get("/", (req, res) => {
  res.send("LMS API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes); 
app.use("/api/content", contentRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/teacher', teacherRoutes);

/* ======================
   Error Handling
====================== */

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

/* ======================
   Start Server
====================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});