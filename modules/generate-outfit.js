const 	weatherAPI = require('./weather-api'),
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
		const queryText = `
			SELECT
				outerwear.*
			FROM
				outerwear
			INNER JOIN
				(SELECT
					*
				FROM
					outerwear_outerwear_join
				WHERE
					a_outerwear_id = $1 OR b_outerwear_id = $1
				) AS joined_outerwear
			ON
				outerwear.id = ANY(ARRAY[joined_outerwear.a_outerwear_id, joined_outerwear.b_outerwear_id])
			WHERE
				outerwear.id != $1 AND (outerwear.min_temp <= $2 OR outerwear.min_temp IS NULL) AND (outerwear.max_temp >= $2 OR outerwear.max_temp IS NULL);
		`;
		const queryValues = [outfit.outerwear[0].id, weather.aveTemp];
		const { rows } = await query(queryText, queryValues);

		if (rows.length)
			outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
	}

	// ==============
	// Shirt / Dress
	// ==============
	let possibleShirts, possibleDresses;
	if (outfit.outerwear.length) {
		// get ids of shirts that have pants in common with (both) outerwear and that are joined directly with those outerwear
		const shirtQueryText = `
			SELECT
				shirt.*
			FROM
				shirt
			INNER JOIN
				(SELECT
					joined_shirt.shirt_id
				FROM
					(SELECT
						DISTINCT shirt_pants_join.shirt_id, pants_outerwear_join.outerwear_id
					FROM
						shirt_pants_join
					INNER JOIN
						pants_outerwear_join
					ON
						shirt_pants_join.pants_id = pants_outerwear_join.pants_id
					INNER JOIN
						shirt_outerwear_join
					ON
						shirt_pants_join.shirt_id = shirt_outerwear_join.shirt_id AND pants_outerwear_join.outerwear_id = shirt_outerwear_join.outerwear_id
					WHERE
						pants_outerwear_join.outerwear_id = ANY($1)
					) AS joined_shirt
				GROUP BY
					joined_shirt.shirt_id
				HAVING
					COUNT(joined_shirt.shirt_id) = $2
				) AS possible_shirt
			ON
				shirt.id = possible_shirt.shirt_id
			WHERE 
				(shirt.min_temp <= $3 OR shirt.min_temp IS NULL) AND (shirt.max_temp >= $3 OR shirt.max_temp IS NULL)
		`;
		const shirtQueryValues = [outfit.outerwear.map(e => e.id), outfit.outerwear.length, weather.aveTemp];
		const { rows: shirtRows } = await query(shirtQueryText, shirtQueryValues);
		possibleShirts = shirtRows;

		const dressQueryText = `
			SELECT
				dress.*
			FROM
				dress
			INNER JOIN
				(SELECT
					joined_dress.dress_id
				FROM 
					(SELECT
						DISTINCT dress_id, outerwear_id
					FROM
						dress_outerwear_join
					WHERE
						outerwear_id = ANY($1)
					) AS joined_dress
				GROUP BY
					joined_dress.dress_id
				HAVING
					COUNT(joined_dress.dress_id) = $2
				) AS possible_dress
			ON
				dress.id = possible_dress.dress_id
			WHERE
				(dress.min_temp <= $3 OR dress.min_temp IS NULL) AND (dress.max_temp >= $3 OR dress.max_temp IS NULL)
		`;
		const dressQueryValues = [outfit.outerwear.map(e => e.id), outfit.outerwear.length, weather.aveTemp];
		const { rows: dressRows } = await query(dressQueryText, dressQueryValues);
		possibleDresses = dressRows;

	} else {
		possibleShirts = await select.fromTableForUserAndTemp('shirt', user.id, weather.aveTemp);
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
			queryText = `
				SELECT
					pants.*
				FROM
					pants
				INNER JOIN
					(SELECT
						shirt_joined_pants.pants_id
					FROM
						(SELECT
							pants_id
						FROM
							shirt_pants_join
						WHERE
							shirt_id = $1
						) AS shirt_joined_pants
					INNER JOIN
						(SELECT
							pants_id
						FROM
							pants_outerwear_join
						WHERE
							outerwear_id = ANY($2)
						GROUP BY
							pants_id
						HAVING
							COUNT(pants_id) = $3
						) AS outerwear_joined_pants
					ON
						shirt_joined_pants.pants_id = outerwear_joined_pants.pants_id
					) AS possible_pants
				ON
					pants.id = possible_pants.pants_id
				WHERE
					(pants.min_temp <= $4 OR pants.min_temp IS NULL) AND (pants.max_temp >= $4 OR pants.max_temp IS NULL)
			`;
			queryValues = [outfit.shirt.id, outfit.outerwear.map(e => e.id), outfit.outerwear.length, weather.aveTemp];
		} else {
			queryText = `
				SELECT
					pants.*
				FROM
					pants
				INNER JOIN
					(SELECT
						pants_id
					FROM
						shirt_pants_join
					WHERE
						shirt_id = $1
					) AS joined_pants
				ON
					pants.id = joined_pants.pants_id
				WHERE 
					(pants.min_temp <= $2 OR pants.min_temp IS NULL) AND (pants.max_temp >= $2 OR pants.max_temp IS NULL)
			`;
			queryValues = [outfit.shirt.id, weather.aveTemp];
		}

		const { rows } = await query(queryText, queryValues);
		outfit.pants = camelCaseKeys(selectRandom(rows));
	}

	return outfit;
}

module.exports = {
	forUser: forUser
}


