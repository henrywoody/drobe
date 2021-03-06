const	express = require('express'),
		router = express.Router(),
		weatherAPI = require('../../../modules/weather-api'),
		getCoordinates = require('../../../modules/get-coordinates'),
		handleErrors = require('../../../modules/handle-db-errors');

router.get('/weather', async (req, res) => {
	const { user } = req;

	if (!user)
		return res.sendStatus(401);

	const { longitude, latitude } = req.query;

	try {
		const weather = await weatherAPI.getWeather(longitude, latitude);
		res.json(weather);
	} catch (err) {
		handleErrors(err, res);
	}
});

router.get('/coordinates', async (req, res) => {
	const { address } = req.query;

	const locationData = await getCoordinates(address);

	if (!locationData)
		res.status(400).json({error: 'LocationNotFound'});

	res.json(locationData);
});

module.exports = router;