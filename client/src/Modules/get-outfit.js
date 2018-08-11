import callAPI from './call-api';

export default (token) => {
	return callAPI('outfits/today', null, token);
}