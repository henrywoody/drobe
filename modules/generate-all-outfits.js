const	Shirt = require('../models/shirt'),
		Pants = require('../models/pants'),
		Outerwear = require('../models/outerwear');

module.exports = async (ownerId, {shirtIds=null, pantsIds=null, outerwearIds=null}={}) => {
	/*
		Generates all possible outfits from a user's wardrobe
	*/

	const outfits = [];

	const shirtQuery = shirtIds ? { owner: ownerId, _id: { $in: shirtIds } } : { owner: ownerId };
	const pantsQuery = pantsIds ? { owner: ownerId, _id: { $in: pantsIds } } : { owner: ownerId };
	const outerwearQuery = outerwearIds ? { owner: ownerId, _id: { $in: outerwearIds } } : { owner: ownerId };

	const [
			shirts,
			pants,
			outerwears
		] = await Promise.all([
			Shirt.find(shirtQuery),
			Pants.find(pantsQuery),
			Outerwear.find(outerwearQuery)
		]);

	for (const shirt of shirts) {
		for (const pantsPair of pants.filter(p => shirt.pants.some(id => id.equals(p._id)))) {
			for (const outerwear of outerwears.filter(o => shirt.outerwears.some(id => id.equals(o._id)) && pantsPair.outerwears.some(id => id.equals(o._id)))) {
				outfits.push({
					shirt: shirt._id,
					pants: pantsPair._id,
					outerwear: outerwear._id
				})
			}
		}
	}

	return outfits;
}