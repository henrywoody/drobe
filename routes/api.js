const	express = require('express'),
		router = express.Router(),
		tokenAuth = require('../middleware/token-auth');

router.use(tokenAuth);

const v1Router = require('./api/v1/router');

router.use('/v1', v1Router);

module.exports = router;