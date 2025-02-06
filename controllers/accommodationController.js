// controllers/accommodationController.js
import User from "../models/User.js";

export const registerAccommodation = async (req, res, next) => {
  try {
    const {
      name,
      email,
      collegeName,
      yearOfStudy,
      daysOfStay,
      utr,
    } = req.body;
    console.log(req.body)
    console.log(req.user)
    const existingUTR = await User.findOne({ "events.utr": utr });
    if (existingUTR) {
      throw new Error(`UTR number ${utr} is already used.`);
    }

    const paymentScreenshot = req.file ? req.file.path : req.body.paymentScreenshot;

    const stayDuration = Number(daysOfStay);
    if (isNaN(stayDuration) || stayDuration <= 0) {
      return res.status(400).json({ message: "Invalid daysOfStay value." });
    }
    const accommodationRegistration = {
      daysOfStay: stayDuration,
      paymentScreenshot,
      utr,
    };

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        collegeName,
        yearOfStudy,
        accommodations: [accommodationRegistration],
      });
    } else {
      user.accommodations.push(accommodationRegistration);
    }
    await user.save();

    res.status(200).json({ message: "Accommodation registered successfully" });
  } catch (error) {
    if (error.message.includes("UTR number")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
