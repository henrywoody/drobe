export default function singularizeArticleKind(articleKind) {
	switch (articleKind) {
		case 'shirt':
		case 'shirts':
			return 'shirt';
		case 'pants': 
			return 'pants';
		case 'dress':
		case 'dresses':
			return 'dress';
		case 'outerwear':
		case 'outerwears':
			return 'outerwear';
	}
}