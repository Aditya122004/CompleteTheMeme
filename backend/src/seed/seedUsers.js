require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const users = require("./users.json");

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Loaded users:");
        console.log(users);
        console.log("Count:", users.length);

        await User.deleteMany({});

        const insertedUsers = await User.insertMany(users);

        console.log("Inserted users:");
        console.log(insertedUsers);

        console.log(
            `Successfully inserted ${insertedUsers.length} users`
        );

        const allUsers = await User.find();

        console.log("Users currently in database:");
        console.log(allUsers);

        process.exit(0);

    } catch (error) {
        console.error("SEED ERROR:");
        console.error(error);

        process.exit(1);
    }
};

seedUsers();