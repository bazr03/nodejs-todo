const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  projects: [
    {
      type: Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
  todos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Todo"
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
