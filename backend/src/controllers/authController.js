const User = require("../models/user");
const bcrypt = require("bcryptjs");

const generateToken = require(
    "../utils/generateToken"
);

const registerUser = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        const userExists =
            await User.findOne({
                $or: [
                    { username }
                ]
            });

        if (userExists) {
            return res.status(400).json({
                message:
                    "User already exists"
            });
        }
        if (!username || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters"
            });
        }
        const salt =
            await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );

        const user =
            await User.create({
                username,
                password:
                    hashedPassword
            });

        res.status(201).json({
            _id: user._id,
            username:
                user.username,
            token: generateToken(
                user._id
            )
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        const user =
            await User.findOne({
                username
            });

        if (
            user &&
            (await bcrypt.compare(
                password,
                user.password
            ))
        ) {
            return res.json({
                _id: user._id,
                username:
                    user.username,
                token:
                    generateToken(
                        user._id
                    )
            });
        }

        res.status(401).json({
            message:
                "Invalid credentials"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};