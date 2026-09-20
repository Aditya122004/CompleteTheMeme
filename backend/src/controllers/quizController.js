const Attempt = require("../models/Attempt");

const {
    getPublicQuestions,
    getQuestionById,
    normalize
} = require("../utils/quizCache");

const getQuestions = (req, res) => {
    res.json(getPublicQuestions());
};

const buildHint = (correctAnswer, userAnswer) => {
    const correctNoSpaces =
        correctAnswer.replace(/\s+/g, "");

    const correctLower =
        correctNoSpaces.toLowerCase();

    const userLower =
        userAnswer
            .replace(/\s+/g, "")
            .toLowerCase();

    let hint = "";

    for (let i = 0; i < correctLower.length; i++) {
        if (
            i < userLower.length &&
            userLower[i] === correctLower[i]
        ) {
            hint += correctNoSpaces[i];
        } else {
            hint += "_";
        }
    }

    return hint;
};

const checkAnswer = async (req, res) => {
    try {
        const { questionId, answer } = req.body;

        const question = getQuestionById(questionId);

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        const isCorrect =
            question.questionNo === 12 ||
            question.normalizedAnswer === normalize(answer);

        const hint = isCorrect
            ? ""
            : buildHint(question.answer, answer);

        return res.json({
            correct: isCorrect,
            hint
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "Invalid answers payload"
            });
        }

        let score = 0;
        const evaluatedAnswers = [];

        for (const submitted of answers) {
            const question = getQuestionById(
                submitted.questionId
            );

            if (!question) {
                continue;
            }

            const isCorrect =
                question.questionNo === 12 ||
                question.normalizedAnswer ===
                    normalize(submitted.answer);

            if (isCorrect) {
                score += question.points;
            }

            evaluatedAnswers.push({
                question: question._id,
                userAnswer: submitted.answer,
                isCorrect
            });
        }
        await Attempt.create({
            user: req.user.id,
            answers: evaluatedAnswers,
            score
        });

        return res.status(201).json({
            success: true,
            message: "Quiz submitted successfully"
        });

    } catch (error) {
        console.error("Quiz submission error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getQuestions,
    submitQuiz,
    checkAnswer
};