const express = require("express");
const { authController, userController } = require("../../../controllers");
const { authMiddleware } = require("../../../middlewares");

const router = express.Router();

router.route("/register").post(userController.createUser);

router.route("/login").post(authController.login);

router.route("/refresh").post(authController.requestRefreshToken);

router.route("/logout").post(authMiddleware.verifyToken ,authController.logout);

module.exports = router;
