module.exports = (err, res) => {
	// Not Found: no item with id or id is not valid
	if (err.name === 'CastError' || err.name === 'NotFound' || err.name === 'NotFoundError')
		return res.status(404).json({error: 'NotFoundError'});

	if (err.name === 'UserNotFound')
		return res.status(400).json({error: err.name, message: err.message});
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
		return res.status(400).json({error: err.name, message: err.message});

	if (err.name === 'ForbiddenError')
		return res.status(403).json({error: err.name, message: err.message});


	// User Stuff
	if (err.name === 'MissingUsernameError')
		return res.status(400).json({error: 'MissingUsernameError'});

	if (err.name === 'MissingPasswordError')
		return res.status(400).json({error: 'MissingPasswordError'});

	if (err.name === 'UserExistsError')
		return res.status(400).json({error: 'UserExistsError'});

	if (err.name === 'IncorrectUsernameError' || err.name == 'IncorrectEmailError' || err.name === 'IncorrectPasswordError')
		return res.status(400).json({error: 'InvalidCredentialsError'});

	if (err.name === 'MissingCredentialsError')
		return res.status(400).json({error: 'MissingCredentialsError'});

	if (err.name === 'FormatError')
		return res.status(400).json({error: 'FormatError'});

	// External API Stuff
	if (err.name === 'StatusCodeError')
		return res.status(err.statusCode).json({error: err.error});


	console.log(err);
	return res.stat(500).json({error: 'There was a problem with the server.'});

}