const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const UserSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  author: {
    type: String
  }

}, { collection: 'users'});

// UserSchema.pre("save", async function(next){

//   // if(this.isModified("password")){
//     console.log(passwordHash);
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     this.confirmpassword=undefined;
//   // }  
//   next();
// })

const User = mongoose.model('User', UserSchema);
module.exports = exports = User;