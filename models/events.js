const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventsSchema = new Schema({
  eventname: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  reportUrl: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  winners: [
    {
      first: {
        type: String,
      },
      second: {
        type: String,
      },
      third: {
        type: String,
      },
    },
  ],
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
});

module.exports = mongoose.model("Events", eventsSchema);
