const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        rollNo: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            default: null,
            trim: true
        },

        phoneNumber: {
            type: String,
            default: null,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);