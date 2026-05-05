const IideaModel = require('../models/istatModel');

exports.getDemographics = (req, res) => {
    try {
        const data = IideaModel.getDemographicsData();
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Errore nel recupero dati demografici IIDEA" });
    }
};