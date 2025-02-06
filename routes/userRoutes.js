// routes/userRoutes.js
import express from "express";
import passport from "passport";
import { getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {successRedirect:"localhost:5173/", failureRedirect: "/login" }),
    (req, res) => {
        req.session.save(() => {
            res.json({ message: "Authentication successful", user: req.user });
        });
    }
);

// Protected route to get user profile data
router.get("/profile", getProfile);

export default router;
