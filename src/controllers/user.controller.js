let { userService } = require("../services");

const createUser = async (req, res) => {
  if (req.file != undefined) {
    req.body.avatar = req.file.filename;
  }
  const user = await userService.createUser(req.body);
  res.status(200).json({ code: 200, msg: "Created new user!", result: user });
};

const getUsers = async (req, res) => {
  const username = req.query.username;
  const users = await userService.queryUsers(username);
  if (users != null || users != undefined) {
    res
      .status(200)
      .json({ code: 200, msg: "User find successfully", result: users });
  } else {
    res
      .status(404)
      .json({ code: 404, msg: "Username '" + username + "' does not exist!" });
  }
};

const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res
    .status(200)
    .json({ code: 200, msg: "User find successfully", result: user });
};

const updateUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ code: 404, msg: "User not found!" });
  } else {
    const result = await userService.updateUserById(req.params.id, req.body);
    res
      .status(200)
      .json({ code: 200, msg: "User update successfully", result: result });
  }
};

const deleteUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ code: 404, msg: "User not found!" });
  } else {
    await userService.deleteUserById(req.params.id);
    res.status(200).json({ code: 200, msg: "User deleted successfully" });
  }
};

const deleteUserByUsername = async (req, res) => {
  const user = await userService.queryUsers(req.query.username);
  if (!user) {
    res.status(404).json({ code: 404, msg: "User not found!" });
  } else {
    await userService.deleteUserByUsername(req.query.username);
    res.status(200).json({ code: 200, msg: "User deleted successfully" });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  deleteUserByUsername,
};
