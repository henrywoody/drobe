const 	fs = require('fs'),
		weatherAPI = require('./weather-api'),
		select = require('./select'),
		query = require('./query'),
		camelCaseKeys = require('./camel-case-keys'),
		cleanArticleData = require('./clean-article-data');

function selectRandom(articles) {
	const weightedArray = articles.map((e, i) => {
		let weight = 1;
		
		// weight by days since last worn
		if (e.lastWorn) {
			weight *= Math.floor((Date.now() - e.lastWorn)/(1000*60*60*24)) + 1;
		} else if (e.last_worn) {
			weight *= Math.floor((Date.now() - e.last_worn)/(1000*60*60*24)) + 1;
		}

		// weight by rating
		weight *= e.rating;

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

async function forUser(user) {
	const weatherRef = {
		rainOKRainProb: 0.5,
		raincoatMinRainRate: 0.0025, // moderate drizzle
		outerwearMaxTemp: 70,
		doubleLayerOuterwearMaxTemp: 50
	}

	const { longitude, latitude } = user;
	const weather = await weatherAPI.getWeather(longitude, latitude);
	weather.aveTemp = Math.round(weather.aveTemp);

	const outfit = {shirt: null, pants: null, dress: null, outerwear: []};

	// ==========
	// Outerwear
	// ==========
	if (weather.rainProb > weatherRef.rainOKRainProb) {
		// if it's likely to rain
		if (weather.rainRate >= weatherRef.raincoatMinRainRate) {
			// if rainRate above moderate drizzle
			// first try for a raincoat
			const queryText = await fs.readFileSync('modules/sql-files/select-raincoats.sql', 'utf-8');
			const queryValues = [user.id, weather.aveTemp];
			const { rows } = await query(queryText, queryValues);

			if (rows.length) {
				outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
			}
		}

		if (!outfit.outerwear.length) {
			// if not raining that much or no raincoats found
			const queryText = await fs.readFileSync('modules/sql-files/select-rainok-outerwear.sql', 'utf-8');
			const queryValues = [user.id, weather.aveTemp];
			const { rows } = await query(queryText, queryValues);

			if (rows.length) {
				outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
			} else {
				const queryText = await fs.readFileSync('modules/sql-files/select-outerwear.sql', 'utf-8');
				const queryValues = [user.id, weather.aveTemp];
				const { rows } = await query(queryText, queryValues);

				if (rows.length) {
					outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
				}
			}
		}
	} else if (weather.aveTemp <= weatherRef.outerwearMaxTemp) {
		// if not raining, but cool
		// select outerwears for user & temp that are joined with at least one shirt/pants (where shirt & pants are joined) or dress
		const queryText = await fs.readFileSync('modules/sql-files/select-outerwear.sql', 'utf-8');
		const queryValues = [user.id, weather.aveTemp];
		const { rows } = await query(queryText, queryValues);

		if (rows.length) {
			outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
		}
	}

	if (weather.aveTemp <= weatherRef.doubleLayerOuterwearMaxTemp && outfit.outerwear.length) {
		const queryText = await fs.readFileSync('modules/sql-files/select-second-outerwear.sql', 'utf-8');
		const queryValues = [outfit.outerwear[0].id, weather.aveTemp];
		const { rows } = await query(queryText, queryValues);

		if (rows.length) {
			outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
		}
	}

	// ==============
	// Shirt / Dress
	// ==============
	let possibleShirts, possibleDresses;
	if (outfit.outerwear.length) {
		// get ids of shirts that have pants in common with (both) outerwear and that are joined directly with those outerwear
		const shirtQueryText = await fs.readFileSync('modules/sql-files/select-shirt-for-outerwear.sql', 'utf-8');
		const shirtQueryValues = [user.id, weather.aveTemp, outfit.outerwear.map(e => e.id), outfit.outerwear.length];
		const { rows: shirtRows } = await query(shirtQueryText, shirtQueryValues);
		possibleShirts = shirtRows;

		const dressQueryText = await fs.readFileSync('modules/sql-files/select-dress-for-outerwear.sql', 'utf-8');
		const dressQueryValues = [user.id, weather.aveTemp, outfit.outerwear.map(e => e.id), outfit.outerwear.length];
		const { rows: dressRows } = await query(dressQueryText, dressQueryValues);
		possibleDresses = dressRows;

	} else {
		const queryText = await fs.readFileSync('modules/sql-files/select-shirt.sql', 'utf-8');
		const queryValues = [user.id, weather.aveTemp];
		const { rows } = await query(queryText, queryValues);
		possibleShirts = rows;

		possibleDresses = await select.fromTableForUserAndTemp('dress', user.id, weather.aveTemp);
	}
	
	const topChoices = possibleShirts.concat(possibleDresses);
	if (topChoices.length) {
		const selectedTop = camelCaseKeys(selectRandom(topChoices));
		if (selectedTop.articleKind === 'shirt') {
			outfit.shirt = selectedTop;
		} else {
			outfit.dress = selectedTop;
		}
	}


	// ==========
	// Pants
	// ==========
	if (outfit.shirt) {
		let queryText, queryValues;
		if (outfit.outerwear.length) {
			queryText = await fs.readFileSync('modules/sql-files/select-pants-for-outerwear.sql', 'utf-8');
			queryValues = [user.id, weather.aveTemp, outfit.shirt.id, outfit.outerwear.map(e => e.id), outfit.outerwear.length];
		} else {
			queryText = await fs.readFileSync('modules/sql-files/select-pants-for-shirt.sql', 'utf-8');
			queryValues = [user.id, weather.aveTemp, outfit.shirt.id];
		}

		const { rows } = await query(queryText, queryValues);
		outfit.pants = camelCaseKeys(selectRandom(rows));
	}

	return outfit;
}

module.exports = {
	forUser: forUser
}


