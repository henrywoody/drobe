export default async function uploadImage(image, token) {
	const endpoint = '/api/v2/images/upload';

	const formData = new FormData();
 	formData.append('image', image.data);

	const result = await fetch(endpoint, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
		body: formData
	});

	return result.json();
}