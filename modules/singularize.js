module.exports = (plural) => {
	switch (plural) {
		case 'shirts':
			return 'shirt';
		case 'shirt':
			return 'shirt';
		case 'pants':
			return 'pants';
		case 'dresses':
			return 'dress';
		case 'dress':
			return 'dress';
		case 'outerwears':
			return 'outerwear';
		case 'outerwear':
			return 'outerwear';
	}
}