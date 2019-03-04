export default async function uploadImage(image, token, uploadId) {
	const endpoint = '/api/v2/images/upload';

	const formData = new FormData();
 	formData.append('image', image);

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
		body: formData
	});

	let responseData;
	try {
		responseData = await response.json()
	} catch (e) {
		responseData = {};
	}

	return {
		responseData,
		responseStatus: response.status,
		uploadId,
	}
}