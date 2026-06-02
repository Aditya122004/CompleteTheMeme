const express = require("express");

const {
    getQuestions,
    submitQuiz
} = require(
    "../controllers/quizController"
);

const { protect } = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.get(
    "/questions",
    protect,
    getQuestions
);

router.post(
    "/submit",
    protect,
    submitQuiz
);

module.exports = router;