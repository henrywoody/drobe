const	Shirt = require('../models/shirt'),
		Pants = require('../models/pants'),
		Outerwear = require('../models/outerwear'),
		getWeather = require('./get-weather');

function selectRandom(articles) {
	const weightedArray = articles.map((a, i) => {
		let weight = 1;
		
		// weight by days since last worn
		weight *= Math.floor((Date.now() - a.lastWorn)/(1000*60*60*24)) + 1;
		// weight by rating
		weight *= a.rating;

		const weightArray = [];
		for (let n = 0; n < weight; n++) {
			weightArray.push(i);
		}

		return weightArray;
	}).reduce((acc, x) => acc.concat(x), []);

	const weightedIndex = Math.floor(Math.random() * weightedArray.length);
	const articleIndex = weightedArray[weightedIndex];
	return articles[articleIndex];
}

module.exports = async (user, {shirtId=null, pantsId=null, outerwearId=null}={}) => {
	/*
		Generates an oufit for a single day
		Takes into account more information than matching, like the weather
	*/

	const latitude = user.location.get('latitude');
	const longitude = user.location.get('longitude');

	const weather = await getWeather(latitude, longitude);

	const weatherRef = {
		rainOKRainProb: 0.5,
		raincoatRainRate: 1,
		outerwearTemp: 70,
		twoOuterwearsTemp: 50
	};

	const outfit = {
		shirt: null,
		pants: null,
		outerwears: []
	};

	const articleQuery = {
		owner: user._id,
		minTemp: { $lte: weather.minTemp },
		maxTemp: { $gte: weather.maxTemp },
	};

	// ==========
	// Outerwear
	// ==========
	if (weather.rainProb > weatherRef.rainOKRainProb) {
		// if it's likely to rain
		let possibleOuterwear;

		if (weather.rainRate >= weatherRef.raincoatRainRate) {
			// if rainRate above moderate drizzle
			// first try for a raincoat
			possibleOuterwear = await Outerwear.find({...articleQuery, specificType: 'raincoat'});
			const count = possibleOuterwear.length;
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
		outfit.outerwears.push(selectRandom(possibleOuterwear));

	} else if (weather.aveTemp <= weatherRef.outerwearTemp) {
		// if its cold enough for a piece of outerwear
		const possibleOuterwear = await Outerwear.find({...articleQuery, specificType: { $ne: 'raincoat' }});
		outfit.outerwears.push(selectRandom(possibleOuterwear));
	}

	if (weather.aveTemp <= weatherRef.twoOuterwearsTemp) {
		// if its cold enough for a second piece of outerwear
		const associatedOuterwearIds = outfit.outerwears[0].outerwears;
		const possibleOuterwear = await Outerwear.find({...articleQuery, innerLayer: true, _id: { $in: associatedOuterwearIds }});
		outfit.outerwears.push(selectRandom(possibleOuterwear));
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
	outfit.shirt = selectRandom(possibleShirts);

	// ==========
	// Pants
	// ==========
	const associatedPantsIds = outfit.outerwears.concat(outfit.shirt).map(a => a.pants).reduce((acc, p) => acc.concat(p));
	const possiblePants = await Pants.find({...articleQuery, _id: { $in: associatedPantsIds }});
	outfit.pants = selectRandom(possiblePants);


	return outfit;
}