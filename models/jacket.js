const	mongoose = require('mongoose'),
		Article = require('./article');

mongoose.connect(process.env.DB_HOST);

jacketSchema = new mongoose.Schema({
	innerWear: Boolean,
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
	raincoats: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Raincoat'
		}
	]
});

module.exports = Article.discriminator('Jacket', jacketSchema);