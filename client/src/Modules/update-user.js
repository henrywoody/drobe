export default async function callAPI(id, token, body) {
	let fullUrl = `/users/${id}`;

	const additionalInfo = {
		method: 'PUT',
		headers: {
			'Authorization': `JWT ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	const result = await fetch(fullUrl, additionalInfo);

	return result.json();
}