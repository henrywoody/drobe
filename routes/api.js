const	express = require('express'),
		router = express.Router(),
		tokenAuth = require('../middleware/token-auth');

router.use(tokenAuth);

const v2Router = require('./api/v2/router');

router.use('/v2', v2Router);


module.exports = router;