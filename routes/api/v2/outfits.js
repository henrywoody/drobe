const	express = require('express'),
		router = express.Router(),
		generateOutfit = require('../../../modules/generate-outfit'),
		handleErrors = require('../../../modules/handle-db-errors');

router.get('/today', async (req, res) => {

});

module.exports = router;