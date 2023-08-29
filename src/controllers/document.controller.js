let { documentService } = require("../services");

const getDocuments = async (req, res) => {
  const documents = await documentService.queryDocuments(req.query);
  if (documents != null || documents != undefined) {
    res.status(200).json({
      code: 200,
      msg: "Document find successfully",
      result: documents,
    });
  } else {
    res.status(404).json({
      code: 404,
      msg: "Title does not exist!",
    });
  }
};

const getDocumentById = async (req, res) => {
  const document = await documentService.getDocumentById(req.params.id);
  res
    .status(200)
    .json({ code: 200, msg: "Document find successfully", result: document });
};

module.exports = {
  getDocuments,
  getDocumentById,
};
