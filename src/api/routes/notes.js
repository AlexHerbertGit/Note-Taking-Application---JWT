const express = require('express');
const { check, validationResult } = require('express-validator');
const Note = require('../models/note');
const auth = require('../middleware/auth')

const router = express.Router();

// GET ROUTE  /api/notes
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//GET ROUTE   /api/notes/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ msg: 'Note not found' });
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized'})
        }
        
        res.json(note);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Note not found' });
        }
        res.status(500).send('Server Error');
    }
});

//POST ROUTE  /api/notes
router.post(
    '/',
    [auth, [
        check('title', 'Title is required').not().isEmpty(),
        check('date', 'Date is required').not().isEmpty(),
        check('content', 'Content is required').not().isEmpty(),
    ]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, date, content } = req.body;

        try {
            const newNote = new Note({
                title,
                date,
                content,
                user: req.user.id
            });

            const note = await newNote.save();
            res.json(note);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//PUT ROUTE   /api/notes/:id
router.put('/:id', auth, async (req, res) => {
    const { title, date, content } = req.body;

    // Build note object
    const noteFields = {};
    if (title) noteFields.title = title;
    if (date) noteFields.date = date;
    if (content) noteFields.content = content;

    try {
        let note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ msg: 'Note not found' });

        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        note = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: noteFields },
            { new: true }
        );

        res.json(note);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//DELETE ROUTE   /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ msg: 'Note not found' });

        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Note.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Note removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;