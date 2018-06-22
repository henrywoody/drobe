const	Shirt = require('../models/shirt'),
		Pants = require('../models/pants'),
		Outerwear = require('../models/outerwear'),
		request = require('request-promise-native'),
		queryString = require('query-string');

module.exports = async (user, {shirtId=null, pantsId=null, outerwearId=null}={}) => {
	/*
		Generates an oufit for a single day
		Takes into account more information than matching, like the weather
	*/

	// user.location = {};
	// user.location.latitude = '34.3';
	// user.location.longitude = '-118.5';

	const latitude = user.location.get('latitude');
	const longitude = user.location.get('longitude');

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
	const weather = { minTemp, maxTemp, aveTemp, rainProb, rainRate };
	const weatherRef = {
		rainOKRainProb: 0.5,
		raincoatRainRate: 1,
		outerwearTemp: 70,
		twoOuterwearsTemp: 50
	}

	const outfit = {
		shirt: null,
		pants: null,
		outerwears: []
	};

	const articleQuery = {
		owner: user._id,
		minTemp: { $lte: weather.minTemp },
		maxTemp: { $gte: weather.maxTemp },
	}

	// ==========
	// Outerwear
	// ==========
	if (weather.rainProb > weatherRef.rainOKRainProb) {
		// if it's likely to rain
		let possibleOuterwear, count;

		if (weather.rainRate >= weatherRef.raincoatRainRate) {
			// if rainRate above moderate drizzle
			// first try for a raincoat
			possibleOuterwear = await Outerwear.find({...articleQuery, specificType: 'raincoat'});
			count = possibleOuterwear.length;
			if (!count) {
				// if none, just go for a rainOK peice of outerwear
				possibleOuterwear = await Outerwear.find({...articleQuery, rainOK: true});
			}
		} else {
			// if rainRate at or below moderate drizzle
			// just get any rainOK outerwear
			possibleOuterwear = await Outerwear.find({...articleQuery, rainOK: true});
		}

		// pick one randomly
		count = possibleOuterwear.length;
		const index = Math.floor(Math.random() * count);
		outfit.outerwears.push(possibleOuterwear[index]);

	} else if (weather.aveTemp <= weatherRef.outerwearTemp) {
		// if its cold enough for a piece of outerwear
		const possibleOuterwear = await Outerwear.find({...articleQuery, specificType: { $ne: 'raincoat' }});
		const count = possibleOuterwear.length;
		const index = Math.floor(Math.random() * count);
		outfit.outerwears.push(possibleOuterwear[index]);
	}

	if (weather.aveTemp <= weatherRef.twoOuterwearsTemp) {
		// if its cold enough for a second piece of outerwear
		const possibleOuterwear = await Outerwear.find({...articleQuery, innerLayer: true});
		const count = possibleOuterwear.length;
		const index = Math.floor(Math.random() * count);
		outfit.outerwears.push(possibleOuterwear[index]);
	}

	// ==========
	// Shirt
	// ==========
	let shirtQuery;
	if (outfit.outerwears.length) {
		const associatedShirtIds = outfit.outerwears.map(o => o.shirts).reduce((acc, s) => acc.concat(s));
		shirtQuery = {...articleQuery, _id: { $in: associatedShirtIds }};
	} else {
		shirtQuery = {...articleQuery};
	}
	const possibleShirts = await Shirt.find(shirtQuery);
	const shirtCount = possibleShirts.length;
	const shirtIndex = Math.floor(Math.random() * shirtCount);
	console.log(possibleShirts)
	outfit.shirt = possibleShirts[shirtIndex];

	// ==========
	// Pants
	// ==========
	const associatedPantsIds = outfit.outerwears.concat(outfit.shirt).map(a => a.pants).reduce((acc, p) => acc.concat(p));
	const possiblePants = await Pants.find({...articleQuery, _id: { $in: associatedPantsIds }});
	const pantsCount = possiblePants.length;
	const pantsIndex = Math.floor(Math.random() * pantsCount);
	outfit.pants = possiblePants[pantsIndex];


	return outfit;
}