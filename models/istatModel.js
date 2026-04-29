const fs = require('fs').promises;
const path = require('path');

class IstatModel {
    constructor() {
        this.dataPath = path.join(__dirname, '..', 'data', 'istat-data.json');
    }

    async getDatiHomepage() {
        try {
            const rawData = await fs.readFile(this.dataPath, 'utf8');
            const dati = JSON.parse(rawData);
            
            return {
                percentuali: dati.percentuali_videogiochi,
                datiGrafico: dati.stress_performance
            };
        } catch (error) {
            console.log('File dati non trovato, uso dati predefiniti');
            return this.getDatiDefault();
        }
    }

    async getDatiFiltrati(fasciaEta = 'tutte', oreSchermo = 'tutte') {
        const dati = await this.getDatiHomepage();
        let datiFiltrati = dati.datiGrafico;

        if (fasciaEta && fasciaEta !== 'tutte') {
            datiFiltrati = datiFiltrati.filter(d => d.fascia_eta === fasciaEta);
        }

        if (oreSchermo && oreSchermo !== 'tutte') {
            datiFiltrati = datiFiltrati.filter(d => d.ore_schermo === oreSchermo);
        }

        return datiFiltrati;
    }

    getDatiDefault() {
        return {
            percentuali_videogiochi: [
                { eta: "6-17 anni", percentuale: 72, descrizione: "Giocano ai videogiochi regolarmente" },
                { eta: "18-34 anni", percentuale: 65, descrizione: "Gaming attivo settimanale" },
                { eta: "35-54 anni", percentuale: 38, descrizione: "Giocatori occasionali" },
                { eta: "55+ anni", percentuale: 15, descrizione: "Nuovi giocatori digitali" }
            ],
            stress_performance: [
                { stress: 20, performance: 85, fascia_eta: "18-34", ore_schermo: "1-3h", attivita: "Gaming moderato" },
                { stress: 35, performance: 90, fascia_eta: "18-34", ore_schermo: "3-5h", attivita: "Gaming equilibrato" },
                { stress: 50, performance: 78, fascia_eta: "18-34", ore_schermo: "5-7h", attivita: "Gaming intensivo" },
                { stress: 65, performance: 65, fascia_eta: "18-34", ore_schermo: "7-9h", attivita: "Gaming prolungato" },
                { stress: 80, performance: 40, fascia_eta: "18-34", ore_schermo: "9+h", attivita: "Gaming eccessivo" },
                { stress: 25, performance: 82, fascia_eta: "35-54", ore_schermo: "1-3h", attivita: "Gaming moderato" },
                { stress: 40, performance: 88, fascia_eta: "35-54", ore_schermo: "3-5h", attivita: "Gaming equilibrato" },
                { stress: 55, performance: 75, fascia_eta: "35-54", ore_schermo: "5-7h", attivita: "Gaming intensivo" },
                { stress: 70, performance: 60, fascia_eta: "35-54", ore_schermo: "7-9h", attivita: "Gaming prolungato" },
                { stress: 85, performance: 35, fascia_eta: "35-54", ore_schermo: "9+h", attivita: "Gaming eccessivo" }
            ]
        };
    }
}

module.exports = new IstatModel();