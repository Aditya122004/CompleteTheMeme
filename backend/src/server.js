require("dotenv").config();

const connectDB = require("./config/db");

const adminRoutes = require("./routes/adminRoutes");

const {
    loadQuestions
} = require("./utils/quizCache");

const {
    loadUsers
} = require("./utils/userCache");

const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        await loadQuestions();
        await loadUsers();

        app.use(
            "/api/admin",
            adminRoutes
        );

        app.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });

    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();