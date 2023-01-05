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
  // add the username column to each note using userId in response
  const notesWithUsername = await Promise.all(
    notes.map(async (note) => {
      // find the user assigned to each note
      const user = await User.findById(note.user).lean().exec();
      // add username field to current note
      return { ...note, username: user.username };
    })
  );
  //   send json res of notes array
  res.json(notesWithUsername);
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

  // check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
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
    // check for duplicate title
    const duplicate = await Note.findOne({ title });
    // in case we don't want to update the title, the title we receive will be the duplicate we get.So we can check for other duplicate via
    if (duplicate && duplicate?.id?.toString() !== id) {
      // theres a duplicate
      return res.status(409).json({ message: "Duplicate note title" });
    }
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
      .json({ message: "Can't delete a note that isn't completed" });
  }
  //   delete note
  const result = await note.deleteOne();
  const reply = `Note ${note.title} with id ${id} deleted`;
  res.json(reply);
});

// export all functions
module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };
