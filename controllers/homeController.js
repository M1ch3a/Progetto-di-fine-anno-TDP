const istatModel = require('../models/istatModel');

exports.getHomePageData = async (req, res) => {
    try {
        const datiHomepage = await istatModel.getDatiHomepage();
        res.json({
            success: true,
            datiISTAT: datiHomepage.percentuali,
            datiGrafico: datiHomepage.datiGrafico,
            fonte: "ISTAT - Indagine Aspetti della Vita Quotidiana 2024"
        });
    } catch (error) {
        console.error('Errore nel caricamento dati:', error);
        res.status(500).json({
            success: false,
            error: 'Dati ISTAT temporaneamente non disponibili',
            datiISTAT: [],
            datiGrafico: []
        });
    }
};

exports.getStressPerformanceData = async (req, res) => {
    try {
        const { fasciaEta, oreSchermo } = req.query;
        const datiFiltrati = await istatModel.getDatiFiltrati(fasciaEta, oreSchermo);
        res.json({
            success: true,
            dati: datiFiltrati
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Errore nel recupero dati'
        });
    }
};