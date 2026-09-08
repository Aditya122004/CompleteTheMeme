const User = require("../models/user");
const generateToken = require("../utils/generateToken");

const login = async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    if (!rollNo || !password) {
      return res.status(400).json({
        message: "Roll number and password are required"
      });
    }

    // Check common quiz password
    if (password !== process.env.QUIZ_PASSWORD) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // Check whether participant exists
    const user = await User.findOne({ rollNo });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        rollNo: user.rollNo,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
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