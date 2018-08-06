const	express = require('express'),
		router = express.Router(),
		handleErrors = require('../../../modules/handle-db-errors'),
		uploadImage = require('../../../modules/upload-image');

router.post('/upload', async (req, res) => {
	try {
		const imageUrl = await new Promise((resolve, reject) => {
			uploadImage.single('image')(req, res, (err) => {
				if (err) {
					const err = new Error('There was a problem with the image upload');
					err.name = 'ImageUploadError';
					return reject(err);
				}

				return resolve(req.file.location);
			});
		});

		res.json({imageUrl: imageUrl});
	} catch (err) {
		handleErrors(err, res);
	}
});

module.exports = router;