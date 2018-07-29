module.exports = (nestedCleanData) => {
	const cleanData = {};
	const nestedData = {};

	for (const key in nestedCleanData) {
		if (['shirts', 'pants', 'dresses', 'outerwears'].includes(key)) {
			nestedData[key] = nestedCleanData[key];
		} else {
			cleanData[key] = nestedCleanData[key];
		}
	}
	return {cleanData: cleanData, nestedData: nestedData};
}