import express from "express";
import { registerAccommodation } from "../controllers/accommodationController.js";
import upload from "../middleware/fileUpload.js";

const router = express.Router();

router.post("/register", upload.single("paymentScreenshot"), registerAccommodation);

export default router;
