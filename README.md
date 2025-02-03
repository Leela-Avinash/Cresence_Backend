# Event Registration Backend

This project provides a backend server for handling registrations for events (with team support), workshops, and accommodations. It now includes Google authentication using Passport.js.

## Features

- **Google Authentication:** Users can log in using their Google accounts.
- **Events:** Supports single and team registrations.
- **Workshops:** Single-person registration.
- **Accommodation:** Single-person registration.
- **User Profile:** Retrieve a user’s profile with all registered events, workshops, and accommodations.
- **File Uploads:** Payment screenshots are uploaded to the server using Multer.

## Tech Stack

- Node.js
- Express
- MongoDB (with Mongoose)
- Passport.js (Google OAuth 2.0)
- Multer

## Setup Instructions

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file at the project root with your environment variables:
MONGO_URI=your_mongo_connection_string 
PORT=5000 
GOOGLE_CLIENT_ID=your_google_client_id 
GOOGLE_CLIENT_SECRET=your_google_client_secret 
SESSION_SECRET=your_session_secret
4. Create an empty `uploads/` folder at the root.
5. Start the server using `npm run dev`.

## API Endpoints

- **Google Authentication:**
- **GET** `/api/users/google` – Initiates Google OAuth login.
- **GET** `/api/users/google/callback` – Google OAuth callback URL.
- **User Profile:**
- **GET** `/api/users/profile` – Retrieve the authenticated user's profile.
- **Event Registration:**
- **POST** `/api/events/register` – Register for an event.
- **Workshop Registration:**
- **POST** `/api/workshops/register` – Register for a workshop.
- **Accommodation Registration:**
- **POST** `/api/accommodations/register` – Register for accommodation.
