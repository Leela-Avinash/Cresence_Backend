// models/User.js
import mongoose from "mongoose";

const TeammateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
});

const EventRegistrationSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventType: {
        type: String,
        enum: ["tech", "nontech", "esports"],
        required: true,
    },
    isTeam: { type: Boolean, default: false },
    teamName: { type: String },
    teammates: [TeammateSchema],
    paymentScreenshot: { type: String }, 
    utr: { type: String, unique: true, sparse: true },
});

const WorkshopRegistrationSchema = new mongoose.Schema({
    workshopName: { type: String, required: true },
    paymentScreenshot: { type: String },
    utr: { type: String, required: true, unique: true, sparse: true },
});

const AccommodationRegistrationSchema = new mongoose.Schema({
    daysOfStay: { type: Number, required: true },
    paymentScreenshot: { type: String },
    utr: { type: String, required:true, unique: true, sparse: true },
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { type: String },
    collegeName: { type: String },
    yearOfStudy: { type: String },
    phone: {type: String},
    branch: {type: String},
    events: [EventRegistrationSchema],
    workshops: [WorkshopRegistrationSchema],
    accommodations: [AccommodationRegistrationSchema],
});

export default mongoose.model("User", UserSchema);
