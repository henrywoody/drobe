const	express = require('express'),
		router = express.Router(),
		Shirt = require('../../../models/shirt'),
		Pants = require('../../../models/pants'),
		Outerwear = require('../../../models/outerwear'),
		generateAllOutfits = require('../../../modules/generate-all-outfits'),
		generateOutfit = require('../../../modules/generate-outfit'),
		handleErrors = require('../../../modules/handle-db-errors');


router.get('/', async (req, res) => {
	const { user } = req;
	const { shirts, pants, outerwears } = req.query;
	
	const outfits = await generateAllOutfits(user._id, {
		shirtIds: shirts,
		pantsIds: pants,
		outerwearIds: outerwears
	});

	res.json(outfits);
});

router.get('/today', async (req, res) => {
	const { user } = req;
	const { shirt, pants, outerwear } = req.query;

	const outfit = await generateOutfit(user, {
		shirtId: shirt,
		pantsId: pants,
		outerwearId: outerwear
	});

	res.json(outfit);
})

module.exports = router;