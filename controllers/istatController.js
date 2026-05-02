const IideaModel = require('../models/istatModel'); // Mantengo il nome file originale

exports.getDemographics = (req, res) => {
    try {
        const data = IideaModel.getDemographicsData();
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Errore nel recupero dati demografici IIDEA" });
    }
};

exports.getStats = (req, res) => {
    try {
        const stats = IideaModel.getGamingStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Errore nel recupero statistiche" });
    }
};
