const	express = require('express'),
		router = express.Router(),
		generateOutfit = require('../../../modules/generate-outfit'),
		handleErrors = require('../../../modules/handle-db-errors');

router.get('/today', async (req, res) => {
	const { user } = req;

	const outfit = await generateOutfit.forUser(user);

	return res.json(outfit);
});

module.exports = router;