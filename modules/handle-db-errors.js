module.exports = (err, res) => {
	if (err.name === 'CastError' || err.name === 'NotFound')
		return res.status(404).json({error: 'Not Found'});

	if (err.code === 11000)
		return res.status(400).json({error: 'Duplicate'});

	console.log(err);
	return res.stat(500).json({error: 'There was a problem with the server.'});

}