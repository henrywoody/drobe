const	request = require('request-promise-native');

module.exports = async (address) => {
	const response = await request(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${global.config.googleApiKey}`);
	const jsonResponse = JSON.parse(response);

	try {
		const returnData = {};
		returnData.location = jsonResponse.results[0].formatted_address;
		returnData.latitude = jsonResponse.results[0].geometry.location.lat;
		returnData.longitude = jsonResponse.results[0].geometry.location.lng;

		return returnData;
	} catch (err) {
		return null;
	}
}