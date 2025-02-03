// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/users/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile._json.email });
                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email: profile._json.email,
                        profilePic: profile._json.picture,
                    });
                } else {
                    let updated = false;
                    if (
                        !user.profilePic ||
                        user.profilePic !== profile._json.picture
                    ) {
                        user.profilePic = profile._json.picture;
                        updated = true;
                    }
                    if (!user.name || user.name !== profile.displayName) {
                        user.name = profile.displayName;
                        updated = true;
                    }
                    if (updated) {
                        await user.save();
                    }
                }
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log("🔹 Serializing user:", user._id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        // console.log("Deserializing user with ID:", id); // Debug log
        const user = await User.findById(id);
        // console.log("User found in deserializeUser:", user); // Debug log
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
