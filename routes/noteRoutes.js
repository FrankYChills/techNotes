const express = require("express");
const router = express.Router();

// use controllers to send res back
const noteController = require("../controllers/noteController");

// JWT middleware
const verifyJWT = require("../middleware/verifyJWT");

// chain diff methods of req on this route

// this needs to be a protected route so we can apply verifyJWT middleware here
router.use(verifyJWT);

router
  .route("/")
  .get(noteController.getAllNotes)
  .post(noteController.createNewNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

module.exports = router;
