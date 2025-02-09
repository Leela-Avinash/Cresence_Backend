import User from "../models/User.js";

export const getEventRegistrations = async (req, res, next) => {
    try {
        const { eventName } = req.query;
        if (!eventName) {
            return res
                .status(400)
                .json({ message: "eventName query parameter is required" });
        }
        const data = await User.aggregate([
            { $unwind: "$events" },
            {
                $match: {
                    "events.eventName": eventName,
                    "events.utr": { $ne: null },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    email: 1,
                    collegeName: 1,
                    yearOfStudy: 1,
                    eventName: "$events.eventName",
                    eventType: "$events.eventType",
                    isTeam: "$events.isTeam",
                    teamName: "$events.teamName",
                    teammates: "$events.teammates",
                    paymentScreenshot: "$events.paymentScreenshot",
                    utr: "$events.utr",
                },
            },
        ]);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// Get workshop registration data for a specific workshop
export const getWorkshopRegistrations = async (req, res, next) => {
    try {
        const { workshopName } = req.query;
        if (!workshopName) {
            return res
                .status(400)
                .json({ message: "workshopName query parameter is required" });
        }
        const data = await User.aggregate([
            { $unwind: "$workshops" },
            { $match: { "workshops.workshopName": workshopName } },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    email: 1,
                    collegeName: 1,
                    yearOfStudy: 1,
                    workshopName: "$workshops.workshopName",
                    paymentScreenshot: "$workshops.paymentScreenshot",
                    utr: "$workshops.utr",
                },
            },
        ]);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

// Get accommodation registration data (all)
export const getAccommodationRegistrations = async (req, res, next) => {
    try {
        const data = await User.aggregate([
            { $unwind: "$accommodations" },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    email: 1,
                    collegeName: 1,
                    yearOfStudy: 1,
                    daysOfStay: "$accommodations.daysOfStay",
                    paymentScreenshot: "$accommodations.paymentScreenshot",
                    utr: "$accommodations.utr",
                },
            },
        ]);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};
