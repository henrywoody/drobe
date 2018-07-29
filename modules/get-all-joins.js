const	query = require('./query');

async function forTableById(table, id) {
	if (table === 'shirt') {
		const pantsQueryText = "SELECT pants_id FROM shirt_pants_join WHERE shirt_id = $1";
		const pantsQueryValues = [id];
		const { rows: pants } = await query(pantsQueryText, pantsQueryValues);

		const outerwearsQueryText = "SELECT outerwear_id FROM shirt_outerwear_join WHERE shirt_id = $1";
		const outerwearsQueryValues = [id];
		const { rows: outerwears } = await query(outerwearsQueryText, outerwearsQueryValues);

		return {
			pants: pants.map(e => e.pants_id),
			outerwears: outerwears.map(e => e.outerwear_id)
		};
	} else if (table === 'pants') {
		const shirtsQueryText = "SELECT shirt_id FROM shirt_pants_join WHERE pants_id = $1";
		const shirtsQueryValues = [id];
		const { rows: shirts } = await query(shirtsQueryText, shirtsQueryValues);

		const outerwearsQueryText = "SELECT outerwear_id FROM pants_outerwear_join WHERE pants_id = $1";
		const outerwearsQueryValues = [id];
		const { rows: outerwears } = await query(outerwearsQueryText, outerwearsQueryValues);

		return {
			shirts: shirts.map(e => e.shirt_id),
			outerwears: outerwears.map(e => e.outerwear_id)
		};
	} else if (table === 'dress') {
		const outerwearsQueryText = "SELECT outerwear_id FROM dress_outerwear_join WHERE dress_id = $1";
		const outerwearsQueryValues = [id];
		const { rows: outerwears } = await query(outerwearsQueryText, outerwearsQueryValues);

		return {
			outerwears: outerwears.map(e => e.outerwear_id)
		};
	} else if (table === 'outerwear') {
		const shirtsQueryText = "SELECT shirt_id FROM shirt_outerwear_join WHERE outerwear_id = $1";
		const shirtsQueryValues = [id];
		const { rows: shirts } = await query(shirtsQueryText, shirtsQueryValues);

		const pantsQueryText = "SELECT pants_id FROM pants_outerwear_join WHERE outerwear_id = $1";
		const pantsQueryValues = [id];
		const { rows: pants } = await query(pantsQueryText, pantsQueryValues);

		const dressQueryText = "SELECT dress_id FROM dress_outerwear_join WHERE outerwear_id = $1";
		const dressQueryValues = [id];
		const { rows: dresses } = await query(dressQueryText, dressQueryValues);

		const aOutwearsQueryText = "SELECT a_outerwear_id FROM outerwear_outerwear_join WHERE b_outerwear_id = $1";
		const aOutwearsQueryValues = [id];
		const { rows: aOuterwears } = await query(aOutwearsQueryText, aOutwearsQueryValues);
		const bOutwearsQueryText = "SELECT b_outerwear_id FROM outerwear_outerwear_join WHERE a_outerwear_id = $1";
		const bOutwearsQueryValues = [id];
		const { rows: bOuterwears } = await query(bOutwearsQueryText, bOutwearsQueryValues);

		return {
			shirts: shirts.map(e => e.shirt_id),
			pants: pants.map(e => e.pants_id),
			dresses: dresses.map(e => e.dress_id),
			outerwears: aOuterwears.map(e => e.a_outerwear_id).concat(bOuterwears.map(e => e.b_outerwear_id))
		};
	} else {
		const err = new Error(`Table ${table} is not a valid article table`);
		err.name = 'ValidationError';
		throw err;
	}
}

module.exports = {
	forTableById: forTableById
}