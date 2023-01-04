const mongoose = require("mongoose");

// create a schema/table
const userSchema = new mongoose.Schema({
  // _id column with unique values is created by default
  username: { type: String, required: true },
  password: { type: String, required: true },
  // roles is an array cause a user can have more than one role(Also default value of roles will be employee)
  roles: { type: [String], default: ["Employee"] },
  active: { type: Boolean, default: true },
});

// create and export a Model/table/collection(here User collection with its schema) on to a database connected to mongoose
module.exports = mongoose.model("User", userSchema);
