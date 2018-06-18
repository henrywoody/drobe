const	mongoose = require('mongoose'),
		Article = require('./article');

outerwearSchema = new mongoose.Schema({
	innerLayer: Boolean,
	specificType: {
		type: String,
		enum: [
			'sweater',
			'jacket',
			'vest',
			'raincoat',
			'snowcoat'
		]
	},
	shirts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Shirt'
		}
	],
	pants: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Pants'
		}
	],
	outerwears: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Outerwear'
		}
	]
});

module.exports = Article.discriminator('Outerwear', outerwearSchema);