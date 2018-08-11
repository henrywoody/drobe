import callAPI from './call-api';

export function getShirts(token) {
	return callAPI('shirts', null, token);
}

export function getShirtById(id, token) {
	return callAPI(`shirts/${id}`, null, token);
}

export function getPants(token) {
	return callAPI('pants', null, token);
}

export function getPantsById(id, token) {
	return callAPI(`pants/${id}`, null, token);
}

export function getDresses(token) {
	return callAPI('dresses', null, token);
}

export function getDressById(id, token) {
	return callAPI(`dresses/${id}`, null, token);
}

export function getOuterwears(token) {
	return callAPI('outerwears', null, token);
}

export function getOuterwearById(id, token) {
	return callAPI(`outerwears/${id}`, null, token);
}

export async function getAllArticles(token) {
	return await Promise.all([
		getShirts(token),
		getPants(token),
		getDresses(token),
		getOuterwears(token)
	]).reduce((acc, e) => acc.concat(e));
}