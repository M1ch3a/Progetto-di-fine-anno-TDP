document.addEventListener('DOMContentLoaded', () => {
    // Navbar Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Fetch and populate Stats
    fetchStats();

    // Chart initialization
    initChart();

    function fetchStats() {
        fetch('/api/iidea/stats')
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    const elMobile = document.getElementById('stat-mobile');
                    const elConsole = document.getElementById('stat-console');
                    const elVr = document.getElementById('stat-vr');
                    
                    if (elMobile) elMobile.innerText = data.data.mobile;
                    if (elConsole) elConsole.innerText = data.data.consolePC;
                    if (elVr) elVr.innerText = data.data.vrSimulators;
                }
            })
            .catch(err => console.error("Error fetching stats:", err));
    }

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
                if(data.success) {
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
                                        label: function(context) {
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
});
