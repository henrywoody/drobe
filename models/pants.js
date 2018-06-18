const	mongoose = require('mongoose'),
		Article = require('./article');

pantsSchema = new mongoose.Schema({
	shirts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Shirt'
		}
	],
	outerwears: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Outerwear'
		}
	]
});

module.exports = Article.discriminator('Pants', pantsSchema);