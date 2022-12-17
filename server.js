require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
const path = require("path");
const connectDB = require("./config/dbConnection");
const mongoose = require("mongoose");

//connect to mongoDB
connectDB();

//middleware
const corsOptions = require("./config/options");
const cors = require("cors");
app.use(cors(corsOptions));

// Third party middleware
const cookieParser = require("cookie-parser");

//get the error handler middleware and use that(at last)
const errorHandler = require("./middleware/errorhandler");

//get the logger middleware and use that
const { logger, logEvents } = require("./middleware/logger");
app.use(logger);

// allow app to use json for receiving and sending
app.use(express.json());

// app.use(cookieParser);

// tell express to use static files(in views directory)
app.use("/", express.static(path.join(__dirname, "public")));
// tell express to use static files(in views's subdirectories)
app.use("/about", express.static(path.join(__dirname, "public")));

// use router according to following paths
app.use("/", require("./routes/root"));
app.use("/about", require("./routes/about"));

//use this middleware/route for other routes
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//handles error in the server
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected To MongoDB Server");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// if theres any error after connection to mongodb
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrlogs.log"
  );
});
