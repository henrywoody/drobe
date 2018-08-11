const	query = require('./query'),
		checkTableIsAllowed = require('./check-table-is-allowed'),
		select = require('./select');

module.exports = async (articles) => {
	for (const articleTable in articles)
		checkTableIsAllowed(articleTable);

	for (const articleTable in articles) {
		const articleIds = Array.isArray(articles[articleTable]) ? articles[articleTable] : [articles[articleTable]];
		for (const articleId of articleIds) {
			if (!articleId) continue;

			const queryText = `UPDATE ${articleTable}
								SET last_worn = CURRENT_DATE
								WHERE id = $1
								RETURNING id`;
			const queryValues = [articleId];

			const { rows } = await query(queryText, queryValues);

			if (!rows.length) {
				const err = new Error('Article not found');
				err.name = 'NotFoundError';
				throw err;
			}
		}
	}
}