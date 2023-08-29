/**
 * Module dependencies.
 */
const jwt = require("jsonwebtoken");
const { userService } = require("../services");

let refreshTokens = [];

const login = async (req, res) => {
  const user = await userService.queryUsers(req.body.username);

  if (!user || !(await user.isPasswordMatch(req.body.password))) {
    return res
      .status(401)
      .json({ code: 401, msg: "Incorrect username or password!" });
  } else {
    const accessToken = await userService.generateAccessToken(user);
    const refreshToken = await userService.generateRefreshToken(user);
    const { password, ...others } = user._doc;

    refreshTokens.push(refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });

    return res.status(200).json({
      code: 200,
      msg: "Logged in successfully.",
      result: { ...others, accessToken },
    });
  }
};

const requestRefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    if (!refreshTokens.includes(refreshToken)) {
      return res
        .status(403)
        .json({ code: 403, msg: "Refresh token is not valid" });
    } else {
      try {
        const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

        const newAccessToken = await userService.generateAccessToken(user);
        const newRefreshToken = await userService.generateRefreshToken(user);

        refreshTokens.push(newRefreshToken);

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        return res.status(200).json({ code: 200, msg: "OK", newAccessToken });
      } catch (err) {
        console.log(err.message);
      }
    }
  } else {
    return res.status(401).json({ code: 401, msg: "You're not authenticated" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("refreshToken");
  refreshTokens = refreshTokens.filter(
    (token) => token !== req.cookies.refreshToken,
  );
  res.status(200).json({ code: 200, msg: "Logged out successfully!" });
};

module.exports = {
  login,
  requestRefreshToken,
  logout,
};
