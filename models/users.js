const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      // required: true
    },
    name: {
      type: String,
      required: String,
    },
    status: {
      type: String,
      default: 'I am new!',
    },
    societies:[{
        type: Schema.Types.ObjectId,
        ref: 'Societies'
    }],
    members:[{
        type: Schema.Types.ObjectId,
        ref: 'Members'
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
