const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true
                },

                userAnswer: {
                    type: String,
                    default: ""
                },

                isCorrect: {
                    type: Boolean,
                    required: true
                }
            }
        ],

        score: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Attempt",
    attemptSchema
);