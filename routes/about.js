const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "about", "index.html"));
});

router.get("/learn(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "about", "learn.html"));
});
module.exports = router;
