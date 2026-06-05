require("dotenv").config();

const connectDB = require(
    "./config/db"
);

const adminRoutes = require(
    "./routes/adminRoutes"
);

const app = require("./app");

connectDB();


app.use(
    "/api/admin",
    adminRoutes
);
const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});