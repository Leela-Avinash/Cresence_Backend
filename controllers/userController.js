// controllers/userController.js
import User from "../models/User.js";

export const getProfile = async (req, res, next) => {
  // console.log("🔹 Session on /profile:", req.session);
  // console.log("🔹 req.session.passport:", req.session.passport);
  // console.log("🔹 User on /profile:", req.user);
  // if (!req.session.passport) {
  //   console.log("⚠️ No passport data in session!");
  // }
  try {
    // Ensure the user is authenticated via Passport
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};
