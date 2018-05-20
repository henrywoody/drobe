const	express = require('express'),
		router = express.Router();

const	shirtsRouter = require('./shirts'),
		pantsRouter = require('./pants'),
		jacketsRouter = require('./jackets'),
		raincoatsRouter = require('./raincoats');

router.use('/shirts', shirtsRouter);
router.use('/pants', pantsRouter);
router.use('/jackets', jacketsRouter);
router.use('/raincoats', raincoatsRouter);

module.exports = router;