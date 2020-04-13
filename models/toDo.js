const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const toDoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", toDoSchema);
