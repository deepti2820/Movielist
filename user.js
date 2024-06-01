const mongoose = require("mongoose");
const passportLoaclMongoose = require("passport-local-mongoose");
const PlayList=require("./playlist");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
  },
  drama:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:'PlayList'
  }
],
  horror:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'PlayList'
    }
  ],
  fantasy:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'PlayList'
    }
  ],
  action:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'PlayList'
    }
  ],
  comedy:[ {
    type:mongoose.Schema.Types.ObjectId,
    ref:'PlayList'
  }]
});

userSchema.plugin(passportLoaclMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
