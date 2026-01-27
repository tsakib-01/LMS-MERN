# LMS MERN Project

A full-stack **Learning Management System (LMS)** built using the **MERN stack** (MongoDB, Express, React, Node.js).  
This project allows **admins** to manage courses, instructors, and students, while **students** can enroll in courses, track progress, and access learning materials online.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Installation](#installation)  
- [Running the Project](#running-the-project)  
- [Build for Production](#build-for-production)  
- [Screenshots / Demo](#screenshots--demo)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## Features

- User authentication (students,teachers & admin)  
- Admin dashboard to manage courses, users, and enrollments  
- Students can browse courses and enroll in them  
- Responsive UI for all devices  
- RESTful API with Express.js  
- MongoDB database for users, courses, and enrollments  
- JWT-based authentication for secure access  

---

## Tech Stack

- **Frontend:** React (Vite or CRA), Tailwind CSS / CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Atlas or local)  
- **Other Tools:** Mongoose, JWT, Nodemon, Axios  

---

## Installation and Setup

```bash
# 1. Clone the repository
git clone https://github.com/tsakib-01/lms_developing.git
cd lms-mern

# 2. Install dependencies

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# 3. Setup environment variables
# Create a file named .env inside backend folder and add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key