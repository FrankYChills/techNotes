const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

// apply rate limiter to /auth POST route
router.route("/").post(loginLimiter, authController.login);

// route - /auth/refresh GET
router.route("/refresh").get(authController.refresh);

// route - /auth/logout POST
router.route("/logout").post(authController.logout);

module.exports = router;
