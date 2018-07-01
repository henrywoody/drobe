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
		const pants = await Pants.find({owner: user._id});
		pants.forEach(pair => pair.image = null); // dont send image data here
		res.json(pants);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Detail
router.get('/:id/image', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const pair = await Pants.findById(id);
		if (!pair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!pair.owner.equals(user._id))
			return res.sendStatus(403);

		const { data, contentType } = pair.image;
		const encoded = b64encodeImage(data, contentType);
		res.json({image: encoded});
	} catch (err) {
		handleErrors(err, res);
	}
})

router.get('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const pair = await Pants.findById(id);
		if (!pair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!pair.owner.equals(user._id))
			return res.sendStatus(403);

		pair.image = null; // dont send image data here
		res.json(pair);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		let pairData;
		await new Promise((resolve, reject) => { 
			upload.single('image')(req, res, (err) => {
				if (err) {
					console.log(err)
					res.json({error: 'There was an error with the image upload'});
					reject();
				}

				pairData = JSON.parse(req.body.pants)
				pairData.owner = user._id;
				// image
				pairData.image = {}
				if (req.file) {
					pairData.image.data = req.file.buffer;
					pairData.image.contentType = req.file.mimetype;
				}
				resolve();
			})
		});

		// Verify attached Ids
		const checked = await Promise.all([
			verifyIds('shirt', pairData.shirts, user._id),
			verifyIds('outerwear', pairData.outerwears, user._id)
		]);
		for (const check of checked) {
			if (check !== true) {
				throw check;
			}
		}

		// create the pair
		const newPair = await Pants.create(pairData);

		// add reference to the other articles
		if (pairData.shirts) {
			for (const modelId of pairData.shirts) {
				await Shirt.findByIdAndUpdate(modelId, { $push: {pants: newPair._id} });
			}
		}
		if (pairData.outerwears) {
			for (const modelId of pairData.outerwears) {
				await Outerwear.findByIdAndUpdate(modelId, { $push: {pants: newPair._id} });
			}
		}

		res.json(newPair);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		let pairData;
		await new Promise((resolve, reject) => { 
			upload.single('image')(req, res, (err) => {
				if (err) {
					res.json({error: 'There was an error with the image upload'});
					reject();
				}

				pairData = JSON.parse(req.body.pants)
				pairData.owner = user._id;
				pairData.shirts = pairData.shirts || [];
				pairData.outerwears = pairData.outerwears || [];
				// image
				pairData.image = {}
				if (req.file) {
					pairData.image.data = req.file.buffer;
					pairData.image.contentType = req.file.mimetype;
				}
				resolve();
			})
		});

		const pair = await Pants.findById(id);
		if (!Object.keys(pairData.image).length) {
			// if no new image supplied, don't update the image
			pairData.image = pair.image;
		}

		if (!pair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!pair.owner.equals(user._id))
			return res.sendStatus(403);

		// Verify attached Ids
		const checked = await Promise.all([
			verifyIds('shirt', pairData.shirts, user._id),
			verifyIds('outerwear', pairData.outerwears, user._id)
		]);
		for (const check of checked) {
			if (check !== true) {
				throw check;
			}
		}

		// update the pair
		const updatedPair = await Pants.findByIdAndUpdate(id, pairData, {new: true});

		// add/remove new/removed associations from associated articles
		for (const modelId of pairData.shirts) {
			if (!pair.shirts.some(id => id.equals(mongoose.Types.ObjectId(modelId)))) {
				// newly added references
				await Shirt.findByIdAndUpdate(modelId, { $push: {pants: pair._id} });
			}
		}
		for (const modelId of pair.shirts) {
			if (!pairData.shirts.some(id => mongoose.Types.ObjectId(id).equals(modelId))) {
				// newly removed references
				await Shirt.findByIdAndUpdate(modelId, { $pull: {pants: pair._id} });
			}
		}

		for (const modelId of pairData.outerwears) {
			if (!pair.outerwears.some(id => id.equals(mongoose.Types.ObjectId(modelId)))) {
				// newly added references
				await Outerwear.findByIdAndUpdate(modelId, { $push: {pants: pair._id} });
			}
		}
		for (const modelId of pair.outerwears) {
			if (!pairData.outerwears.some(id => mongoose.Types.ObjectId(id).equals(modelId))) {
				// newly removed references
				await Outerwear.findByIdAndUpdate(modelId, { $pull: {pants: pair._id} });
			}
		}

		res.json(updatedPair);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { user } = req;
	const { id } = req.params;
	try {
		const pair = await Pants.findById(id);

		if (!pair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!pair.owner.equals(user._id))
			return res.sendStatus(403);

		// delete the pair
		await Pants.findByIdAndRemove(id);

		// remove references to the pair
		for (const modelId of pair.shirts) {
			await Shirt.findByIdAndUpdate(modelId, { $pull: {pants: id} });
		}
		for (const modelId of pair.outerwears) {
			await Outerwear.findByIdAndUpdate(modelId, { $pull: {pants: id} });
		}

		res.json({message: 'Successfully deleted.'});
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;