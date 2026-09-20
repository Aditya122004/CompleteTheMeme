const User = require("../models/user");

const usersByRollNo = new Map();

const loadUsers = async () => {
    const users = await User.find().lean();

    usersByRollNo.clear();

    for (const user of users) {
        usersByRollNo.set(user.rollNo, user);
    }

    console.log(
        `${users.length} users loaded into memory`
    );
};

const getUserByRollNo = (rollNo) => {
    return usersByRollNo.get(rollNo);
};

module.exports = {
    loadUsers,
    getUserByRollNo
};