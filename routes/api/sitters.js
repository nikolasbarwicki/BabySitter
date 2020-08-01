const express = require('express');

const router = express.Router();

// @route   GET api/sitters
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Sitters route'));

module.exports = router;
