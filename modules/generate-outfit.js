const 	weatherAPI = require('./weather-api'),
		select = require('./select'),
		query = require('./query'),
		camelCaseKeys = require('./camel-case-keys');

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
		raincoatMinRainRate: 1, // moderate drizzle
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
		let possibleOuterwear = await select.fromTableForUserAndTemp('outerwear', user.id, weather.aveTemp);

		if (weather.rainRate >= weatherRef.raincoatMinRainRate) {
			// if rainRate above moderate drizzle
			// first try for a raincoat
			const raincoats = possibleOuterwear.filter(e => e.specificType === 'raincoat');
			if (raincoats.length) {
				possibleOuterwear = raincoats;
			} else {
				// otherwise look for rainOk outerwear
				const rainOk = possibleOuterwear.filter(e => e.rainOk);
				if (rainOk.length) {
					possibleOuterwear = rainOk;
				}
			}
		} else {
			// if it's gonna rain, but not that much, look for rainOk stuff
			const rainOk = possibleOuterwear.filter(e => e.rainOk);
			if (rainOk) {
				possibleOuterwear = rainOk;
			}
		}

		if (possibleOuterwear.length)
			outfit.outerwear.push(selectRandom(possibleOuterwear));

	} else if (weather.aveTemp <= weatherRef.outerwearMaxTemp) {
		// if not raining, but cool
		const possibleOuterwear = await select.fromTableForUserAndTemp('outerwear', user.id, weather.aveTemp);
		if (possibleOuterwear.length)
			outfit.outerwear.push(selectRandom(possibleOuterwear));
	}

	if (weather.aveTemp <= weatherRef.doubleLayerOuterwearMaxTemp) {
		const associatedIdsQueryText1 = "SELECT a_outerwear_id FROM outerwear_outerwear_join WHERE b_outerwear_id = $1";
		const { rows: aIds } = await query(associatedIdsQueryText1, [outfit.outerwear[0].id]);

		const associatedIdsQueryText2 = "SELECT b_outerwear_id FROM outerwear_outerwear_join WHERE a_outerwear_id = $1";
		const { rows: bIds } = await query(associatedIdsQueryText2, [outfit.outerwear[0].id]);

		const associatedIds = aIds.map(e => e.a_outerwear_id).concat(bIds.map(e => e.b_outerwear_id));


		const queryText = "SELECT * FROM outerwear WHERE id = ANY ($1) AND (min_temp <= $2 OR min_temp IS NULL) AND (max_temp >= $2 OR max_temp IS NULL)";
		const queryValues = [associatedIds, weather.aveTemp];
		const { rows: possibleOuterwear } = await query(queryText, queryValues);

		if (possibleOuterwear.length)
			outfit.outerwear.push(camelCaseKeys(selectRandom(possibleOuterwear)));
	}

	// ==============
	// Shirt / Dress
	// ==============
	let possibleShirts, possibleDresses;
	if (outfit.outerwear.length) {
		const associatedShirtIdsQueryText1 = "SELECT shirt_id FROM shirt_outerwear_join WHERE outerwear_id = $1";
		const { rows: associatedShirtIdRows1 } = await query(associatedShirtIdsQueryText1, [outfit.outerwear[0].id]);
		let shirtQueryText = "SELECT * FROM shirt WHERE id = ANY ($1) AND (min_temp <= $2 OR min_temp IS NULL) AND (max_temp >= $2 OR max_temp IS NULL)";
		const shirtQueryValues = [associatedShirtIdRows1.map(e => e.shirt_id), weather.aveTemp];

		const associatedDressIdsQueryText1 = "SELECT dress_id FROM dress_outerwear_join WHERE outerwear_id = $1";
		const { rows: associatedDressIdRows1 } = await query(associatedDressIdsQueryText1, [outfit.outerwear[0].id]);
		let dressQueryText = "SELECT * FROM dress WHERE id = ANY ($1) AND (min_temp <= $2 OR min_temp IS NULL) AND (max_temp >= $2 OR max_temp IS NULL)";
		const dressQueryValues = [associatedDressIdRows1.map(e => e.dress_id), weather.aveTemp];

		if (outfit.outerwear.length > 1) {
			const associatedShirtIdsQueryText2 = "SELECT shirt_id FROM shirt_outerwear_join WHERE outerwear_id = $1";
			const { rows: associatedShirtIdRows2 } = await query(associatedShirtIdsQueryText2, [outfit.outerwear[1].id]);
			shirtQueryText += " AND id = ANY ($3)";
			shirtQueryValues.push(associatedShirtIdRows2.map(e => e.shirt_id));

			const associatedDressIdsQueryText2 = "SELECT shirt_id FROM shirt_outerwear_join WHERE outerwear_id = $1";
			const { rows: associatedDressIdRows2 } = await query(associatedDressIdsQueryText2, [outfit.outerwear[1].id]);
			dressQueryText += " AND id = ANY ($3)";
			dressQueryValues.push(associatedDressIdRows2.map(e => e.dress_id));
		}

		const { rows: shirtRows } = await query(shirtQueryText, shirtQueryValues);
		const { rows: dressRows } = await query(dressQueryText, dressQueryValues);
		possibleShirts = shirtRows;
		possibleDresses = dressRows;

	} else {
		possibleShirts = await select.fromTableForUserAndTemp('shirt', user.id, weather.aveTemp);
		possibleDresses = await select.fromTableForUserAndTemp('dress', user.id, weather.aveTemp);
	}
	
	const topChoices = possibleShirts.concat(possibleDresses);
	if (topChoices.length) {
		const selectedTop = camelCaseKeys(selectRandom(topChoices));

		if (selectedTop.articleKind === 'shirt') {
			delete selectedTop.articleType;
			outfit.shirt = selectedTop;
		} else {
			delete selectedTop.articleType;
			outfit.dress = selectedTop;
		}
	}

	// ==========
	// Pants
	// ==========
	if (outfit.shirt) {
		const associatedPantsQueryText1 = "SELECT pants_id FROM shirt_pants_join WHERE shirt_id = $1";
		const { rows: associatedPantsRows1 } = await query(associatedPantsQueryText1, [outfit.shirt.id]);
		let pantsQueryText = "SELECT * FROM pants WHERE id = ANY ($1) AND (min_temp <= $2 OR min_temp IS NULL) AND (max_temp >= $2 OR max_temp IS NULL)";
		const pantsQueryValues = [associatedPantsRows1.map(e => e.pants_id), weather.aveTemp];

		if (outfit.outerwear.length) {
			const associatedPantsQueryText2 = "SELECT pants_id FROM pants_outerwear_join WHERE outerwear_id = $1";
			const { rows: associatedPantsRows2 } = await query(associatedPantsQueryText2, [outfit.outerwear[0].id]);
			pantsQueryText += " AND id = ANY ($3)";
			pantsQueryValues.push(associatedPantsRows2.map(e => e.pants_id));

			if (outfit.outerwear.length > 1) {
				const associatedPantsQueryText3 = "SELECT pants_id FROM pants_outerwear_join WHERE outerwear_id = $1";
				const { rows: associatedPantsRows3 } = await query(associatedPantsQueryText3, [outfit.outerwear[1].id]);
				pantsQueryText += " AND id = ANY ($4)";
				pantsQueryValues.push(associatedPantsRows3.map(e => e.pants_id));
			}
		}
		const { rows: possiblePants } = await query(pantsQueryText, pantsQueryValues);
		outfit.pants = camelCaseKeys(selectRandom(possiblePants));
	}

	return outfit;
}

module.exports = {
	forUser: forUser
}





