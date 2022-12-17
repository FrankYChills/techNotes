const express = require("express");
const router = express.Router();

// use controller to work on the data operations
const usersController = require("../controllers/userController");

//chaining diff methods(CRUD) that will trigger according to the request
router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
