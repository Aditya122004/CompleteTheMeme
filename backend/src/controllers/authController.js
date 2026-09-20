const jwt = require("jsonwebtoken");

const {
    getUserByRollNo
} = require("../utils/userCache");

const login = async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        if (password !== process.env.QUIZ_PASSWORD) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const user = getUserByRollNo(rollNo);

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
    {
        id: user._id,
        rollNo: user.rollNo
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);

        res.json({
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    login
};