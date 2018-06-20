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
		const shirts = await Shirt.find({owner: user._id});
		res.json(shirts);
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

		res.json(shirt);
	} catch (err) {
		handleErrors(err, res);
	}
})

// Create
router.post('/', async (req, res) => {
	const { user } = req;
	try {
		const { shirt: shirtData } = req.body;
		shirtData.owner = user._id;

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
		const { shirt: shirtData } = req.body;
		shirtData.pants = shirtData.pants || [];
		shirtData.outerwears = shirtData.outerwears || [];

		const shirt = await Shirt.findById(id);
		
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
			if (!shirt.pants.includes(modelId)) {
				// newly added references
				await Pants.findByIdAndUpdate(modelId, { $push: {shirts: shirt._id} });
			}
		}
		for (const modelId of shirt.pants) {
			if (!shirtData.pants.includes(modelId)) {
				// newly removed references
				await Pants.findByIdAndUpdate(modelId, { $pull: {shirts: shirt._id} });
			}
		}

		for (const modelId of shirtData.outerwears) {
			if (!shirt.outerwears.includes(modelId)) {
				// newly added references
				await Outerwear.findByIdAndUpdate(modelId, { $push: {shirts: shirt._id} });
			}
		}
		for (const modelId of shirt.outerwears) {
			if (!shirtData.outerwears.includes(modelId)) {
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