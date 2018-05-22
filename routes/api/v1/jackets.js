const	express = require('express'),
		router = express.Router(),
		Jacket = require('../../../models/jacket');

// Index
router.get('/', async (req, res) => {
	try {
		const jackets = await Jacket.find({});
		res.json(jackets);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const jacket = await Jacket.findById(id);
		if (!jacket) {
			const err = new Error('Jacket Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(jacket);
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find jacket with id: ${id}`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Create
router.post('/', async (req, res) => {
	try {
		const { jacket } = req.body;
		const jacketData = JSON.parse(jacket);
		const newJacket = await Jacket.create(jacketData);
		res.json(newJacket);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const { jacket } = req.body;
		const jacketData = JSON.parse(jacket);
		const updatedJacket = await Jacket.findByIdAndUpdate(id, jacketData, {new: true});
		if (!updatedJacket) {
			const err = new Error('Jacket Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(updatedJacket);
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find jacket with id: ${id}`);
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
		const deletedJacket = await Jacket.findByIdAndRemove(id);
		if (!deletedJacket) {
			const err = new Error('Jacket Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.send('Successfully deleted.')
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find jacket with id: ${id}`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.')
	}
})

module.exports = router;