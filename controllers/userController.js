// get the collections
const User = require("../models/User");
const Note = require("../models/Note");

//for using async with mongoose
const asyncHandler = require("express-async-handler");
// for hashing password
const bcrypt = require("bcrypt");

// GET All users (read)
const getAllUsers = asyncHandler(async (req, res) => {
  // get all users from the collection
  const users = await User.find().select("-password").lean();
  // technically if there are no users it will return [] that means if(users) will be true so we have to use advance checking
  //the below statement means if users array has no length(0 items in array)
  if (!users?.length) {
    return res.status(400).json({ message: "No Users Found" });
  }
  // convert res to json
  res.json(users);
});

// POST a user(create)
const createNewUser = asyncHandler(async (req, res) => {
  //get the data from the url or request body
  const { username, password, roles } = req.body;

  // validate
  if (!username || !password) {
    // returning here ...
    return res.status(400).json({ message: "All fields are required" });
  }
  // check for duplicate user
  // Case check here is insensitive meaning dave will be same as Dave or DAVE etc.
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    // returning here...
    return res.status(409).json({ message: "This name is not available" });
  }
  // if everything goes well
  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPassword }
      : { username, password: hashedPassword, roles };

  // create and store new user
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `message: New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// PATCH a user(update)
const updateUser = asyncHandler(async (req, res) => {
  //get the data from the url or request body (id is necessary)
  const { id, username, roles, active, password } = req.body;

  // validate
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active != "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User Not Found" });
  }

  // check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  // allow updates to the original user

  // if a user is found with the username as passed username but with different id than passed id that means its a duplicate user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res
      .status(409)
      .json({ message: "The User found to be update is a duplicate user" });
  }
  // else user found to update

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // hash and update
    user.password = await bcrypt.hash(password, 10);
  }

  // save the user
  const updatedUser = await user.save();

  res.status(201).json({ message: `User ${username} got updated` });
});

// DELETE a user(delete)
const deleteUser = asyncHandler(async (req, res) => {
  //get the data from the url or request body
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "UserId is required" });
  }

  // IMP CHECK - DON'T DELETE A USER IF NOTE IS ASSIGNED TO HIM
  const note = await Note.findOne({ user: id }).lean().exec();
  // if we get note object that means notes are assigned to him
  if (note) {
    return res
      .status(400)
      .json({ message: "Can't delete. User has assigned notes" });
  }
  // if no notes found for user delete him
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  //   IMP - see below statement ITS user.deleteOne not User.deleteOne
  const result = await user.deleteOne();

  //   _id is added by default for users when they are created
  const reply = `Username ${result.username} with id ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
