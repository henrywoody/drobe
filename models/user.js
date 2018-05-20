const	mongoose = require('mongoose');

mongoose.connect(process.env.DB_HOST);

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	password: {
		type: String
	}
});

module.exports = mongoose.model('User', userSchema);