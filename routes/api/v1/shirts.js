const	express = require('express'),
		router = express.Router(),
		Shirt = require('../../../models/shirt'),
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
		const newShirt = await Shirt.create(shirtData);
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
		const shirt = await Shirt.findById(id);
		
		if (!shirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!shirt.owner.equals(user._id))
			return res.sendStatus(403);

		const updatedShirt = await Shirt.findByIdAndUpdate(id, shirtData, {new: true});
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

		if (!Shirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!shirt.owner.equals(user._id))
			return res.sendStatus(403);

		await Shirt.findByIdAndRemove(id);
		res.send('Successfully deleted.')
	} catch (err) {
		handleErrors(err, res);
	}
})

module.exports = router;