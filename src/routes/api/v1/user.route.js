const express = require("express");
const { userController } = require("../../../controllers");
const { authMiddleware } = require("../../../middlewares");

const router = express.Router();

router
  .route("/")
  .post(authMiddleware.verifyTokenAdmin, userController.createUser)
  .get(authMiddleware.verifyTokenAdmin, userController.getUsers)
  .delete(authMiddleware.verifyTokenAdmin, userController.deleteUserByUsername);

router
  .route("/:id")
  .get(authMiddleware.verifyTokenAdmin, userController.getUserById)
  .patch(authMiddleware.verifyTokenAdmin, userController.updateUserById)
  .delete(authMiddleware.verifyTokenAdmin, userController.deleteUserById);

module.exports = router;
