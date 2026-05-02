const express = require('express');
const router = express.Router();
const dataController = require('../controllers/istatController'); // Same controller file

router.get('/iidea/demographics', dataController.getDemographics);
router.get('/iidea/stats', dataController.getStats);

module.exports = router;
