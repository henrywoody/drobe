/*
Base class for all articles of clothing,
only to be used for inheritance.
*/

const	mongoose = require('mongoose');

mongoose.connect(process.env.DB_HOST);

articleSchema = new mongoose.Schema({
	name: String,
	description: String,
	color: String,
	maxTemp: Number,
	minTemp: Number,
	rainOK: Boolean,
	image: String,
	rating: Number,
	wearDates: [Date],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
}, {
	discriminatorKey: 'kind'
});

module.exports = mongoose.model('Article', articleSchema);