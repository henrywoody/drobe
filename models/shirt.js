const	mongoose = require('mongoose'),
		Article = require('./article');

shirtSchema = new mongoose.Schema({
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

module.exports = Article.discriminator('Shirt', shirtSchema);