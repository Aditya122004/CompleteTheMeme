const express = require("express");
const cors = require("cors");

const authRoutes = require(
    "./routes/authRoutes"
);
const quizRoutes = require(
    "./routes/quizRoutes"
);
const app = express();
app.use(cors());
app.use(express.json());
app.use(
    "/api/quiz",
    quizRoutes
);


app.use(
    "/api/auth",
    authRoutes
);

module.exports = app;