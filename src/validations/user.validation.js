const Joi = require("joi");
const { password, objectId } = require("./custom.validation");

const createUser = {
  body: Joi.object().keys({
    username: Joi.string().lowercase().trim().required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .lowercase()
      .trim()
      .required(),
    phoneNumber: Joi.string()
      .trim()
      .required()
      .pattern(
        new RegExp("^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$"),
      ),
    password: Joi.string().trim().required().custom(password),
    fullName: Joi.string().trim().required(),
    address: Joi.string().trim(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    username: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const getUserByUsername = {
  params: Joi.object().keys({
    username: Joi.string(),
  }),
};

const updateUserById = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      username: Joi.string(),
      password: Joi.string().custom(password),
    })
    .min(1),
};

const deleteUserById = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUserByUsername,
  updateUserById,
  deleteUserById,
};
