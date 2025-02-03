// config/config.js
import dotenv from "dotenv";
dotenv.config();

export default {
  MONGO_URI: process.env.MONGO_URI,
  // Add any additional configuration variables here
};
