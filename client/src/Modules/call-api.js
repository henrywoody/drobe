import queryString from 'query-string';

export default async function callAPI(url, query, token, method, body) {
	let fullUrl = `/api/v2/${url}`;

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