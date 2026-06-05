const express = require(
    "express"
);

const {
    getLeaderboard
} = require(
    "../controllers/adminController"
);

const adminAuth = require(
    "../middleware/adminMiddleware"
);

const router =
    express.Router();

router.get(
    "/leaderboard",
    adminAuth,
    getLeaderboard
);

module.exports = router;