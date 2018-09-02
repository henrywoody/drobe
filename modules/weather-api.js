const	request = require('request-promise-native');
class weatherAPI {
	async getWeather(longitude, latitude) {
		const weatherURL = `https://api.darksky.net/forecast/${global.config.weatherApiKey}/${latitude},${longitude}`;
		const weatherResponse = await request(weatherURL);
		const weatherData = JSON.parse(weatherResponse).daily.data[0];

		const {
			temperatureLow: minTemp,
			temperatureHigh: maxTemp,
			precipProbability: rainProb,
			precipIntensity: rainRate,
			summary
		} = weatherData;

		const aveTemp = (minTemp + maxTemp)/2;

		return { summary, aveTemp, minTemp, maxTemp, rainProb, rainRate };
	}
}

module.exports = new weatherAPI();