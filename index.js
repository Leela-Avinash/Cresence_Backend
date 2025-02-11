// server.js
import express from "express";
import path from "path";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import "./config/passport.js"; 

import eventRoutes from "./routes/eventRoutes.js";
import workshopRoutes from "./routes/workShopRoutes.js";
import accommodationRoutes from "./routes/accommodationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import coordinatorRoutes from "./routes/coordinatorRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import cors from 'cors';
import MongoStore from "connect-mongo"

const app = express();

// Connect to MongoDB
connectDB();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Express session middleware (required for Passport)
app.use(
    session({
        secret: process.env.SESSION_SECRET || "secret",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI, 
            collectionName: "sessions",
          }),
        cookie: { 
            secure: false, 
            httpOnly: false,
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: "lax",
        },
    })
);

// Initialize Passport and session handling
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (payment screenshots)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Use Routes
app.use("/api/events", eventRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/accommodations", accommodationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coordinator", coordinatorRoutes); 

// Global error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
