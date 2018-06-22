const	request = require('request-promise-native');

module.exports = async (latitude, longitude) => {
	const weatherURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;
	const weatherResponse = await request(weatherURL);
	const weatherData = JSON.parse(weatherResponse).daily.data[0];

	const {
		temperatureLow: minTemp,
		temperatureHigh: maxTemp,
		precipProbability: rainProb,
		precipIntensity: rainRate
	} = weatherData;

	const aveTemp = (minTemp + maxTemp)/2;

	return { minTemp, maxTemp, aveTemp, rainProb, rainRate };
}