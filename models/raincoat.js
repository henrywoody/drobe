const	mongoose = require('mongoose'),
		Article = require('./article');

raincoatSchema = new mongoose.Schema({
	rainOK: {
		type: Boolean,
		default: true
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
	jackets: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Jacket'
		}
	],
});

module.exports = Article.discriminator('Raincoat', raincoatSchema);