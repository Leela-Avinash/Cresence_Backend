// controllers/workshopController.js
import User from "../models/User.js";

export const registerWorkshop = async (req, res, next) => {
  try {
    const {
      workshopName,
      name,
      email,
      collegeName,
      yearOfStudy,
      utr,
    } = req.body;

    const existingUTR = await User.findOne({ "events.utr": utr });
    if (existingUTR) {
      throw new Error(`UTR number ${existingUTR} is already used.`);
    }

    const paymentScreenshot = req.file ? req.file.path : req.body.paymentScreenshot;

    const workshopRegistration = {
      workshopName,
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
        workshops: [workshopRegistration],
      });
    } else {
      user.workshops.push(workshopRegistration);
    }
    await user.save();

    res.status(200).json({ message: "Workshop registered successfully" });
  } catch (error) {
    if (error.message.includes("UTR number")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
