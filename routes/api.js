const	express = require('express'),
		router = express.Router();

const v1Router = require('./api/v1/router');

router.use('/v1', v1Router);

module.exports = router;