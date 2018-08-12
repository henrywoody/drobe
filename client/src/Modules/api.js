import queryString from 'query-string';

async function callAPI(endpoint, query, token, method, body) {
	let fullUrl = `/api/v2/${endpoint}`;

	if (query)
		fullUrl += `?${queryString.stringify(query)}`;

	const additionalInfo = {
		method: method,
		headers: {
			'Authorization': `JWT ${token}`
		}
	};

	if (body) {
		additionalInfo.headers['Content-Type'] = 'application/json';
		additionalInfo.body = JSON.stringify(body);
	}

	const result = await fetch(fullUrl, additionalInfo);

	return result.json();
}


export default {
	getAllArticles: async (token) => {
		const splitArticles = await Promise.all([
			callAPI('shirts', null, token),
			callAPI('pants', null, token),
			callAPI('dresses', null, token),
			callAPI('outerwears', null, token)
		]);
		return splitArticles.reduce((a,e) => a.concat(e), []);
	},
	getArticle: (pluralArticleKind, articleId, token) => {
		return callAPI(`${pluralArticleKind}/${articleId}`, null, token);
	},
	postArticle: (pluralArticleKind, payload, token) => {
		return callAPI(`${pluralArticleKind}`, null, token, "POST", payload);
	},
	putArticle: (pluralArticleKind, articleId, payload, token) => {
		return callAPI(`${pluralArticleKind}/${articleId}`, null, token, "PUT", payload);
	},
	deleteArticle: (pluralArticleKind, articleId, token) => {
		return callAPI(`${pluralArticleKind}/${articleId}`, null, token, "DELETE");
	},
	getOutfit: (token) => {
		return callAPI('outfits/today', null, token);
	},
	wearOutfit: (outfit, token) => {
		const query = {}
		if (outfit.shirt)
			query.shirt = outfit.shirt.id;
		if (outfit.pants)
			query.pants = outfit.pants.id;
		if (outfit.dress)
			query.dress = outfit.dress.id;
		if (outfit.outerwear.length)
			query.outerwear = outfit.outerwear.map(e => e.id);

		return callAPI('outfits/wear', query, token, 'PUT');
	},
	getLocationData: (locationName) => {
		return callAPI('data/coordinates', {address: locationName});
	},
	getWeather: (coordinates, token) => {
		return callAPI('data/weather', coordinates, token);
	}
}