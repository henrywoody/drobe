const	express = require('express'),
		router = express.Router(),
		generateOutfit = require('../../../modules/generate-outfit'),
		wearArticles = require('../../../modules/wear-articles'),
		handleErrors = require('../../../modules/handle-db-errors');

router.get('/today', async (req, res) => {
	const { user } = req;
	try {
		const outfit = await generateOutfit.forUser(user);

		return res.json(outfit);
	} catch (err) {
		handleErrors(err, res);
	}
});

router.put('/wear', async (req, res) => {
	const { user } = req;
	try {
		await wearArticles(req.query);
		return res.json({success: 'articles worn'});
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;