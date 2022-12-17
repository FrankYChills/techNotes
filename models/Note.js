const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
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
    //mongodb will auto create two columns createdAt and updatedAt if this set to true
    timestamps: true,
  }
);
//apply auto increment as a plugin to schema
// this creates a new collection as counter with id as ticketNums and auto increments it
// also it creates a new ticket column in noteSchema and increments it according to counter's id
noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});
// export a Model/table/collection
module.exports = mongoose.model("Note", noteSchema);
