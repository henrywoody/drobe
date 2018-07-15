function stringifyColumns(data) {
	return Object.keys(data).join(', ');
}

function stringifyValuesSQLVars(queryValues) {
	return queryValues.map((e, i) => `$${i + 1}`).join(', ');
}

module.exports = (data) => {
	const queryValues = Object.values(data);
	
	return {
		columns: stringifyColumns(data),
		queryValueSQLVars: stringifyValuesSQLVars(queryValues),
		queryValues: queryValues
	};
}