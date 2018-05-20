const	mongoose = require('mongoose'),
		Article = require('./article');

mongoose.connect(process.env.DB_HOST);

pantsSchema = new mongoose.Schema({
	shirts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Shirt'
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

module.exports = Article.discriminator('Pants', pantsSchema);