module.exports = (err, res) => {
	// Not Found: no item with id or id is not valid
	if (err.name === 'CastError' || err.name === 'NotFound')
		return res.status(404).json({error: 'NotFoundError'});

	// Invalid Id for attached id to article (wrong model or article with id does not exist)
	if (err.name === 'InvalidIdForModel')
		return res.status(400).json({error: err.name, message: err.message});
	// Invalid Id for attached id to article (user does not own article)
	if (err.name === 'InvalidIdForOwner')
		return res.status(403).json({error: err.name, message: err.message});

	// Duplicate Error
	if (err.code === 11000)
		return res.status(400).json({error: 'DuplicateError'});

	if (err.name === 'ValidationError')
		return res.status(400).json({error: 'ValidationError'});


	// User Stuff
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