const	express = require('express'),
		router = express.Router(),
		Pants = require('../../../models/pants');

// Index
router.get('/', async (req, res) => {
	try {
		const pants = await Pants.find({});
		res.json(pants);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.')
	}
})

// Detail
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const pair = await Pants.findById(id);
		if (!pair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(pair);
	} catch (err) {
		console.log(err);
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find pants with id: ${id}.`);
			return;
		}
		res.status(500).send('There was a problem with the server.');
	}
})

// Create
router.post('/', async (req, res) => {
	try {
		const { pair } = req.body;
		const pairData = JSON.parse(pair);
		const newPair = await Pants.create(pairData);
		res.json(newPair);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

// Update
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const { pair } = req.body;
		const pairData = JSON.parse(pair);
		const updatedPair = await Pants.findByIdAndUpdate(id, pairData, {new: true});
		if (!updatedPair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.json(updatedPair);
	} catch (err) {
		console.log(err);
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find pants with id: ${id}.`);
			return;
		}
		res.status(500).send('There was a problem with the server.');
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const deletedPair = await Pants.findByIdAndRemove(id);
		if (!deletedPair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		res.send('Successfully deleted.');
	} catch (err) {
		console.log(err);
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find pants with id: ${id}.`);
			return;
		}
		res.status(500).send('There was a problem with the server.');
	}
})

module.exports = router;