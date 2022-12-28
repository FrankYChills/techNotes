const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// create a schema/table
const noteSchema = new mongoose.Schema(
  {
    // each note will have a refrence to user
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    //   required true means there must be a value for text
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  {
    //mongodb will auto create two columns createdAt and updatedAt if this is set to true
    timestamps: true,
  }
);
//apply auto increment as a plugin to schema
// this creates a new collection as counter with id as ticketNums and it will have a seq attribute that will be same as last note's ticket value.
// ticket number will be auto incremented as new note gets added
// also it creates a new ticket column in noteSchema and increments it according to counter's seq
noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});
// create and export a Model/table/collection(here User collection with its schema) on to a database connected to mongoose

module.exports = mongoose.model("Note", noteSchema);
