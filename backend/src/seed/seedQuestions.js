const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Question = require("../models/Question");
const questions = require("./questions");

dotenv.config();

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    await Question.deleteMany({});
    await Question.insertMany(questions);

    console.log("Questions seeded");
    process.exit();
}

seed();