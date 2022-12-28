// get hold of collections/models
const User = require("../models/User");
const Note = require("../models/Note");

// for using async with mongoose while fetching and sending data
const asyncHandler = require("express-async-handler");

// get all notes
const getAllNotes = asyncHandler(async (req, res) => {
  // get all posts from collection
  const notes = await Note.find().lean();
  // technically if there are no posts it will return [] that means if(notes) will be true so we have to use advance checking
  //the below statement means if notes array has no length(0 items in array)
  if (!notes?.length) {
    return res.status(400).json({
      message: "No Notes Found",
    });
  }
  //   send json res of notes array
  res.json(notes);
});

// Post a Note (create)
const createNewNote = asyncHandler(async (req, res) => {
  // get data from the req body
  const { user, title, text } = req.body;

  // validate
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //   check if user exists for which note is being created
  const person = await User.findById(user).exec();
  if (!person) {
    return res.status(400).json({ message: "User isn't found" });
  }
  const noteObject = { user, title, text };

  // create and store note
  const note = await Note.create(noteObject);

  if (note) {
    res
      .status(201)
      .json({ message: `Note created for user ${person.username}` });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
});

// PATCH a note (update)
const updateNote = asyncHandler(async (req, res) => {
  // get the attribute to be updated from req (id is necessary)
  // we are specifying everything cause we dont know what user may update
  const { id, user, title, text, completed } = req.body;
  // validate
  if (!id) {
    return res.status(400).json({ message: "Note Id is required" });
  }
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: `No note exist with the id ${id}` });
  }
  if (user) {
    note.user = user;
  }
  if (title) {
    note.title = title;
  }
  if (text) {
    note.text = text;
  }
  if (completed) {
    if (typeof completed != "boolean") {
      return res
        .status(400)
        .json({ message: "completed attribute should be boolean" });
    }
    note.completed = completed;
  }
  // save the changes
  const updatedNote = await note.save();

  res.status(201).json({ message: `Note with id ${id} updated` });
});

// DELETE a note(delete)
const deleteNote = asyncHandler(async (req, res) => {
  //get the id of note
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Note Id is required" });
  }
  //   IMP: Don't delete a note if it is not completed
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: `No note exist with the id ${id}` });
  }
  if (!note.completed) {
    return res
      .status(400)
      .json({ message: "Can't delete that isn't completed" });
  }
  //   delete note
  const result = await note.deleteOne();
  const reply = `Note ${note.title} with id ${id} deleted`;
  res.json(reply);
});

// export all functions
module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };
