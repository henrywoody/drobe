const	express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		Shirt = require('../../../models/shirt'),
		Pants = require('../../../models/pants'),
		Outerwear = require('../../../models/outerwear'),
		verifyIds = require('../../../modules/verify-ids'),
		handleErrors = require('../../../modules/handle-db-errors'),
		multer = require('multer'),
		b64encodeImage = require('../../../modules/b64encodeImage');

const	storage = multer.memoryStorage(),
		upload = multer({ storage: storage });

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const shirts = await Shirt.find({owner: user._id});
		const imageFormmatedShirts = shirts.map(shirt => {
			shirt = shirt.toObject();
			// encode image if there is one
			const { data, contentType } = shirt.image;
			if (data && contentType) {
				shirt.image = b64encodeImage(data, contentType);
			} else {
				shirt.image = null;
			}
			return shirt;
		});
		res.json(imageFormmatedShirts);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const shirt = await Shirt.findById(id);
		if (!shirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!shirt.owner.equals(user._id))
			return res.sendStatus(403);

		const shirtObject = shirt.toObject();
		// encode image if there is one
		const { data, contentType } = shirt.image;
		if (data && contentType) {
			shirtObject.image = b64encodeImage(data, contentType);
		} else {
			shirtObject.image = null;
		}
		res.json(shirtObject);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		let shirtData;
		await new Promise((resolve, reject) => { 
			upload.single('image')(req, res, (err) => {
				if (err) {
					res.json({error: 'There was an error with the image upload'});
					reject();
				}

				shirtData = JSON.parse(req.body.shirt)
				shirtData.owner = user._id;
				// image
				shirtData.image = {}
				if (req.file) {
					shirtData.image.data = req.file.buffer;
					shirtData.image.contentType = req.file.mimetype;
				}
				resolve();
			})
		});

		// Verify attached Ids
		const checked = await Promise.all([
			verifyIds('pants', shirtData.pants, user._id),
			verifyIds('outerwear', shirtData.outerwears, user._id)
		]);
		for (const check of checked) {
			if (check !== true) {
				throw check;
			}
		}

		// create the shirt
		const newShirt = await Shirt.create(shirtData);

		// add reference to the other articles
			// revisit this... the `await`s are needed because otherwise the other models do not update
		if (shirtData.pants) {
			for (const modelId of shirtData.pants) {
				await Pants.findByIdAndUpdate(modelId, { $push: {shirts: newShirt._id} });
			}
		}
		if (shirtData.outerwears) {
			for (const modelId of shirtData.outerwears) {
				await Outerwear.findByIdAndUpdate(modelId, { $push: {shirts: newShirt._id} });
			}
		}

		res.json(newShirt);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		let shirtData;
		await new Promise((resolve, reject) => { 
			upload.single('image')(req, res, (err) => {
				if (err) {
					res.json({error: 'There was an error with the image upload'});
					reject();
				}

				shirtData = JSON.parse(req.body.shirt)
				shirtData.owner = user._id;
				shirtData.pants = shirtData.pants || [];
				shirtData.outerwears = shirtData.outerwears || [];
				// image
				shirtData.image = {}
				if (req.file) {
					shirtData.image.data = req.file.buffer;
					shirtData.image.contentType = req.file.mimetype;
				}
				resolve();
			})
		});

		const shirt = await Shirt.findById(id);
		if (!Object.keys(shirtData.image).length) {
			// if no new image supplied, don't update the image
			shirtData.image = shirt.image;
		}
		
		if (!shirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!shirt.owner.equals(user._id))
			return res.sendStatus(403);
		
		// Verify attached Ids
		const checked = await Promise.all([
			verifyIds('pants', shirtData.pants, user._id),
			verifyIds('outerwear', shirtData.outerwears, user._id)
		]);
		for (const check of checked) {
			if (check !== true) {
				throw check;
			}
		}

		// update the shirt
		const updatedShirt = await Shirt.findByIdAndUpdate(id, shirtData, {new: true});

		// add/remove new/removed associations from associated articles
		for (const modelId of shirtData.pants) {
			if (!shirt.pants.some(id => id.equals(mongoose.Types.ObjectId(modelId)))) {
				// newly added references
				await Pants.findByIdAndUpdate(modelId, { $push: {shirts: shirt._id} });
			}
		}
		for (const modelId of shirt.pants) {
			if (!shirtData.pants.some(id => mongoose.Types.ObjectId(id).equals(modelId))) {
				// newly removed references
				await Pants.findByIdAndUpdate(modelId, { $pull: {shirts: shirt._id} });
			}
		}

		for (const modelId of shirtData.outerwears) {
			if (!shirt.outerwears.some(id => id.equals(mongoose.Types.ObjectId(modelId)))) {
				// newly added references
				await Outerwear.findByIdAndUpdate(modelId, { $push: {shirts: shirt._id} });
			}
		}
		for (const modelId of shirt.outerwears) {
			if (!shirtData.outerwears.some(id => mongoose.Types.ObjectId(id).equals(modelId))) {
				// newly removed references
				await Outerwear.findByIdAndUpdate(modelId, { $pull: {shirts: shirt._id} });
			}
		}

		res.json(updatedShirt);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const shirt = await Shirt.findById(id);

		if (!shirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!shirt.owner.equals(user._id))
			return res.sendStatus(403);

		// remove the shirt
		await Shirt.findByIdAndRemove(id);

		// remove references to the shirt
		for (const modelId of shirt.pants) {
			await Pants.findByIdAndUpdate(modelId, { $pull: {shirts: id} });
		}
		for (const modelId of shirt.outerwears) {
			await Outerwear.findByIdAndUpdate(modelId, { $pull: {shirts: id} });
		}

		res.json({message: 'Successfully deleted.'})
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;