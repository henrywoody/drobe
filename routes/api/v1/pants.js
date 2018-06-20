const	express = require('express'),
		router = express.Router(),
		Pants = require('../../../models/pants'),
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

		const newPair = await Pants.create(pairData);
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

		const updatedPair = await Pants.findByIdAndUpdate(id, pairData, {new: true});
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