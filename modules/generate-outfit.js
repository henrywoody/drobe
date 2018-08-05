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
			const queryText = `
				SELECT
					valid_outerwear.*
				FROM
					(SELECT
						*
					FROM
						outerwear
					WHERE
						outerwear.specific_type = 'raincoat' AND outerwear.user_id = $1 AND (outerwear.min_temp <= $2 OR outerwear.min_temp IS NULL) AND (outerwear.max_temp >= $2 OR outerwear.max_temp IS NULL)
					) AS valid_outerwear
				INNER JOIN
					(SELECT
						COALESCE(shirt_pants_joined_outerwear.outerwear_id, dress_joined_outerwear.outerwear_id) AS outerwear_id
					FROM
						(SELECT
							DISTINCT shirt_outerwear_join.outerwear_id
						FROM
							shirt_outerwear_join
						FULL OUTER JOIN
							pants_outerwear_join
						ON
							shirt_outerwear_join.outerwear_id = pants_outerwear_join.outerwear_id
						INNER JOIN
							shirt_pants_join
						ON
							shirt_outerwear_join.shirt_id = shirt_pants_join.shirt_id AND pants_outerwear_join.pants_id = shirt_pants_join.pants_id
						) AS shirt_pants_joined_outerwear
					FULL OUTER JOIN
						(SELECT
							DISTINCT outerwear_id
						FROM
							dress_outerwear_join
						) AS dress_joined_outerwear
					ON
						shirt_pants_joined_outerwear.outerwear_id = dress_joined_outerwear.outerwear_id
					) AS joined_outerwear
				ON
					valid_outerwear.id = joined_outerwear.outerwear_id
			`;
			const queryValues = [user.id, weather.aveTemp];
			const { rows } = await query(queryText, queryValues);

			if (rows.length)
				outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
		}

		if (!outfit.outerwear.length) {
			// if not raining enough or no raincoats found
			const queryText = `
				SELECT
					valid_outerwear.*
				FROM
					(SELECT
						*
					FROM
						outerwear
					WHERE
						outerwear.rain_ok AND outerwear.user_id = $1 AND (outerwear.min_temp <= $2 OR outerwear.min_temp IS NULL) AND (outerwear.max_temp >= $2 OR outerwear.max_temp IS NULL)
					) AS valid_outerwear
				INNER JOIN
					(SELECT
						COALESCE(shirt_pants_joined_outerwear.outerwear_id, dress_joined_outerwear.outerwear_id) AS outerwear_id
					FROM
						(SELECT
							DISTINCT shirt_outerwear_join.outerwear_id
						FROM
							shirt_outerwear_join
						FULL OUTER JOIN
							pants_outerwear_join
						ON
							shirt_outerwear_join.outerwear_id = pants_outerwear_join.outerwear_id
						INNER JOIN
							shirt_pants_join
						ON
							shirt_outerwear_join.shirt_id = shirt_pants_join.shirt_id AND pants_outerwear_join.pants_id = shirt_pants_join.pants_id
						) AS shirt_pants_joined_outerwear
					FULL OUTER JOIN
						(SELECT
							DISTINCT outerwear_id
						FROM
							dress_outerwear_join
						) AS dress_joined_outerwear
					ON
						shirt_pants_joined_outerwear.outerwear_id = dress_joined_outerwear.outerwear_id
					) AS joined_outerwear
				ON
					valid_outerwear.id = joined_outerwear.outerwear_id
			`;
			const queryValues = [user.id, weather.aveTemp];
			const { rows } = await query(queryText, queryValues);

			if (rows.length) {
				outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
			} else {
				const queryText = `
					SELECT
						valid_outerwear.*
					FROM
						(SELECT
							*
						FROM
							outerwear
						WHERE
							outerwear.user_id = $1 AND (outerwear.min_temp <= $2 OR outerwear.min_temp IS NULL) AND (outerwear.max_temp >= $2 OR outerwear.max_temp IS NULL)
						) AS valid_outerwear
					INNER JOIN
						(SELECT
							COALESCE(shirt_pants_joined_outerwear.outerwear_id, dress_joined_outerwear.outerwear_id) AS outerwear_id
						FROM
							(SELECT
								DISTINCT shirt_outerwear_join.outerwear_id
							FROM
								shirt_outerwear_join
							FULL OUTER JOIN
								pants_outerwear_join
							ON
								shirt_outerwear_join.outerwear_id = pants_outerwear_join.outerwear_id
							INNER JOIN
								shirt_pants_join
							ON
								shirt_outerwear_join.shirt_id = shirt_pants_join.shirt_id AND pants_outerwear_join.pants_id = shirt_pants_join.pants_id
							) AS shirt_pants_joined_outerwear
						FULL OUTER JOIN
							(SELECT
								DISTINCT outerwear_id
							FROM
								dress_outerwear_join
							) AS dress_joined_outerwear
						ON
							shirt_pants_joined_outerwear.outerwear_id = dress_joined_outerwear.outerwear_id
						) AS joined_outerwear
					ON
						valid_outerwear.id = joined_outerwear.outerwear_id
				`;
				const queryValues = [user.id, weather.aveTemp];
				const { rows } = await query(queryText, queryValues);

				if (rows.length)
					outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
			}
		}

	} else if (weather.aveTemp <= weatherRef.outerwearMaxTemp) {
		// if not raining, but cool
		// select outerwears for user & temp that are joined with at least one shirt/pants (where shirt & pants are joined) or dress
		const queryText = `
		SELECT
			valid_outerwear.*
		FROM
			(SELECT
				*
			FROM
				outerwear
			WHERE
				outerwear.user_id = $1 AND (outerwear.min_temp <= $2 OR outerwear.min_temp IS NULL) AND (outerwear.max_temp >= $2 OR outerwear.max_temp IS NULL)
			) AS valid_outerwear
		INNER JOIN
			(SELECT
				COALESCE(shirt_pants_joined_outerwear.outerwear_id, dress_joined_outerwear.outerwear_id) AS outerwear_id
			FROM
				(SELECT
					DISTINCT shirt_outerwear_join.outerwear_id
				FROM
					shirt_outerwear_join
				FULL OUTER JOIN
					pants_outerwear_join
				ON
					shirt_outerwear_join.outerwear_id = pants_outerwear_join.outerwear_id
				INNER JOIN
					shirt_pants_join
				ON
					shirt_outerwear_join.shirt_id = shirt_pants_join.shirt_id AND pants_outerwear_join.pants_id = shirt_pants_join.pants_id
				) AS shirt_pants_joined_outerwear
			FULL OUTER JOIN
				(SELECT
					DISTINCT outerwear_id
				FROM
					dress_outerwear_join
				) AS dress_joined_outerwear
			ON
				shirt_pants_joined_outerwear.outerwear_id = dress_joined_outerwear.outerwear_id
			) AS joined_outerwear
		ON
			valid_outerwear.id = joined_outerwear.outerwear_id
		`;
		const queryValues = [user.id, weather.aveTemp];
		const { rows } = await query(queryText, queryValues);

		if (rows.length)
			outfit.outerwear.push(camelCaseKeys(selectRandom(rows)));
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
				valid_shirt.*
			FROM
				(SELECT
					*
				FROM
					shirt
				WHERE
					shirt.user_id = $1 AND (shirt.min_temp <= $2 OR shirt.min_temp IS NULL) AND (shirt.max_temp >= $2 OR shirt.max_temp IS NULL)
				) AS valid_shirt
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
						pants_outerwear_join.outerwear_id = ANY($3)
					) AS joined_shirt
				GROUP BY
					joined_shirt.shirt_id
				HAVING
					COUNT(joined_shirt.shirt_id) = $4
				) AS possible_shirt
			ON
				valid_shirt.id = possible_shirt.shirt_id
		`;
		const shirtQueryValues = [user.id, weather.aveTemp, outfit.outerwear.map(e => e.id), outfit.outerwear.length];
		const { rows: shirtRows } = await query(shirtQueryText, shirtQueryValues);
		possibleShirts = shirtRows;

		const dressQueryText = `
			SELECT
				valid_dress.*
			FROM
				(SELECT
					*
				FROM
					dress
				WHERE
					dress.user_id = $1 AND (dress.min_temp <= $2 OR dress.min_temp IS NULL) AND (dress.max_temp >= $2 OR dress.max_temp IS NULL)
				) AS valid_dress
			INNER JOIN
				(SELECT
					joined_dress.dress_id
				FROM 
					(SELECT
						DISTINCT dress_id, outerwear_id
					FROM
						dress_outerwear_join
					WHERE
						outerwear_id = ANY($3)
					) AS joined_dress
				GROUP BY
					joined_dress.dress_id
				HAVING
					COUNT(joined_dress.dress_id) = $4
				) AS possible_dress
			ON
				valid_dress.id = possible_dress.dress_id
		`;
		const dressQueryValues = [user.id, weather.aveTemp, outfit.outerwear.map(e => e.id), outfit.outerwear.length];
		const { rows: dressRows } = await query(dressQueryText, dressQueryValues);
		possibleDresses = dressRows;

	} else {
		const queryText = `
			SELECT
				valid_shirt.*
			FROM
				(SELECT
					*
				FROM
					shirt
				WHERE
					shirt.user_id = $1 AND (shirt.min_temp <= $2 OR shirt.min_temp IS NULL) AND (shirt.max_temp >= $2 OR shirt.max_temp IS NULL)
				) AS valid_shirt
			INNER JOIN
				(SELECT
					DISTINCT shirt_id
				FROM
					shirt_pants_join
				) AS joined_shirt
			ON
				valid_shirt.id = joined_shirt.shirt_id;
		`;
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
			queryText = `
				SELECT
					valid_pants.*
				FROM
					(SELECT
						*
					FROM
						pants
					WHERE
						pants.user_id = $1 AND (pants.min_temp <= $2 OR pants.min_temp IS NULL) AND (pants.max_temp >= $2 OR pants.max_temp IS NULL)
					) AS valid_pants
				INNER JOIN
					(SELECT
						shirt_joined_pants.pants_id
					FROM
						(SELECT
							pants_id
						FROM
							shirt_pants_join
						WHERE
							shirt_id = $3
						) AS shirt_joined_pants
					INNER JOIN
						(SELECT
							pants_id
						FROM
							pants_outerwear_join
						WHERE
							outerwear_id = ANY($4)
						GROUP BY
							pants_id
						HAVING
							COUNT(pants_id) = $5
						) AS outerwear_joined_pants
					ON
						shirt_joined_pants.pants_id = outerwear_joined_pants.pants_id
					) AS possible_pants
				ON
					valid_pants.id = possible_pants.pants_id
			`;
			queryValues = [user.id, weather.aveTemp, outfit.shirt.id, outfit.outerwear.map(e => e.id), outfit.outerwear.length];
		} else {
			queryText = `
				SELECT
					possible_pants.*
				FROM
					(SELECT
						*
					FROM
						pants
					WHERE
						pants.user_id = $1 AND (pants.min_temp <= $2 OR pants.min_temp IS NULL) AND (pants.max_temp >= $2 OR pants.max_temp IS NULL)
					) AS possible_pants
				INNER JOIN
					(SELECT
						pants_id
					FROM
						shirt_pants_join
					WHERE
						shirt_id = $3
					) AS joined_pants
				ON
					possible_pants.id = joined_pants.pants_id
			`;
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


