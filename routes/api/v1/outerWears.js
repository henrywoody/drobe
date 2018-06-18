const	express = require('express'),
		router = express.Router(),
		Outerwear = require('../../../models/outerwear'),
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
		const newOuterwear = await Outerwear.create(outerwearData);
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