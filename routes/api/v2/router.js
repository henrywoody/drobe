const	express = require('express'),
		router = express.Router();

const	shirtsRouter = require('./shirts'),
		pantsRouter = require('./pants'),
		dressesRouter = require('./dresses'),
		outerwearsRouter = require('./outerwears');
		// outfitsRouter = require('./outfits'),
		dataRouter = require('./data');

router.use('/shirts', shirtsRouter);
router.use('/pants', pantsRouter);
router.use('/dresses', dressesRouter);
router.use('/outerwears', outerwearsRouter);
// router.use('/outfits', outfitsRouter);
router.use('/data', dataRouter);

module.exports = router;