const	mongoose = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect(process.env.DB_HOST);

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	password: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);