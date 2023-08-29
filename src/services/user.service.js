/**
 * Module dependencies.
 */
const { User } = require("../models");
const jwt = require("jsonwebtoken");

/**
 *
 * @param {Object} body
 * @returns {Promise<User>}
 */
const createUser = async (body) => {
  try {
    return await User.create(body);
  } catch (error) {
    throw new Error(error.errors.password);
  }
};

/**
 *
 * @param {Object} filters
 * @param {Object} options
 * @param {string} [options.sortBy]
 * @param {number} [options.limit]
 * @param {number} [options.page]
 * @returns {Promise<User>}
 */
const queryUsers = async (username) => {
  let users;
  if (!username) {
    users = await User.find();
  } else {
    users = await User.findOne({ username: username });
  }
  return users;
};

/**
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = (id) => {
  return User.findById(id);
};

/**
 *
 * @param {ObjectId} id
 * @param {Object} body
 * @returns {Promise<User>}
 */
const updateUserById = async (id, body) => {
  const user = await getUserById(id);
  try {
    Object.assign(user, body);
    await user.save();
  } catch (err) {
    throw new Error("User update failed: " + err.message);
  }
  return user;
};

/**
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const deleteUserById = async (id) => {
  const user = await getUserById(id);
  try {
    await user.remove();
  } catch (err) {
    throw new Error("User delete failed: " + err.message);
  }
  return user;
};

/**
 *
 * @param {String} username
 * @returns {Promise<User>}
 */
const deleteUserByUsername = async (username) => {
  const user = await queryUsers(username);
  try {
    await user.remove();
  } catch (err) {
    throw new Error("User delete failed: " + err.message);
  }
};

/**
 *
 * @param {string} username
 * @returns {Promise<Token>}
 */
const generateAccessToken = async (user) => {
  const username = user.username;
  const roles = user.roles;

  return jwt.sign({ username, roles }, process.env.JWT_SECRET, {
    expiresIn: "30s",
  });
};

const generateRefreshToken = async (user) => {
  const username = user.username;
  const roles = user.roles;

  return jwt.sign({ username, roles }, process.env.JWT_REFRESH_KEY, {
    expiresIn: "1h",
  });
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  deleteUserByUsername,
  generateAccessToken,
  generateRefreshToken,
};
