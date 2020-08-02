const express = require('express');

const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../../middleware/auth');

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
      check('ageOfChildren', 'Ages of children are required').not().isEmpty(),
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
      ageOfChildren,
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
    if (ageOfChildren) {
      jobFields.ageOfChildren = ageOfChildren
        .split(',')
        .map((child) => child.trim());
    }
    if (description) jobFields.description = description;
    if (hourlyRate) jobFields.hourlyRate = hourlyRate;
    if (contactPhone) jobFields.contactPhone = contactPhone;
    if (contactEmail) jobFields.contactEmail = contactEmail;

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

// @route   GET api/jobs
// @desc    Get all babysitting jobs
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
    query = Job.find(JSON.parse(queryStr)).populate('user', ['name', 'email']);

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
