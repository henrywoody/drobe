module.exports = (table) => {
	allowedTables = ['article', 'shirt', 'pants', 'dress', 'outerwear'];
	if (allowedTables.includes(table))
		return true;
	return false;
}