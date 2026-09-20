const Question = require("../models/Question");

let publicQuestionsCache = [];
const questionsById = new Map();

const normalize = (value) => {
    return value
        .replace(/\s+/g, "")
        .toLowerCase();
};

const loadQuestions = async () => {
    const questions = await Question.find()
        .sort({ questionNo: 1 })
        .lean();

    publicQuestionsCache = [];
    questionsById.clear();

    for (const question of questions) {

        // Store normalized answer for checking
        question.normalizedAnswer =
            normalize(question.answer);

        // Store full question internally
        questionsById.set(
            question._id.toString(),
            question
        );

        // Generate the same fields
        // that the old controller generated
        const answerPattern = question.answer
            .split("")
            .map((char) =>
                char === " " ? " " : "_"
            )
            .join("");

        const answerLength =
            question.answer.length;

        // Remove sensitive/internal fields
        const {
            answer,
            normalizedAnswer,
            ...publicQuestion
        } = question;

        // Add the frontend-required fields
        publicQuestion.answerPattern =
            answerPattern;

        publicQuestion.answerLength =
            answerLength;

        publicQuestionsCache.push(
            publicQuestion
        );
    }

    console.log(
        `${questions.length} questions loaded into memory`
    );
};

const getPublicQuestions = () => {
    return publicQuestionsCache;
};

const getQuestionById = (id) => {
    return questionsById.get(id);
};

module.exports = {
    loadQuestions,
    getPublicQuestions,
    getQuestionById,
    normalize
};