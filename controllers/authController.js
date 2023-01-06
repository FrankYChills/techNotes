const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// when user logs in assign him/her a access token and refresh token
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser || !foundUser.active) {
    return res
      .status(400)
      .json({ message: "User doesn't Exists | Unauthorized User" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ message: "Invalid Password" });
  }

  // over here user verification has been done.Now create access token and refresh token for the user
  // access token help client to access protected routes or to authorize user
  const accessToken = jwt.sign(
    {
      userInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  //   refresh token helps client to have a new access token when old one expires
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // send refresh token as a coookie
  // create a secure cookie with refresh token and send it to user with name as jwt
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross Site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // send access token to the user containing username and roles
  res.json({ accessToken });
});

// when user's access token expires, generate new access token via refresh token
const refresh = (req, res) => {
  // check for cookies in the request
  const cookies = req.cookies;

  //   check if client has a refresh token named as jwt
  if (!cookies?.jwt) {
    return res
      .status(401)
      .json({ message: "Client doesn't have a refresh token" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Invalid Refresh Token | Forbidden" });
      }
      // refresh token verifies

      // check if that user exists
      const foundUser = await User.findOne({ username: decoded.username });

      if (!foundUser) {
        return res
          .status(401)
          .json({ message: "User is no longer available | UnAuthorized" });
      }

      // create a new access token and send it to the user
      const accessToken = jwt.sign(
        {
          userInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
};

// when user logs out clear the refresh token cookie assigned to user
const logout = (req, res) => {
  // check for refresh token cookie
  const cookies = req.cookies;

  // if not
  if (!cookies?.jwt) {
    return res.sendStatus(204); //No Content
  }

  // clear cookie from user's app
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
