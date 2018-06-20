const	express = require('express'),
		router = express.Router(),
		Shirt = require('../../../models/shirt'),
		Pants = require('../../../models/pants'),
		Outerwear = require('../../../models/outerwear'),
		verifyIds = require('../../../modules/verify-ids'),
		handleErrors = require('../../../modules/handle-db-errors');

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const pants = await Pants.find({owner: user._id});
		res.json(pants);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Detail
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

		res.json(pair);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { pants: pairData } = req.body;
		pairData.owner = user._id

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
		const { pants: pairData } = req.body;
		pairData.shirts = pairData.shirts || [];
		pairData.outerwears = pairData.outerwears || [];

		const pair = await Pants.findById(id);

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
			if (!pair.shirts.includes(modelId)) {
				// newly added references
				await Shirt.findByIdAndUpdate(modelId, { $push: {pants: pair._id} });
			}
		}
		for (const modelId of pair.shirts) {
			if (!pairData.shirts.includes(modelId)) {
				// newly removed references
				await Shirt.findByIdAndUpdate(modelId, { $pull: {pants: pair._id} });
			}
		}

		for (const modelId of pairData.outerwears) {
			if (!pair.outerwears.includes(modelId)) {
				// newly added references
				await Outerwear.findByIdAndUpdate(modelId, { $push: {pants: pair._id} });
			}
		}
		for (const modelId of pair.outerwears) {
			if (!pairData.outerwears.includes(modelId)) {
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

		await Pants.findByIdAndRemove(id);
		res.json({message: 'Successfully deleted.'});
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;