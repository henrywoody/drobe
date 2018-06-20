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
		const outerwears = await Outerwear.find({owner: user._id});
		res.json(outerwears);
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

		res.json(outerwear);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { outerwear: outerwearData } = req.body;
		outerwearData.owner = user._id;

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
		const { outerwear: outerwearData } = req.body;
		const outerwear = await Outerwear.findById(id);

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

		const updatedOuterwear = await Outerwear.findByIdAndUpdate(id, outerwearData, {new: true});
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

		await Outerwear.findByIdAndRemove(id);
		res.json({message: 'Successfully deleted.'})
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;