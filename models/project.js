const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    todos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Todo"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
