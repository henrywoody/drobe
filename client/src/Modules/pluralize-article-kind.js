export default function pluralizeArticleKind(articleKind) {
	switch (articleKind) {
		case 'shirt':
		case 'shirts':
			return 'shirts';
		case 'pants':
			return 'pants';
		case 'dress':
		case 'dresses':
			return 'dresses';
		case 'outerwear':
		case 'outerwears':
			return 'outerwears';
		default:
			return articleKind;
	}
}