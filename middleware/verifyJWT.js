// apply this middleware to the protected routes
// this ensures a user has a valid access token
const jwt = require("jsonwebtoken");

//verifies if user has correct access token to access the routes
const verifyJWT = (req, res, next) => {
  // there should be authorization key in header of req
  const authHeader = req.headers.authorization || req.headers.Authorization;

  //value of authorization should start with Bearer<space>
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization error | Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  // verify the access token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({
          message: "Wrong Access Token by Client or Token Expired | Forbidden",
        });
    }
    // as access token has a userInfo attribute
    req.user = decoded.userInfo.username;
    req.roles = decoded.userInfo.roles;
    next(); //calls next middleware or router
  });
};

module.exports = verifyJWT;
