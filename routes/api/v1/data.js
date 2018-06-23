const	express = require('express'),
		router = express.Router(),
		getWeather = require('../../../modules/get-weather'),
		getCoordinates = require('../../../modules/get-coordinates');

router.get('/weather', async (req, res) => {
	const { user } = req;

	if (!user)
		return res.sendStatus(401);

	const { latitude, longitude } = req.query;

	const weather = await getWeather(latitude, longitude);

	res.json(weather);
});

router.get('/coordinates', async (req, res) => {
	const { address } = req.query;

	const locationData = await getCoordinates(address);

	if (!locationData)
		res.status(400).send('LocationNotFound');

	res.json(locationData);
});

module.exports = router;