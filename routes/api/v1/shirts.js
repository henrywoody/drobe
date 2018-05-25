const	express = require('express'),
		router = express.Router(),
		Shirt = require('../../../models/shirt');

// Index
router.get('/', async (req, res) => {
	try {
		const shirts = await Shirt.find({});
		res.json(shirts);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const shirt = await Shirt.findById(id);
		if (!shirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(shirt);
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find shirt with id: ${id}.`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Create
router.post('/', async (req, res) => {
	try {
		const { shirt } = req.body;
		const newShirt = await Shirt.create(shirt);
		res.json(newShirt);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const { shirt } = req.body;
		const updatedShirt = await Shirt.findByIdAndUpdate(id, shirt, {new: true});
		if (!updatedShirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(updatedShirt);
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find shirt with id: ${id}.`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const deletedShirt = await Shirt.findByIdAndRemove(id);
		if (!deletedShirt) {
			const err = new Error('Shirt Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.send('Successfully deleted.')
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find shirt with id: ${id}.`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

module.exports = router;