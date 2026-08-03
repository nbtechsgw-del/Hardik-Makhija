// 1. Zaroori Packages Import Karein
require('dotenv').config(); // Sabse pehle .env load hoga
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 2. Routes Import Karein (Jo aapne routes folder me banaye hain)
const patientRoutes = require('./routes/patientRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 3. Middlewares
app.use(express.json()); // JSON data ko parse karne ke liye
app.use(cors());         // Frontend se connection allow karne ke liye
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.originalUrl);
    next();
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 4. MongoDB Connection Logic
const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthcare_system";

mongoose.connect(dbURI)
    .then(() => {
        console.log("-----------------------------------------");
        console.log("✅ MongoDB Connected Successfully!");
        console.log("-----------------------------------------");
    })
    .catch((err) => {
        console.log("-----------------------------------------");
        console.log("❌ Database Connection Failed!");
        console.log("Error Details:", err.message);
        console.log("-----------------------------------------");
    });

// 5. API Endpoints
// Auth Routes (Signup/Login)
app.use('/api/auth', authRoutes);

// Patient routes protected routes ke saath
app.use('/api/patients', patientRoutes);
console.log('Patient routes mounted on /api/patients');

// Ek simple home route testing ke liye
app.get('/', (req, res) => {
    res.send("Healthcare System Server is Running... 🚀");
});

// 6. Server Start Karein
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 Server is listening on port: ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
});