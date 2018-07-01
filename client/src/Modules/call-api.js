import queryString from 'query-string';

export default async function callAPI(url, query, token, method, body, { includesImage=false, responseImage=false }={}) {
	let fullUrl = `/api/v1/${url}`;

	if (query)
		fullUrl += `?${queryString.stringify(query)}`;

	const additionalInfo = {
		method: method,
		headers: {
			'Authorization': `JWT ${token}`
		}
	};

	if (body) {
		if (includesImage) {
			additionalInfo.body = body;	
		} else {
			additionalInfo.headers['Content-Type'] = 'application/json';
			additionalInfo.body = JSON.stringify(body);
		}
	}

	const result = await fetch(fullUrl, additionalInfo);

	if (responseImage)
		return result;
	return result.json();
}