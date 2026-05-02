// Dati reali IIDEA (Italian Interactive Digital Entertainment Association) - Report 2024
class IideaModel {
    static getDemographicsData() {
        return {
            labels: ['6-14 anni', '15-24 anni', '25-34 anni', '35-44 anni', '45-64 anni'],
            percentages: [21, 25, 18, 15, 21] // Percentuali di videogiocatori in Italia
        };
    }

    static getGamingStats() {
        // Dati IIDEA sulle piattaforme di gioco usate
        return {
            mobile: "69%",
            consolePC: "45%",
            vrSimulators: "38%" // PC è 38%, quindi usiamo le tre macro categorie del report
        };
    }
}

module.exports = IideaModel;
