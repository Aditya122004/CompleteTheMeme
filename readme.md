# Meme Quiz App

A full-stack quiz application built for quiz and event-based competitions. The application allows users to register, log in, attempt a fixed set of quiz questions, and submit their answers. Scores are calculated and stored on the backend, while leaderboard data can be accessed through a protected admin API.

## Tech Stack

### Frontend

* React
* Vite
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

### Other Services

* Cloudinary (Image Hosting)

---

## Features

### User Authentication

* User Registration
* User Login
* JWT-based Authentication
* Password Hashing using bcrypt

### Quiz System

* Fixed set of quiz questions
* Supports:

  * Multiple Choice Questions (MCQs)
  * Input-based Questions
* Optional image-based questions
* Real-time answer checking
* Answer hint generation for incorrect attempts
* One submission per user

### Scoring

* Scores calculated server-side
* Users cannot view their scores
* Answers are never exposed to the frontend
* Secure score verification during final submission

### Leaderboard

* Admin-only leaderboard API
* Rankings sorted by:

  1. Score (descending)
  2. Submission time (ascending)

---

## Project Structure

### Backend

```text
backend/
│
├── controllers/
│   ├── authController.js
│   ├── quizController.js
│   └── adminController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── adminMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Question.js
│   └── Attempt.js
│
├── routes/
│   ├── authRoutes.js
│   ├── quizRoutes.js
│   └── adminRoutes.js
│
├── seed/
│   └── questions.js
│
├── server.js
└── .env
```

### Frontend

```text
frontend/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── routes/
│   └── App.jsx
│
└── vite.config.js
```

---

## Environment Variables

### Backend

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

ADMIN_SECRET=your_admin_secret
```

### Frontend

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

---

## Installation

### Backend

```bash
cd backend

npm install

npm run dev
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

#### Login

```http
POST /api/auth/login
```

---

### Quiz

#### Get Questions

```http
GET /api/quiz/questions
```

Returns all quiz questions without exposing answers.

#### Check Answer

```http
POST /api/quiz/check-answer
```

Request:

```json
{
  "questionId": "question_id",
  "answer": "user answer"
}
```

Response:

```json
{
  "correct": true,
  "hint": "Mr_ime"
}
```

#### Submit Quiz

```http
POST /api/quiz/submit
```

Request:

```json
{
  "answers": [
    {
      "questionId": "question_id",
      "answer": "user answer"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "Quiz submitted successfully"
}
```

---

### Admin

#### Leaderboard

```http
GET /api/admin/leaderboard
```

Header:

```http
x-admin-secret: your_admin_secret
```

Returns participant rankings.

---

## Security Measures

* Passwords hashed using bcrypt
* JWT authentication for protected routes
* Answers never exposed through APIs
* Server-side score calculation
* One quiz submission per user
* Admin leaderboard protected using secret key authentication

---

## Image Management

All quiz images are hosted on Cloudinary.

Only image URLs are stored in MongoDB, keeping the database lightweight and improving image delivery performance.

---

## Future Improvements

* Admin dashboard
* Public leaderboard
* Timed quiz sessions
* Analytics and participation reports
* Question categories
* Multiple quiz events

---

## Author

Developed using the MERN Stack for event-based meme quiz competitions.
