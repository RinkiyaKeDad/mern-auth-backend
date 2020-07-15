//with mongoose we create models which are kind of the structure of how our collections are gonna look like

const mongoose = require('mongoose');

//we now need to create a schema which is just a js object which stores the format of how a user object is going to get stored in our database

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  displayName: { type: String },
});

module.exports = User = mongoose.model('user', userSchema);
//'user' is the name of the collection to store the model in
