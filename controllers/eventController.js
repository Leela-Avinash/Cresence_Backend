// controllers/eventController.js
import User from "../models/User.js";

// Helper function to update a user’s event registration
const updateUserEventRegistration = async (userEmail, registrationData, isLeader = false) => {
  let user = await User.findOne({ email: userEmail });

  const userEvent = {
    eventName: registrationData.eventName,
    eventType: registrationData.eventType,
    isTeam: registrationData.isTeam,
    teamName: registrationData.teamName,
    teammates: registrationData.teammates,
  };

  if (isLeader) {
    const existingUTR = await User.findOne({ "events.utr": registrationData.utr });
    if (existingUTR) {
      throw new Error(`UTR number ${registrationData.utr} is already used.`);
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
      teammates, // Array of teammates: [{ name, email }, ...]
    } = req.body;

    // Use Cloudinary URL from req.file if available; otherwise fall back to a provided URL
    const paymentScreenshot = req.file ? req.file.path : req.body.paymentScreenshot;

    // Update registration for the main user
    await updateUserEventRegistration(email, {
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
    }, true);

    // If it’s a team event, update registration for each teammate
    if (isTeam && teammates && teammates.length > 0) {
      for (const mate of teammates) {
        await updateUserEventRegistration(mate.email, {
          userName: mate.name,
          collegeName,
          yearOfStudy,
          eventName,
          eventType,
          isTeam: true,
          teamName,
          teammates,
        }, false);      }
    }

    res.status(200).json({ message: "Event registered successfully" });
  } catch (error) {
    if (error.message.includes("UTR number")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
