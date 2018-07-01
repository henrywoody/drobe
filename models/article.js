/*
Base class for all articles of clothing,
only to be used for inheritance.
*/

const	mongoose = require('mongoose');

articleSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	description: String,
	color: String,
	maxTemp: Number,
	minTemp: Number,
	rainOK: Boolean,
	snowOK: Boolean,
	image: {
		data: Buffer,
		contentType: String
	},
	rating: {
		type: Number,
		max: 5,
		min: 0
	},
	lastWorn: {
		type: Date,
		default: Date.now
	},
	wearDates: [Date],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	}
}, {
	discriminatorKey: 'kind'
});

articleSchema.index({name: 1, owner: 1}, {unique: true});

module.exports = mongoose.model('Article', articleSchema);