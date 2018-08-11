const	express = require('express'),
		router = express.Router(),
		generateOutfit = require('../../../modules/generate-outfit'),
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

module.exports = router;