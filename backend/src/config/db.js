const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI,
            {
                maxPoolSize: 50,
                minPoolSize: 10
            }
        );

        console.log(
            `MongoDB Connected: ${conn.connection.host}`
        );

    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }
};

module.exports = connectDB;