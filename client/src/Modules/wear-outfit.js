import callAPI from './call-api';

export default (outfit, token) => {
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
}