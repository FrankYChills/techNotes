const express = require("express");
const router = express.Router();

// use controller to work on the data operations
const usersController = require("../controllers/userController");

//JWT Middleware
const verifyJWT = require("../middleware/verifyJWT");

//chaining diff methods(CRUD) that will trigger according to the request

// this needs to be a protected route so we can apply verifyJWT middleware here
router.use(verifyJWT);

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
