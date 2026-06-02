const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const User = require("../models/user");

const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .sort({ questionNo: 1 });

        const formattedQuestions = questions.map(
            (question) => ({
                _id: question._id,
                questionNo: question.questionNo,
                question: question.question,
                type: question.type,
                imageUrl: question.imageUrl,
                options: question.options,

                answerPattern: question.answer
                    .split("")
                    .map((char) =>
                        char === " " ? " " : "_"
                    )
                    .join(""),

                answerLength:
                    question.answer.length
            })
        );

        res.json(formattedQuestions);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const normalize = (text) => {
    return text
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

const submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "Invalid answers payload"
            });
        }

        const existingAttempt = await Attempt.findOne({
            user: req.user._id
        });

        if (existingAttempt) {
            return res.status(400).json({
                message: "Quiz already submitted"
            });
        }

        const questionIds = answers.map(
            (answer) => answer.questionId
        );

        const questions = await Question.find({
            _id: { $in: questionIds }
        });

        const questionMap = {};

        questions.forEach((question) => {
            questionMap[question._id.toString()] = question;
        });

        let score = 0;

        const processedAnswers = [];

        for (const answer of answers) {
            const question =
                questionMap[answer.questionId];

            if (!question) {
                continue;
            }

            const isCorrect =
                normalize(question.answer) ===
                normalize(answer.answer);

            if (isCorrect) {
                score += question.points;
            }

            processedAnswers.push({
                question: question._id,
                userAnswer: answer.answer,
                isCorrect
            });
        }

        await Attempt.create({
            user: req.user._id,
            answers: processedAnswers,
            score
        });

        res.status(201).json({
            success: true,
            message: "Quiz submitted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports={
    getQuestions,
    submitQuiz
}