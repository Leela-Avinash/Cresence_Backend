// routes/userRoutes.js
import express from "express";
import passport from "passport";
import { getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", keepSessionInfo: true }),
    (req, res) => {
        console.log(req.session.redirectUrl)
        const redirectUrl = req.session.redirectUrl || "http://localhost:5173/";
        console.log(redirectUrl)
        delete req.session.redirectUrl; 
        req.session.save(() => {
            res.redirect(redirectUrl);
        });
    }
);

router.get("/google", (req, res, next) => {
    if (req.query.redirect) {
        req.session.redirectUrl = req.query.redirect;
        console.log(req.query.redirect);
        console.log(req.session.redirectUrl)
    }
    next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/profile", getProfile);

export default router;
