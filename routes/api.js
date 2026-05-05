const express = require('express');
const router = express.Router();
const dataController = require('../controllers/istatController');
const gamingController = require('../controllers/gamingController');

router.get('/iidea/demographics', dataController.getDemographics);

router.get('/gaming', gamingController.getGamingData);

module.exports = router;
