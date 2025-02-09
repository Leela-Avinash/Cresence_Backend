// controllers/workshopController.js
import User from "../models/User.js";
import fs from "fs";
import path from "path";

// Helper function to escape CSV fields (wraps field in quotes and escapes any existing quotes)
const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
};

// Helper function to update (or create) the CSV for workshop registrations
const updateWorkshopCSV = async (data) => {
  // Define the directory to store CSV files
  const csvDir = path.join(process.cwd(), "csv");
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir);
  }
  // Use workshopName as the file name (e.g. "ReactWorkshop.csv")
  const fileName = `${data.workshopName}.csv`;
  const filePath = path.join(csvDir, fileName);

  // Define the CSV header (only written if file doesn't exist)
  const header = [
    "Name",
    "Email",
    "College",
    "Branch",
    "Year Of Study",
    "Phone",
    "UTR",
    "Payment Screenshot",
  ]
    .map(csvEscape)
    .join(",") + "\n";

  // Build the row using provided data
  const row = [
    data.name,
    data.email,
    data.collegeName,
    data.branch,
    data.yearOfStudy,
    data.phone,
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

export const registerWorkshop = async (req, res, next) => {
  try {
    const {
      workshopName,
      name,
      email,
      collegeName,
      yearOfStudy,
      utr,
      phone,
      branch,
    } = req.body;

    // Check for duplicate UTR in workshops (note: using "workshops.utr" instead of "events.utr")
    const existingUTR = await User.findOne({ "workshops.utr": utr });
    if (existingUTR) {
      throw new Error(`UTR number ${utr} is already used.`);
    }

    // Use Cloudinary URL from req.file if available; otherwise use the provided URL
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
        phone,
        branch,
        workshops: [workshopRegistration],
      });
    } else {
      // Preserve existing data if available
      user.collegeName = user.collegeName || collegeName;
      user.yearOfStudy = user.yearOfStudy || yearOfStudy;
      user.phone = user.phone || phone;
      user.branch = user.branch || branch;
      user.workshops.push(workshopRegistration);
    }
    await user.save();

    // Update the workshop CSV (only update for the main user registration)
    await updateWorkshopCSV({
      workshopName,
      name,
      email,
      collegeName,
      branch,
      yearOfStudy,
      phone,
      utr,
      paymentScreenshot,
    });

    res.status(200).json({ message: "Workshop registered successfully" });
  } catch (error) {
    if (error.message.includes("UTR number")) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
