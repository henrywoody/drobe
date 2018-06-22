const	express = require('express'),
		router = express.Router();

const	shirtsRouter = require('./shirts'),
		pantsRouter = require('./pants'),
		outerwearsRouter = require('./outerwears'),
		outfitsRouter = require('./outfits');

router.use('/shirts', shirtsRouter);
router.use('/pants', pantsRouter);
router.use('/outerwears', outerwearsRouter);
router.use('/outfits', outfitsRouter);

module.exports = router;