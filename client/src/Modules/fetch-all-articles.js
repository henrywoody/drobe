import callAPI from './call-api';

export default async function fetchAllArticles(token) {
	const splitArticles = await Promise.all([
		callAPI('shirts', null, token),
		callAPI('pants', null, token),
		callAPI('dresses', null, token),
		callAPI('outerwears', null, token)
	]);

	return splitArticles.reduce((a,x) => a.concat(x), []);
}