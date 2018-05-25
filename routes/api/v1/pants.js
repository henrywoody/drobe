const	express = require('express'),
		router = express.Router(),
		Pants = require('../../../models/pants');

// Index
router.get('/', async (req, res) => {
	const { user } = req;
	try {
		const pants = await Pants.find({owner: user._id});
		res.json(pants);
	} catch (err) {
		console.log(err);
		res.status(500).send('There was a problem with the server.')
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
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find pants with id: ${id}.`);
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
		const { pair: pairData } = req.body;
		pairData.owner = user._id
		const newPair = await Pants.create(pairData);
		res.json(newPair);
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
		const { pair: pairData } = req.body;
		const pair = await Pants.findById(id);

		if (!pair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!pair.owner.equals(user._id))
			return res.sendStatus(403);

		const updatedPair = await Pants.findByIdAndUpdate(id, pairData, {new: true});
		res.json(updatedPair);
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find pants with id: ${id}.`);
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
		const pair = await Pants.findById(id);

		if (!pair) {
			const err = new Error('Pants Not Found.');
			err.name = 'NotFound';
			throw err;
		}
		if (!pair.owner.equals(user._id))
			return res.sendStatus(403);

		await Pants.findByIdAndRemove(id);
		res.send('Successfully deleted.');
	} catch (err) {
		if (err.name === 'CastError' || err.name === 'NotFound') {
			res.status(404).send(`Could not find pants with id: ${id}.`);
			return;
		}
		console.log(err);
		res.status(500).send('There was a problem with the server.');
	}
})

module.exports = router;