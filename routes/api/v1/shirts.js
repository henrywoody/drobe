const	express = require('express'),
		router = express.Router(),
		Shirt = require('../../../models/shirt');

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const shirts = await Shirt.find({owner: user._id});
		res.json(shirts);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
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
	const { user } = req;
	try {
		const { shirt: shirtData } = req.body;
		shirtData.owner = user._id;
		const newShirt = await Shirt.create(shirtData);
		res.json(newShirt);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
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
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find shirt with id: ${id}.`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

module.exports = router;