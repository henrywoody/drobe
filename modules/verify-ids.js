module.exports = async (model, ids, ownerId) => {
	const Model = require(`../models/${model}`);
	try {
		if (!ids || !ids.length)
			return true;

		const checked = await Promise.all(ids.map(async id => {
			const result = await Model.findById(id);
			if (!result) {
				return [id, 'InvalidIdForModel'];
			} else if (!result.owner.equals(ownerId)) {
				return [id, 'InvalidIdForOwner'];
			}
			return [id, true];
		}));
		for (const check of checked) {
			if (check[1] !== true){
				const err = new Error(`Invalid id: ${check[0]}`);
				err.name = check[1];
				return err;
			}
		}
		return true;
	} catch (err) {
		return err;
	}
}