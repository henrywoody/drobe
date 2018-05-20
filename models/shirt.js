const	mongoose = require('mongoose'),
		Article = require('./article');

mongoose.connect(process.env.DB_HOST);

shirtSchema = new mongoose.Schema({
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
	raincoats: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Raincoat'
		}
	]
});

module.exports = Article.discriminator('Shirt', shirtSchema);