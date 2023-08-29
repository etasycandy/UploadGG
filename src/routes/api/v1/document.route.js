const express = require("express");
const { documentController } = require("../../../controllers");
const { authMiddleware } = require("../../../middlewares");

const router = express.Router();

router
  .route("/")
  .get(authMiddleware.verifyTokenAdmin, documentController.getDocuments);

router
  .route("/:id")
  .get(authMiddleware.verifyTokenAdmin, documentController.getDocumentById);

module.exports = router;
