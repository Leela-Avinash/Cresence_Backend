// routes/coordinatorRoutes.js
import express from "express";
import { getEventRegistrations, getWorkshopRegistrations, getAccommodationRegistrations } from "../controllers/coordinatorController.js";

const router = express.Router();

// Endpoint to get event registrations filtered by eventName
// Example: GET /api/coordinator/events?eventName=TechTalk
router.get("/events", getEventRegistrations);

// Endpoint to get workshop registrations filtered by workshopName
// Example: GET /api/coordinator/workshops?workshopName=WebDevWorkshop
router.get("/workshops", getWorkshopRegistrations);

// Endpoint to get all accommodation registrations
// Example: GET /api/coordinator/accommodations
router.get("/accommodations", getAccommodationRegistrations);

export default router;
