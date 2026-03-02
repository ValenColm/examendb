# SaludPlus Backend Simulation

This project implements a hybrid architecture backend API for the "SaludPlus" clinic, handling data migration from a flat file (CSV) to a structured relational database (MySQL) and a document-oriented database (MongoDB) for optimized reading.

## Features

-   **Hybrid Architecture:** Uses MySQL for data integrity and MongoDB for fast patient history lookups.
-   **Data Normalization:** Relational schema normalized to 3NF.
-   **Idempotent Migration:** CSV file processing ensures data is inserted only once, even if the script runs multiple times.
-   **Data Consistency:** Sincronization logic implemented to update MongoDB when data in MySQL changes.

## Tech Stack

-   **Node.js & Express:** Backend Framework.
-   **MySQL (mysql2):** Relational Database.
-   **MongoDB (mongoose):** Document Database.
-   **Multer & csv-parser:** File upload and processing.

## Project Structure

```text
/
├── config/
│   ├── mysql.js       # MySQL connection pool
│   └── mongo.js       # MongoDB connection setup
├── models/
│   └── patientHistory.js # Mongoose schema
├── routes/
│   ├── doctors.js     # Doctors CRUD & Sync logic
│   ├── migration.js   # CSV parsing & data migration
│   ├── reports.js     # Financial reports (SQL)
│   └── patients.js    # Patient history API (Mongo)
├── uploads/           # Folder for stored CSV files
├── sql/
│   └── sql_tables.sql # Database creation script
├── .env               # Environment variables
├── index.js           # Main application entry point
└── package.json

Setup & Running
Install dependencies:
npm install

Environment Variables: Create a .env file based on .env.example with your database credentials.

Database Setup: Run the script in sql/sql_tables.sql in your MySQL instance.

Run Server:npm start


API Endpoints
Doctors (MySQL)
GET /api/doctors: Get all doctors or filter by ?specialty=...

GET /api/doctors/:id: Get a specific doctor.

PUT /api/doctors/:id: Update doctor. Note: Syncs changes to MongoDB automatically.

POST /api/doctors: Create a new doctor.

Reports (SQL)
GET /api/reports/revenue: Get total revenue. Accepts ?startDate=...&endDate=... filters.

Patient History (MongoDB)
GET /api/patients/:email/history: Get complete patient history document.

Migration
POST /api/upload: Upload CSV file for data migration.