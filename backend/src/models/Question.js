const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionNo: {
        type: Number,
        required: true,
        unique: true
    },

    question: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["mcq", "input"],
        required: true
    },

    imageUrl: {
        type: String,
        default: null
    },

    options: {
        type: [String],
        default: []
    },

    answer: {
        type: String,
        required: true
    },

    points: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model(
    "Question",
    questionSchema
);