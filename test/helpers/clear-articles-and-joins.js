const	query = require('../../modules/query');

module.exports = async () => {
	await Promise.all([
		query("DELETE FROM dress_outerwear_join *"),
		query("DELETE FROM outerwear_outerwear_join *"),
		query("DELETE FROM pants_outerwear_join *"),
		query("DELETE FROM shirt_outerwear_join *"),
		query("DELETE FROM shirt_pants_join *")
	]);
	await Promise.all([
		query("DELETE FROM shirt *"),
		query("DELETE FROM pants *"),
		query("DELETE FROM outerwear *"),
		query("DELETE FROM dress *")
	]);
}