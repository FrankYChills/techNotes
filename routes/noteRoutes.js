const express = require("express");
const router = express.Router();

// use controllers to send res back
const noteController = require("../controllers/noteController");

// chain diff methods of req on this route
router
  .route("/")
  .get(noteController.getAllNotes)
  .post(noteController.createNewNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

module.exports = router;
