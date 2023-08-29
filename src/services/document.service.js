/**
 * Module dependencies.
 */
const { Document } = require("../models");

/**
 *
 * @param {Object} body
 * @returns {Promise<Document>}
 */
const createDocument = async (body) => {
  return await Document.create(body);
};

/**
 *
 * @param {Object} filters
 * @param {Object} options
 * @param {string} [options.sortBy]
 * @param {number} [options.limit]
 * @param {number} [options.page]
 * @returns {Promise<Document>}
 */
const queryDocuments = async (query) => {
  console.log(query);
  let documents;
  if (query != {} || query != null || query != undefined) {
    documents = await Document.find();
  } else {
    if (query.title) {
      documents = await Document.findOne({ title: query.title });
    }
    if (query.dateView) {
      documents = await Document.find({
        createdAt: { $gte: new Date(req.query.dateView).toString() },
      });
    }
  }
  return documents;
};

/**
 *
 * @param {ObjectId} id
 * @returns {Promise<Document>}
 */
const getDocumentById = (id) => {
  return Document.findById(id);
};

/**
 *
 * @param {ObjectId} id
 * @param {Object} body
 * @returns {Promise<Document>}
 */
const updateDocumentById = async (id, body) => {
  const document = await getDocumentById(id);
  try {
    Object.assign(document, body);
    await document.save();
  } catch (err) {
    throw new Error("Document update failed: " + err.message);
  }
  return document;
};

/**
 *
 * @param {ObjectId} id
 * @returns {Promise<Document>}
 */
const deleteDocumentById = async (id) => {
  const document = await getDocumentById(id);
  try {
    await document.remove();
  } catch (err) {
    throw new Error("Document delete failed: " + err.message);
  }
  return document;
};

module.exports = {
  createDocument,
  queryDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
};
