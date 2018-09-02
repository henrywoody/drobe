const	express = require('express'),
		router = express.Router(),
		path = require('path');

router.use(express.static(path.join(__dirname, '..', 'client', 'build')));

router.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

module.exports = router;
