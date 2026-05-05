const GamingModel = require('../models/gamingModel');

exports.getGamingData = (req, res) => {
    try {
        const data = GamingModel.generateMockData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Errore durante la generazione dei dati" });
    }
};
