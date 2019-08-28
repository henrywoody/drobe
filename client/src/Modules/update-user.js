export default async function updateUser(id, token, body) {
	let fullUrl = `/users/${id}`;

	const additionalInfo = {
		method: 'PUT',
		headers: {
			'Authorization': `JWT ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	const response = await fetch(fullUrl, additionalInfo);
	const data = await response.json();

	if (response.ok) {
		return { ok: true, data, error: "" };
	} else {
		return { ok: false, data: {}, error: data.error };
	}
}