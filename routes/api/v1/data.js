const	express = require('express'),
		router = express.Router(),
		getWeather = require('../../../modules/get-weather');

router.get('/weather', async (req, res) => {
	const { user } = req;

	if (!user)
		return res.sendStatus(401);

	const { latitude, longitude } = req.query;

	const weather = await getWeather(latitude, longitude);

	res.json(weather);
});

module.exports = router;