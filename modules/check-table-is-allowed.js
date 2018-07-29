module.exports = (table) => {
	allowedTables = ['article', 'shirt', 'pants', 'dress', 'outerwear'];
	if (allowedTables.includes(table))
		return true;
	
	const err = new Error('Table not allowed for this method')
	err.name = 'ForbiddenError';
	throw err;
}