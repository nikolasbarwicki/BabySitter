const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../../middleware/auth');
const geocoder = require('../../utils/geocoder');

const Job = require('../../models/Job');

// @route   GET api/jobs/me
// @desc    Get logged in user babysitting job
// @access  Private
router.get('/me', [[protect, authorize('parent')]], async (req, res) => {
  try {
    const job = await Job.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'email']);

    if (!job) {
      return res
        .status(400)
        .json({ msg: 'There is no babysitting job info for this user' });
    }

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs/
// @desc    Create babysitting job
// @access  Private
router.post(
  '/',
  [
    [[protect, authorize('parent')]],
    [
      check('address', 'Address is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('numberOfChildren', 'Number of children is required')
        .not()
        .isEmpty(),
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
      numberOfChildren,
      baby,
      toddler,
      preschooler,
      gradeschooler,
      teenager,
      description,
      hourlyRate,
      pets,
      cooking,
      chores,
      contactPhone,
      contactEmail,
    } = req.body;

    // Build job object
    const jobFields = {};
    jobFields.user = req.user.id;
    if (address) jobFields.address = address;
    if (numberOfChildren) jobFields.numberOfChildren = numberOfChildren;
    if (description) jobFields.description = description;
    if (hourlyRate) jobFields.hourlyRate = hourlyRate;
    if (contactPhone) jobFields.contactPhone = contactPhone;
    if (contactEmail) jobFields.contactEmail = contactEmail;

    // Build ageOfChildren object
    jobFields.ageOfChildren = {};
    if (baby) jobFields.ageOfChildren.baby = baby;
    if (toddler) jobFields.ageOfChildren.toddler = toddler;
    if (preschooler) jobFields.ageOfChildren.preschooler = preschooler;
    if (gradeschooler) jobFields.ageOfChildren.gradeschooler = gradeschooler;
    if (teenager) jobFields.ageOfChildren.teenager = teenager;

    // Build comfortableWith object
    jobFields.comfortableWith = {};
    if (pets) jobFields.comfortableWith.pets = pets;
    if (cooking) jobFields.comfortableWith.cooking = cooking;
    if (chores) jobFields.comfortableWith.chores = chores;

    try {
      let job = await Job.findOne({ user: req.user.id });

      if (job) {
        // Update
        job = await Job.findOneAndUpdate(
          { user: req.user.id },
          { $set: jobFields },
          { new: true, useFindAndModify: false },
        );

        return res.json(job);
      }

      // Create
      job = new Job(jobFields);

      await job.save();
      res.json(job);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

// @route   PUT api/jobs/
// @desc    Update babysitting job
// @access  Private
router.put(
  '/:id',
  [
    [[protect, authorize('parent')]],
    [
      check('address', 'Address is required').not().isEmpty(),

      check('description', 'Description is required').not().isEmpty(),
      check('numberOfChildren', 'Number of children is required')
        .not()
        .isEmpty(),
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
      numberOfChildren,
      baby,
      toddler,
      preschooler,
      gradeschooler,
      teenager,
      description,
      hourlyRate,
      pets,
      cooking,
      chores,
      contactPhone,
      contactEmail,
    } = req.body;

    // Build job object
    const jobFields = {};
    jobFields.user = req.user.id;
    if (address) jobFields.address = address;
    if (numberOfChildren) jobFields.numberOfChildren = numberOfChildren;
    if (description) jobFields.description = description;
    if (hourlyRate) jobFields.hourlyRate = hourlyRate;
    if (contactPhone) jobFields.contactPhone = contactPhone;
    if (contactEmail) jobFields.contactEmail = contactEmail;

    // Build ageOfChildren object
    jobFields.ageOfChildren = {};
    if (baby) jobFields.ageOfChildren.baby = baby;
    if (toddler) jobFields.ageOfChildren.toddler = toddler;
    if (preschooler) jobFields.ageOfChildren.preschooler = preschooler;
    if (gradeschooler) jobFields.ageOfChildren.gradeschooler = gradeschooler;
    if (teenager) jobFields.ageOfChildren.teenager = teenager;

    // Build comfortableWith object
    jobFields.comfortableWith = {};
    if (pets) jobFields.comfortableWith.pets = pets;
    if (cooking) jobFields.comfortableWith.cooking = cooking;
    if (chores) jobFields.comfortableWith.chores = chores;

    // Update geocoded location
    const loc = await geocoder.geocode(address);
    jobFields.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode,
    };

    try {
      let job = await Job.findOne({ user: req.user.id });

      job = await Job.findOneAndUpdate(
        { user: req.user.id },
        { $set: jobFields },
        { new: true, useFindAndModify: false },
      );

      return res.json(job);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

// @route   GET api/jobs
// @desc    Get all babysitting jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query;
    let lat;
    let lng;
    let location = {};

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'city', 'radius'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );

    // Add location query with city and distance
    if (req.query.city) {
      const loc = await geocoder.geocode(req.query.city);
      lat = loc[0].latitude;
      lng = loc[0].longitude;

      location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], (req.query.radius || 10) / 6378],
        },
      };
    }

    // If location is provided add it to search query
    const searchQuery = req.query.city
      ? {
          ...JSON.parse(queryStr),
          location,
        }
      : JSON.parse(queryStr);

    // Finding resource
    query = Job.find(searchQuery).populate('user', ['name', 'email']);

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
    const total = await Job.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const jobs = await query;

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
      count: jobs.length,
      pagination,
      data: jobs,
    });
  } catch (err) {
    console.log(err);
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/jobs/user/:user_id
// @desc    Get sitter profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const job = await Job.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'email']);

    if (!job) return res.status(400).json({ msg: 'Babysitting job not found' });

    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Babysitting job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/sitters/user
// @desc    Delete sitter profile
// @access  Private
router.delete('/user', [protect, authorize('parent')], async (req, res) => {
  try {
    // Remove sitter profile
    await Job.findOneAndRemove(
      { user: req.user.id },
      { useFindAndModify: false },
    );

    res.json({ msg: 'Babysitting job deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
