const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const societySchema = new Schema(
  {
    society: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      // required: true
    },
    department: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      required: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    members:[{
      type: Schema.Types.ObjectId,
      ref: 'Members'
  }]
  }
);

module.exports = mongoose.model("Societies", societySchema);
