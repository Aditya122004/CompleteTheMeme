const Attempt = require("../models/Attempt");

const getLeaderboard = async (
    req,
    res
) => {
    try {

        const leaderboard =
            await Attempt.find()
                .populate(
                    "user",
                    "username"
                )
                .sort({
                    score: -1,
                    createdAt: 1
                });

        const result =
            leaderboard.map(
                (
                    attempt,
                    index
                ) => ({
                    rank:
                        index + 1,
                    username:
                        attempt.user
                            ?.username,
                    score:
                        attempt.score,
                    submittedAt:
                        attempt.createdAt
                })
            );

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });

    }
};

module.exports = {
    getLeaderboard
};