const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  // roles is an array cause a user can have more than one role(Also default value of roles will be employee)
  roles: [{ type: String, default: "Employee" }],
  active: { type: Boolean, default: true },
});

// export a Model/table/collection
module.exports = mongoose.model("User", userSchema);
