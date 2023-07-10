const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const membersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      // required: true
    },
    email: {
      type: String,
      required: true,
    },
    phoneno: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    ofSociety: {
      type: Schema.Types.ObjectId,
      ref: "Societies",
      required: true,
    },
  }
);

module.exports = mongoose.model("Members", membersSchema);
