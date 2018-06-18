const	express = require('express'),
		router = express.Router();

const	shirtsRouter = require('./shirts'),
		pantsRouter = require('./pants'),
		outerwearsRouter = require('./outerwears');

router.use('/shirts', shirtsRouter);
router.use('/pants', pantsRouter);
router.use('/outerwears', outerwearsRouter);

module.exports = router;