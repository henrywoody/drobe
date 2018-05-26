module.exports = (err, res) => {
	// Not Found: no item with id or id is not valid
	if (err.name === 'CastError' || err.name === 'NotFound')
		return res.status(404).json({error: 'NotFoundError'});

	// Duplicate Error
	if (err.code === 11000)
		return res.status(400).json({error: 'DuplicateError'});

	if (err.name === 'MissingUsernameError')
		return res.status(400).json({error: 'MissingUsernameError'});

	if (err.name === 'MissingPasswordError')
		return res.status(400).json({error: 'MissingPasswordError'});

	if (err.name === 'UserExistsError')
		return res.status(400).json({error: 'UserExistsError'});

	if (err.name === 'IncorrectUsernameError' || err.name === 'IncorrectPasswordError')
		return res.status(400).json({error: 'InvalidCredentialsError'});

	if (err.name === 'MissingCredentialsError') {
		return res.status(400).json({error: 'MissingCredentialsError'})
	}

	console.log(err);
	return res.stat(500).json({error: 'There was a problem with the server.'});

}