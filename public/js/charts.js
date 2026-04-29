// ==================== CHARTS.JS - Gestione grafici interattivi ====================

let stressChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inizializza il grafico con i dati di default
    initStressChart();
});

async function initStressChart() {
    try {
        const response = await fetch('/api/homepage-data');
        const data = await response.json();
        
        if (data.success && data.datiGrafico.length > 0) {
            createStressChart(data.datiGrafico);
        } else {
            // Usa dati di esempio se l'API non risponde
            const datiEsempio = generateExampleData();
            createStressChart(datiEsempio);
        }
    } catch (error) {
        console.error('Errore inizializzazione grafico:', error);
        const datiEsempio = generateExampleData();
        createStressChart(datiEsempio);
    }
}

function createStressChart(dati) {
    const ctx = document.getElementById('stressChart').getContext('2d');
    
    // Distruggi grafico esistente se presente
    if (stressChart) {
        stressChart.destroy();
    }
    
    // Prepara i dati per il grafico
    const labels = dati.map(d => `Stress: ${d.stress}%`);
    const performanceData = dati.map(d => d.performance);
    const stressData = dati.map(d => d.stress);
    const attivita = dati.map(d => d.attivita);
    
    // Colori dinamici basati sulla performance
    const pointColors = performanceData.map(perf => {
        if (perf >= 80) return '#39FF14'; // Verde - Ottimale
        if (perf >= 60) return '#00F0FF'; // Ciano - Buono
        if (perf >= 40) return '#FFB800'; // Giallo - Attenzione
        return '#FF007F'; // Magenta - Critico
    });
    
    stressChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Performance (%)',
                data: dati.map(d => ({
                    x: d.stress,
                    y: d.performance,
                    attivita: d.attivita,
                    oreSchermo: d.ore_schermo,
                    fasciaEta: d.fascia_eta
                })),
                backgroundColor: pointColors,
                borderColor: pointColors,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointBorderWidth: 2,
                pointBorderColor: '#FFFFFF',
                pointHoverBorderColor: '#FFFFFF',
                pointHoverBorderWidth: 3,
                order: 2
            }, {
                label: 'Curva ottimale',
                data: generateOptimalCurve(),
                type: 'line',
                borderColor: '#39FF14',
                backgroundColor: 'rgba(57, 255, 20, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: true,
                order: 1,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'nearest'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#E0E0E0',
                        font: {
                            family: "'Rajdhani', sans-serif",
                            size: 14
                        },
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 13, 13, 0.95)',
                    borderColor: '#00F0FF',
                    borderWidth: 1,
                    titleColor: '#00F0FF',
                    bodyColor: '#E0E0E0',
                    titleFont: {
                        family: "'Orbitron', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'Rajdhani', sans-serif",
                        size: 13
                    },
                    padding: 15,
                    cornerRadius: 5,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Curva ottimale') {
                                return 'Zona benessere ottimale';
                            }
                            const point = context.raw;
                            return [
                                `Performance: ${point.y}%`,
                                `Stress: ${point.x}%`,
                                `Attività: ${point.attivita}`,
                                `Ore schermo: ${point.oreSchermo}`,
                                `Età: ${point.fasciaEta} anni`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Livello di Stress (%)',
                        color: '#00F0FF',
                        font: {
                            family: "'Rajdhani', sans-serif",
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#888888',
                        stepSize: 10,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 240, 255, 0.1)',
                        drawBorder: true,
                        borderColor: '#00F0FF',
                        borderWidth: 1
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Performance (%)',
                        color: '#FF007F',
                        font: {
                            family: "'Rajdhani', sans-serif",
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#888888',
                        stepSize: 10,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 0, 127, 0.1)',
                        drawBorder: true,
                        borderColor: '#FF007F',
                        borderWidth: 1
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Funzione esposta globalmente per aggiornare il grafico
window.updateStressChart = function(dati) {
    if (!dati || dati.length === 0) {
        console.warn('Nessun dato disponibile per il grafico');
        return;
    }
    
    const pointColors = dati.map(d => {
        if (d.performance >= 80) return '#39FF14';
        if (d.performance >= 60) return '#00F0FF';
        if (d.performance >= 40) return '#FFB800';
        return '#FF007F';
    });
    
    stressChart.data.datasets[0].data = dati.map(d => ({
        x: d.stress,
        y: d.performance,
        attivita: d.attivita,
        oreSchermo: d.ore_schermo,
        fasciaEta: d.fascia_eta
    }));
    
    stressChart.data.datasets[0].backgroundColor = pointColors;
    stressChart.data.datasets[0].borderColor = pointColors;
    
    stressChart.update('active');
};

// Genera curva ottimale
function generateOptimalCurve() {
    const points = [];
    for (let x = 0; x <= 100; x += 5) {
        // Curva a campana invertita (U rovesciata)
        const y = -0.02 * Math.pow(x - 35, 2) + 95;
        points.push({
            x: x,
            y: Math.max(0, Math.min(100, y))
        });
    }
    return points;
}

// Genera dati di esempio
function generateExampleData() {
    const dati = [];
    const fasceEta = ['18-34', '35-54'];
    const oreSchermo = ['1-3h', '3-5h', '5-7h', '7-9h', '9+h'];
    
    fasceEta.forEach(eta => {
        oreSchermo.forEach((ore, index) => {
            const stress = 15 + (index * 15) + Math.random() * 10;
            const performance = index === 1 ? 85 + Math.random() * 10 : 
                               index === 0 ? 75 + Math.random() * 10 :
                               index === 2 ? 65 + Math.random() * 10 :
                               index === 3 ? 50 + Math.random() * 10 :
                               30 + Math.random() * 15;
            
            dati.push({
                stress: Math.round(stress),
                performance: Math.round(performance),
                fascia_eta: eta,
                ore_schermo: ore,
                attivita: index === 0 ? 'Gaming moderato' :
                         index === 1 ? 'Gaming equilibrato' :
                         index === 2 ? 'Gaming intensivo' :
                         index === 3 ? 'Gaming prolungato' :
                         'Gaming eccessivo'
            });
        });
    });
    
    return dati;
}

// Aggiungi effetti glow ai punti del grafico
function addGlowEffect(chart) {
    const canvas = chart.ctx.canvas;
    canvas.style.filter = 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.5))';
}

// Esporta funzioni se necessario (per modularità futura)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initStressChart,
        createStressChart,
        updateStressChart: window.updateStressChart
    };
}