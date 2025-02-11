// routes/workshopRoutes.js
import express from "express";
import { registerWorkshop } from "../controllers/workShopController.js";
import upload from "../middleware/fileUpload.js";

const router = express.Router();

// POST /api/workshops/register – Register for a workshop with payment screenshot upload
router.post("/register", upload.single("paymentScreenshot"), registerWorkshop);

export default router;
