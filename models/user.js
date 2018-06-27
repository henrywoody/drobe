const	mongoose = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	password: String,
	location: {
		name: {
			type: String
		},
		latitude: {
			type: Number,
			required: true
		},
		longitude: {
			type: Number,
			required: true
		}
	}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);