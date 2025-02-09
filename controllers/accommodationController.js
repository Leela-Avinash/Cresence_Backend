// controllers/accommodationController.js
import User from "../models/User.js";
import fs from "fs";
import path from "path";

// Helper function to escape CSV fields (wraps the field in quotes and escapes any internal quotes)
const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
};

// Helper function to update (or create) the CSV for accommodation registrations
const updateAccommodationCSV = async (data) => {
  // Define the directory where CSV files will be stored
  const csvDir = path.join(process.cwd(), "csv");
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir);
  }
  // Static file name for accommodations
  const fileName = "Accommodation.csv";
  const filePath = path.join(csvDir, fileName);

  // Define the CSV header (only written if file doesn't exist)
  const header = [
    "Name",
    "Email",
    "College",
    "Branch",
    "Year Of Study",
    "Phone",
    "Days Of Stay",
    "UTR",
    "Payment Screenshot",
  ]
    .map(csvEscape)
    .join(",") + "\n";

  // Build the CSV row with the given data
  const row = [
    data.name,
    data.email,
    data.collegeName,
    data.branch,
    data.yearOfStudy,
    data.phone,
    data.daysOfStay,
    data.utr,
    data.paymentScreenshot,
  ]
    .map(csvEscape)
    .join(",") + "\n";

  // If the CSV file doesn't exist, create it with header first
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, header, "utf8");
  }
  // Append the new row
  fs.appendFileSync(filePath, row, "utf8");
};

export const registerAccommodation = async (req, res, next) => {
  try {
    const {
      name,
      email,
      collegeName,
      yearOfStudy,
      daysOfStay,
      phone,
      branch,
      utr,
    } = req.body;
    console.log(req.body);
    console.log(req.user);

    // Check for duplicate UTR (using "events.utr" here—if your model stores accommodations separately, adjust accordingly)
    const existingUTR = await User.findOne({ "events.utr": utr });
    if (existingUTR) {
      throw new Error(`UTR number ${utr} is already used.`);
    }

    // Use Cloudinary URL from req.file if available; otherwise, use provided URL
    const paymentScreenshot = req.file
      ? req.file.path
      : req.body.paymentScreenshot;

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
        branch,
        phone,
        accommodations: [accommodationRegistration],
      });
    } else {
      user.collegeName = user.collegeName || collegeName;
      user.yearOfStudy = user.yearOfStudy || yearOfStudy;
      user.phone = user.phone || phone;
      user.branch = user.branch || branch;
      user.accommodations.push(accommodationRegistration);
    }
    await user.save();

    // Update the accommodation CSV file with the registration data.
    await updateAccommodationCSV({
      name,
      email,
      collegeName,
      branch,
      yearOfStudy,
      phone,
      daysOfStay: stayDuration,
      utr,
      paymentScreenshot,
    });

    res.status(200).json({ message: "Accommodation registered successfully" });
  } catch (error) {
    if (error.message.includes("UTR number")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
