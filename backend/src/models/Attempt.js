const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

attemptSchema.index({ score: -1, createdAt: 1 });
attemptSchema.index({ user: 1, score: -1 });

module.exports = mongoose.model("Attempt", attemptSchema);