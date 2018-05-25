const	mongoose = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	password: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);