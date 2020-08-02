const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const geocoder = require('../../utils/geocoder');

const Sitter = require('../../models/Sitter');

// @route   GET api/sitters/me
// @desc    Get logged in sitter profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const sitter = await Sitter.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'email']);

    if (!sitter) {
      return res
        .status(400)
        .json({ msg: 'There is no sitter profile info for this user' });
    }

    res.json(sitter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/sitters/
// @desc    Create sitter profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('address', 'Address is required').not().isEmpty(),
      check('dateOfBirth', 'Date of birth is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('experience', 'Valid experience is required').isIn([
        '<1 year',
        '1-2 years',
        '2-5 years',
        '>5 years',
      ]),
      check('hourlyRate', 'Hourly rate is required').not().isEmpty(),
      check('contactPhone', 'Valid phone number is required').isMobilePhone(),
      check('contactEmail', 'Valid email address is required').isEmail(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      address,
      dateOfBirth,
      description,
      experience,
      baby,
      toddler,
      preschooler,
      gradeschooler,
      teenager,
      hourlyRate,
      crafting,
      drawing,
      reading,
      music,
      language,
      games,
      pets,
      cooking,
      chores,
      contactPhone,
      contactEmail,
    } = req.body;

    // Build sitter object
    const sitterFields = {};
    sitterFields.user = req.user.id;
    if (address) sitterFields.address = address;
    if (dateOfBirth) sitterFields.dateOfBirth = dateOfBirth;
    if (description) sitterFields.description = description;
    if (experience) sitterFields.experience = experience;
    if (hourlyRate) sitterFields.hourlyRate = hourlyRate;
    if (contactPhone) sitterFields.contactPhone = contactPhone;
    if (contactEmail) sitterFields.contactEmail = contactEmail;

    // Build experienceAge object
    sitterFields.experienceAges = {};
    if (baby) sitterFields.experienceAges.baby = baby;
    if (toddler) sitterFields.experienceAges.toddler = toddler;
    if (preschooler) sitterFields.experienceAges.preschooler = preschooler;
    if (gradeschooler)
      sitterFields.experienceAges.gradeschooler = gradeschooler;
    if (teenager) sitterFields.experienceAges.teenager = teenager;

    // Build skills object
    sitterFields.skills = {};
    if (crafting) sitterFields.skills.crafting = crafting;
    if (drawing) sitterFields.skills.drawing = drawing;
    if (reading) sitterFields.skills.reading = reading;
    if (music) sitterFields.skills.music = music;
    if (language) sitterFields.skills.language = language;
    if (games) sitterFields.skills.games = games;

    // Build comfortableWith object
    sitterFields.comfortableWith = {};
    if (pets) sitterFields.comfortableWith.pets = pets;
    if (cooking) sitterFields.comfortableWith.cooking = cooking;
    if (chores) sitterFields.comfortableWith.chores = chores;

    try {
      let sitter = await Sitter.findOne({ user: req.user.id });

      if (sitter) {
        // Update
        sitter = await Sitter.findOneAndUpdate(
          { user: req.user.id },
          { $set: sitterFields },
          { new: true, useFindAndModify: false },
        );

        return res.json(sitter);
      }

      // Create
      sitter = new Sitter(sitterFields);

      await sitter.save();
      res.json(sitter);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

// @route   PUT api/sitters/:id
// @desc    Update sitter profile
// @access  Private
router.put(
  '/',
  [
    auth,
    [
      check('address', 'Address is required').not().isEmpty(),
      check('dateOfBirth', 'Date of birth is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('experience', 'Valid experience is required').isIn([
        '<1 year',
        '1-2 years',
        '2-5 years',
        '>5 years',
      ]),
      check('hourlyRate', 'Hourly rate is required').not().isEmpty(),
      check('contactPhone', 'Valid phone number is required').isMobilePhone(),
      check('contactEmail', 'Valid email address is required').isEmail(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      address,
      dateOfBirth,
      description,
      experience,
      baby,
      toddler,
      preschooler,
      gradeschooler,
      teenager,
      hourlyRate,
      crafting,
      drawing,
      reading,
      music,
      language,
      games,
      pets,
      cooking,
      chores,
      contactPhone,
      contactEmail,
    } = req.body;

    // Build sitter object
    const sitterFields = {};
    sitterFields.user = req.user.id;
    if (address) sitterFields.address = address;
    if (dateOfBirth) sitterFields.dateOfBirth = dateOfBirth;
    if (description) sitterFields.description = description;
    if (experience) sitterFields.experience = experience;
    if (hourlyRate) sitterFields.hourlyRate = hourlyRate;
    if (contactPhone) sitterFields.contactPhone = contactPhone;
    if (contactEmail) sitterFields.contactEmail = contactEmail;

    // Build experienceAge object
    sitterFields.experienceAges = {};
    if (baby) sitterFields.experienceAges.baby = baby;
    if (toddler) sitterFields.experienceAges.toddler = toddler;
    if (preschooler) sitterFields.experienceAges.preschooler = preschooler;
    if (gradeschooler)
      sitterFields.experienceAges.gradeschooler = gradeschooler;
    if (teenager) sitterFields.experienceAges.teenager = teenager;

    // Build skills object
    sitterFields.skills = {};
    if (crafting) sitterFields.skills.crafting = crafting;
    if (drawing) sitterFields.skills.drawing = drawing;
    if (reading) sitterFields.skills.reading = reading;
    if (music) sitterFields.skills.music = music;
    if (language) sitterFields.skills.language = language;
    if (games) sitterFields.skills.games = games;

    // Build comfortableWith object
    sitterFields.comfortableWith = {};
    if (pets) sitterFields.comfortableWith.pets = pets;
    if (cooking) sitterFields.comfortableWith.cooking = cooking;
    if (chores) sitterFields.comfortableWith.chores = chores;

    try {
      const sitter = await Sitter.findOneAndUpdate(
        { user: req.user.id },
        { $set: sitterFields },
        { new: true, useFindAndModify: false },
      );

      res.status(200).json(sitter);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

// @route   GET api/sitters
// @desc    Get all sitters profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );

    // Finding resource
    query = Sitter.find(JSON.parse(queryStr)).populate('user', [
      'name',
      'email',
    ]);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Sitter.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const sitters = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: sitters.length,
      pagination,
      data: sitters,
    });
  } catch (err) {
    console.log(err);
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/sitters/user/:user_id
// @desc    Get sitter profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const sitter = await Sitter.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'email']);

    if (!sitter)
      return res.status(400).json({ msg: 'Sitter profile not found' });

    res.json(sitter);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Sitter profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/sitters/user
// @desc    Delete sitter profile
// @access  Private
router.delete('/user', auth, async (req, res) => {
  try {
    // Remove sitter profile
    await Sitter.findOneAndRemove(
      { user: req.user.id },
      { useFindAndModify: false },
    );

    res.json({ msg: 'Sitter profile deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
