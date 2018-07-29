// For use in the join and unjoin modules

function forPair(...tablePair) {
	const validJoins = [
		['pants', 'shirt', 'shirt_pants_join'], ['outerwear', 'shirt', 'shirt_outerwear_join'],
		['outerwear', 'pants', 'pants_outerwear_join'], ['outerwear', 'outerwear', 'outerwear_outerwear_join'],
		['dress', 'outerwear', 'dress_outerwear_join']
	];

	for (const validJoin of validJoins) {
		if (validJoin[0] === tablePair[0] && validJoin[1] === tablePair[1] || validJoin[0] === tablePair[1] && validJoin[1] === tablePair[0])
			return validJoin[2];
	}
	throwValidationError();
}

function forTable(table) {
	switch (table) {
		case 'shirt':
			return ['shirt_pants_join', 'shirt_outerwear_join'];
		case 'pants': 
			return ['shirt_pants_join', 'pants_outerwear_join'];
		case 'dress':
			return ['dress_outerwear_join'];
		case 'outerwear':
			return ['shirt_outerwear_join', 'pants_outerwear_join', 'dress_outerwear_join', 'outerwear_outerwear_join'];
		default:
			throwValidationError();
	}
}

function throwValidationError() {
	const err = new Error('Table pair is not valid for join');
	err.name = 'ValidationError';
	throw err;
}


module.exports = {
	forPair: forPair,
	forTable: forTable
}