const	express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		Shirt = require('../../../models/shirt'),
		Pants = require('../../../models/pants'),
		Outerwear = require('../../../models/outerwear'),
		verifyIds = require('../../../modules/verify-ids'),
		handleErrors = require('../../../modules/handle-db-errors')
		multer = require('multer'),
		b64encodeImage = require('../../../modules/b64encodeImage');

const	storage = multer.memoryStorage(),
		upload = multer({ storage: storage });

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const outerwears = await Outerwear.find({owner: user._id});
		const imageFormattedouterwears = outerwears.map(outerwear => {
			outerwear = outerwear.toObject();
			// encode image if there is one
			const { data, contentType } = outerwear.image || {};
			if (data && contentType) {
				outerwear.image = b64encodeImage(data, contentType);
			} else {
				outerwear.image = null;
			}
			return outerwear;
		});
		res.json(imageFormattedouterwears);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const outerwear = await Outerwear.findById(id);
		if (!outerwear) {
			const err = new Error('Outerwear Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!outerwear.owner.equals(user._id))
			return res.sendStatus(403);

		const outerwearObject = outerwear.toObject();
		// encode image if there is one
		const { data, contentType } = outerwear.image;
		if (data && contentType) {
			outerwearObject.image = b64encodeImage(data, contentType);
		} else {
			outerwearObject.image = null;
		}
		res.json(outerwearObject);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		let outerwearData;
		await new Promise((resolve, reject) => { 
			upload.single('image')(req, res, (err) => {
				if (err) {
					res.json({error: 'There was an error with the image upload'});
					reject();
				}

				outerwearData = JSON.parse(req.body.outerwear)
				outerwearData.owner = user._id;
				// image
				outerwearData.image = {}
				if (req.file) {
					outerwearData.image.data = req.file.buffer;
					outerwearData.image.contentType = req.file.mimetype;
				}
				resolve();
			})
		});

		// Verify attached Ids
		const checked = await Promise.all([
			verifyIds('shirt', outerwearData.shirts, user._id),
			verifyIds('pants', outerwearData.pants, user._id),
			verifyIds('outerwear', outerwearData.outerwears, user._id)
		]);
		for (const check of checked) {
			if (check !== true) {
				throw check;
			}
		}

		// create the outerwear
		const newOuterwear = await Outerwear.create(outerwearData);

		// add reference to the other articles
		if (outerwearData.shirts) {
			for (const modelId of outerwearData.shirts) {
				await Shirt.findByIdAndUpdate(modelId, { $push: {outerwears: newOuterwear._id} });
			}
		}
		if (outerwearData.pants) {
			for (const modelId of outerwearData.pants) {
				await Pants.findByIdAndUpdate(modelId, { $push: {outerwears: newOuterwear._id} });
			}
		}
		if (outerwearData.outerwears) {
			for (const modelId of outerwearData.outerwears) {
				await Outerwear.findByIdAndUpdate(modelId, { $push: {outerwears: newOuterwear._id} });
			}
		}

		res.json(newOuterwear);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		let outerwearData;
		await new Promise((resolve, reject) => { 
			upload.single('image')(req, res, (err) => {
				if (err) {
					res.json({error: 'There was an error with the image upload'});
					reject();
				}

				outerwearData = JSON.parse(req.body.outerwear)
				outerwearData.owner = user._id;
				outerwearData.shirts = outerwearData.shirts || [];
				outerwearData.pants = outerwearData.pants || [];
				outerwearData.outerwears = outerwearData.outerwears || [];
				// image
				outerwearData.image = {}
				if (req.file) {
					outerwearData.image.data = req.file.buffer;
					outerwearData.image.contentType = req.file.mimetype;
				}
				resolve();
			})
		});

		const outerwear = await Outerwear.findById(id);
		if (!Object.keys(outerwearData.image).length) {
			// if no new image supplied, don't update the image
			outerwearData.image = outerwear.image;
		}

		if (!outerwear) {
			const err = new Error('Outerwear Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!outerwear.owner.equals(user._id))
			return res.sendStatus(403);

		// Verify attached Ids
		const checked = await Promise.all([
			verifyIds('shirt', outerwearData.shirts, user._id),
			verifyIds('pants', outerwearData.pants, user._id),
			verifyIds('outerwear', outerwearData.outerwears, user._id)
		]);
		for (const check of checked) {
			if (check !== true) {
				throw check;
			}
		}

		// update the outerwear
		const updatedOuterwear = await Outerwear.findByIdAndUpdate(id, outerwearData, {new: true});

		// add/remove new/removed associations from associated articles
		for (const modelId of outerwearData.shirts) {
			if (!outerwear.shirts.some(id => id.equals(mongoose.Types.ObjectId(modelId)))) {
				// newly added references
				await Shirt.findByIdAndUpdate(modelId, { $push: {outerwears: outerwear._id} });
			}
		}
		for (const modelId of outerwear.shirts) {
			if (!outerwearData.shirts.some(id => mongoose.Types.ObjectId(id).equals(modelId))) {
				// newly removed references
				await Shirt.findByIdAndUpdate(modelId, { $pull: {outerwears: outerwear._id} });
			}
		}

		for (const modelId of outerwearData.pants) {
			if (!outerwear.pants.some(id => id.equals(mongoose.Types.ObjectId(modelId)))) {
				// newly added references
				await Pants.findByIdAndUpdate(modelId, { $push: {outerwears: outerwear._id} });
			}
		}
		for (const modelId of outerwear.pants) {
			if (!outerwearData.pants.some(id => mongoose.Types.ObjectId(id).equals(modelId))) {
				// newly removed references
				await Pants.findByIdAndUpdate(modelId, { $pull: {outerwears: outerwear._id} });
			}
		}

		for (const modelId of outerwearData.outerwears) {
			if (!outerwear.outerwears.some(id => id.equals(mongoose.Types.ObjectId(modelId)))) {
				// newly added references
				await Outerwear.findByIdAndUpdate(modelId, { $push: {outerwears: outerwear._id} });
			}
		}
		for (const modelId of outerwear.outerwears) {
			if (!outerwearData.outerwears.some(id => mongoose.Types.ObjectId(id).equals(modelId))) {
				// newly removed references
				await Outerwear.findByIdAndUpdate(modelId, { $pull: {outerwears: outerwear._id} });
			}
		}

		res.json(updatedOuterwear);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const outerwear = await Outerwear.findById(id);

		if (!outerwear) {
			const err = new Error('Outerwear Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!outerwear.owner.equals(user._id))
			return res.sendStatus(403);

		// delete the outerwear
		await Outerwear.findByIdAndRemove(id);

		// remove references to the outerwear
		for (const modelId of outerwear.shirts) {
			await Shirt.findByIdAndUpdate(modelId, { $pull: {outerwears: id} });
		}
		for (const modelId of outerwear.pants) {
			await Pants.findByIdAndUpdate(modelId, { $pull: {outerwears: id} });
		}
		for (const modelId of outerwear.outerwears) {
			await Outerwear.findByIdAndUpdate(modelId, { $pull: {outerwears: id} });
		}

		res.json({message: 'Successfully deleted.'});
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;