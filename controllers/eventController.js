// controllers/eventController.js
import User from "../models/User.js";
import fs from "fs";
import path from "path";

// Helper function to update a user’s event registration
const updateUserEventRegistration = async (
    userEmail,
    registrationData,
    isLeader = false
) => {
    let user = await User.findOne({ email: userEmail });

    const userEvent = {
        eventName: registrationData.eventName,
        eventType: registrationData.eventType,
        isTeam: registrationData.isTeam,
        teamName: registrationData.teamName,
        teammates: registrationData.teammates,
    };

    if (isLeader) {
        const existingUTR = await User.findOne({
            "events.utr": registrationData.utr,
        });
        if (existingUTR) {
            throw new Error(
                `UTR number ${registrationData.utr} is already used.`
            );
        }
        userEvent.paymentScreenshot = registrationData.paymentScreenshot;
        userEvent.utr = registrationData.utr;
    }

    if (!user) {
        // Create a new user if one does not exist
        user = new User({
            name: registrationData.userName,
            email: userEmail,
            collegeName: registrationData.collegeName,
            yearOfStudy: registrationData.yearOfStudy,
            events: [userEvent],
        });
    } else {
        // Append the new event registration (a user may register for the same event more than once)
        user.events.push(userEvent);
    }
    await user.save();
};

// Helper function to safely escape CSV fields
const csvEscape = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    // Replace any existing double quotes with two double quotes then wrap the field in quotes.
    return `"${str.replace(/"/g, '""')}"`;
};

// New helper to update (or create) the CSV for the event registration
const updateEventCSV = async (data) => {
    // Define the directory and filename. Adjust the folder path as needed.
    const csvDir = path.join(process.cwd(), "csv");
    if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir);
    }
    // Use eventName as the file name (for example: "Hackathon.csv")
    const fileName = `${data.eventName}.csv`;
    const filePath = path.join(csvDir, fileName);

    // Define the header (only written if file is not found)
    const header =
        [
            "Name",
            "Email",
            "Team Name",
            "Teammates",
            "College",
            "Branch",
            "Year Of Study",
            "Phone",
            "UTR",
            "Payment Screenshot",
        ]
            .map(csvEscape)
            .join(",") + "\n";

    const teammatesStr =
        data.isTeam && data.teammates && data.teammates.length > 0
            ? data.teammates
                  .map((mate) => `${mate.name} <${mate.email}>`)
                  .join(" | ")
            : "";

    const row =
        [
            data.userName,
            data.email,
            data.isTeam ? data.teamName || "" : "",
            data.isTeam ? teammatesStr : "",
            data.collegeName,
            data.branch,
            data.yearOfStudy,
            data.phone,
            data.utr,
            data.paymentScreenshot,
        ]
            .map(csvEscape)
            .join(",") + "\n";

    // If the file does not exist, create it with header then append the row.
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, header, "utf8");
    }
    // Append the new row
    fs.appendFileSync(filePath, row, "utf8");
};

export const registerEvent = async (req, res, next) => {
    try {
        const {
            eventName,
            eventType,
            isTeam,
            teamName,
            utr,
            collegeName,
            yearOfStudy,
            name,
            email,
            teammates,
            phone,
            branch,
        } = req.body;
        console.log(req.body);
        console.log(req.user);

        // Use Cloudinary URL from req.file if available; otherwise fall back to a provided URL
        const paymentScreenshot = req.file
            ? req.file.path
            : req.body.paymentScreenshot;

        // Update registration for the main user
        await updateUserEventRegistration(
            email,
            {
                userName: name,
                collegeName,
                yearOfStudy,
                eventName,
                eventType,
                isTeam: isTeam || false,
                teamName: isTeam ? teamName : null,
                teammates: isTeam ? teammates || [] : [],
                paymentScreenshot,
                utr,
                phone,
                branch,
            },
            true
        );

        // If it’s a team event, update registration for each teammate
        if (isTeam && teammates && teammates.length > 1) {
            // Ensure at least two teammates exist
            for (let i = 1; i < teammates.length; i++) {
                const mate = teammates[i];
                await updateUserEventRegistration(
                    mate.email,
                    {
                        userName: mate.name,
                        collegeName,
                        yearOfStudy,
                        eventName,
                        eventType,
                        isTeam: true,
                        teamName,
                        teammates,
                    },
                    false
                );
            }
        }

        // Update CSV only for the main user registration.
        await updateEventCSV({
            userName: name,
            email: email,
            isTeam: isTeam || false,
            teamName: teamName,
            teammates: teammates,
            collegeName: collegeName,
            branch: branch,
            yearOfStudy: yearOfStudy,
            phone: phone,
            utr: utr,
            paymentScreenshot: paymentScreenshot,
            eventName: eventName,
        });

        res.status(200).json({ message: "Event registered successfully" });
    } catch (error) {
        if (error.message.includes("UTR number")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};
