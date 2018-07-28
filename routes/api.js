const	express = require('express'),
		router = express.Router(),
		tokenAuth = require('../middleware/token-auth');

router.use(tokenAuth);

const v1Router = require('./api/v1/router');
const v2Router = require('./api/v2/router');

router.use('/v1', v1Router);
router.use('/v2', v2Router);


module.exports = router;