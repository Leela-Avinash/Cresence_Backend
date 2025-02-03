// routes/eventRoutes.js
import express from "express";
import { registerEvent } from "../controllers/eventController.js";
import upload from "../middleware/fileUpload.js";

const router = express.Router();

// POST /api/events/register – Register for an event with payment screenshot upload
router.post("/register", upload.single("paymentScreenshot"), registerEvent);

export default router;
