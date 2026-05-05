class GamingModel {
    static generateMockData() {
        const data = {};
        // Generazione dei dati per 5 persone in una settimana
        for (let p = 1; p <= 5; p++) {
            const personaName = `Persona${p}`;
            data[personaName] = [];

            // Simulazione di un giocatore che gioca tardi la sera o uno che gioca più presto
            const lateGamer = Math.random() > 0.5;

            for (let giorno = 1; giorno <= 7; giorno++) {
                let oreGiocate = Math.floor(Math.random() * 3) + 1; // 1 to 3 ore base
                if (giorno === 6 || giorno === 7) oreGiocate += 2; // Più ore giocate nel weekend

                let startHour = lateGamer ? 21 + Math.floor(Math.random() * 3) : 17 + Math.floor(Math.random() * 4); // 21-23 o 17-20
                if (startHour >= 24) startHour -= 24;
                let startMin = Math.random() > 0.5 ? "00" : "30";
                let oraInizio = `${startHour.toString().padStart(2, '0')}:${startMin}`;

                let interruzioniGaming = Math.floor(Math.random() * 3);

                data[personaName].push({
                    giorno: giorno,
                    gaming: {
                        oraInizio: oraInizio,
                        oreGiocate: oreGiocate,
                        interruzioniGaming: interruzioniGaming
                    }
                });
            }
        }

        return data;
    }
}

module.exports = GamingModel;
