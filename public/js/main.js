document.addEventListener('DOMContentLoaded', () => {
    // Navbar Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Chiude il menu quando si clicca su un link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Inizializza i grafici
    initChart();

    function initChart() {
        const loader = document.getElementById('chart-loader');
        const canvas = document.getElementById('ageDemographicsChart');
        if (!canvas || !loader) return;

        const ctx = canvas.getContext('2d');

        loader.style.display = 'block';
        canvas.style.opacity = '0.3';

        fetch('/api/iidea/demographics')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: data.data.labels,
                            datasets: [{
                                label: 'Videogiocatori per fascia d\'età (%)',
                                data: data.data.percentages,
                                backgroundColor: 'rgba(0, 240, 255, 0.6)',
                                borderColor: '#00F0FF',
                                borderWidth: 1,
                                hoverBackgroundColor: '#39FF14',
                                hoverBorderColor: '#39FF14'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                tooltip: {
                                    backgroundColor: 'rgba(26, 26, 36, 0.9)',
                                    titleColor: '#F2F2F2',
                                    bodyColor: '#A0A0B0',
                                    borderColor: '#FF007F',
                                    borderWidth: 1,
                                    callbacks: {
                                        label: function (context) {
                                            return `${context.raw}% del totale videogiocatori`;
                                        }
                                    }
                                },
                                legend: {
                                    labels: {
                                        color: '#F2F2F2',
                                        font: { family: "'Inter', sans-serif" }
                                    }
                                }
                            },
                            scales: {
                                x: {
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                    ticks: { color: '#A0A0B0', font: { weight: 'bold' } }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Percentuale (%)',
                                        color: '#FF007F',
                                        font: { size: 14, weight: 'bold' }
                                    },
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                    ticks: { color: '#A0A0B0' },
                                    min: 0,
                                    max: 40
                                }
                            },
                            animation: { duration: 800, easing: 'easeOutQuart' }
                        }
                    });
                }
            })
            .catch(err => console.error("Error fetching chart data:", err))
            .finally(() => {
                loader.style.display = 'none';
                canvas.style.opacity = '1';
            });
    }

    initHealthChart();

    function initHealthChart() {
        const loader = document.getElementById('health-chart-loader');
        const canvas = document.getElementById('healthLineChart');
        if (!canvas || !loader) return;

        const ctx = canvas.getContext('2d');
        loader.style.display = 'block';
        canvas.style.opacity = '0.3';

        fetch('https://public-api.trackvibe.qzz.io/salute')
            .then(res => res.json())
            .then(data => {
                // Prepara i dataset per Chart.js
                const giorni = [1, 2, 3, 4, 5, 6, 7].map(g => `Giorno ${g}`);
                const datasets = [];
                const colors = ['#00F0FF', '#39FF14', '#FF007F'];
                let colorIndex = 0;

                for (const [persona, logGiornaliero] of Object.entries(data)) {
                    const color = colors[colorIndex % colors.length];
                    datasets.push({
                        label: `Sonno ${persona} (3h gaming)`,
                        data: logGiornaliero.map(d => d.oreDormite),
                        borderColor: color,
                        backgroundColor: color + '33',
                        borderWidth: 2,
                        tension: 0.4,
                        pointBackgroundColor: color,
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true
                    });
                    colorIndex++;
                }

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: giorni,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                backgroundColor: 'rgba(26, 26, 36, 0.9)',
                                titleColor: '#F2F2F2',
                                bodyColor: '#A0A0B0',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                callbacks: {
                                    label: function (context) {
                                        const h = Math.floor(context.raw);
                                        const m = Math.round((context.raw - h) * 60);
                                        return `${context.dataset.label}: ${h}h ${m}m`;
                                    }
                                }
                            },
                            legend: {
                                labels: {
                                    color: '#F2F2F2',
                                    font: { family: "'Inter', sans-serif" }
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: '#A0A0B0', font: { weight: 'bold' } }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Ore Dormite',
                                    color: '#A0A0B0',
                                    font: { size: 14, weight: 'bold' }
                                },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: {
                                    color: '#A0A0B0',
                                    callback: function (value) {
                                        const h = Math.floor(value);
                                        const m = Math.round((value - h) * 60);
                                        return m === 0 ? `${h}h` : `${h}h ${m}m`;
                                    }
                                },
                                min: 2,
                                max: 12
                            }
                        },
                        animation: { duration: 1000, easing: 'easeOutQuart' }
                    }
                });
            })
            .catch(err => {
                console.error("Error fetching health data:", err);
            })
            .finally(() => {
                loader.style.display = 'none';
                canvas.style.opacity = '1';
            });
    }
});
