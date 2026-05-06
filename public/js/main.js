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

    // Chart initialization
    initChart();

    function initChart() {
        const loader = document.getElementById('chart-loader');
        const table = document.getElementById('ageDemographicsTable');
        if (!table || !loader) return;

        loader.style.display = 'block';

        fetch('/api/iidea/demographics')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const tableBody = table.querySelector('tbody');
                    if (!tableBody) return;
                    tableBody.innerHTML = '';

                    for (let i = 0; i < data.data.labels.length; i++) {
                        const tr = document.createElement('tr');
                        
                        const tdLabel = document.createElement('td');
                        tdLabel.innerHTML = `<strong>${data.data.labels[i]}</strong>`;
                        
                        const tdValue = document.createElement('td');
                        tdValue.textContent = data.data.percentages[i] + '%';
                        tdValue.style.color = 'var(--accent-cyan)';
                        tdValue.style.fontWeight = 'bold';

                        tr.appendChild(tdLabel);
                        tr.appendChild(tdValue);
                        tableBody.appendChild(tr);
                    }
                }
            })
            .catch(err => console.error("Error fetching demographic data:", err))
            .finally(() => {
                loader.style.display = 'none';
            });
    }

    initHealthChart();

    function initHealthChart() {
        const loader = document.getElementById('health-chart-loader');
        const table = document.getElementById('healthLineTable');
        if (!table || !loader) return;

        loader.style.display = 'block';

        fetch('https://public-api.trackvibe.qzz.io/salute')
            .then(res => res.json())
            .then(data => {
                const tableBody = table.querySelector('tbody');
                if (!tableBody) return;
                tableBody.innerHTML = '';

                let colorIndex = 0;
                const colors = ['var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-magenta)'];

                for (const [persona, logGiornaliero] of Object.entries(data)) {
                    const tr = document.createElement('tr');
                    
                    const tdPersona = document.createElement('td');
                    tdPersona.innerHTML = `<strong>${persona}</strong>`;
                    tdPersona.style.color = colors[colorIndex % colors.length];
                    tr.appendChild(tdPersona);

                    logGiornaliero.forEach(d => {
                        const td = document.createElement('td');
                        const h = Math.floor(d.oreDormite);
                        const m = Math.round((d.oreDormite - h) * 60);
                        td.textContent = m === 0 ? `${h}h` : `${h}h ${m}m`;
                        tr.appendChild(td);
                    });

                    tableBody.appendChild(tr);
                    colorIndex++;
                }
            })
            .catch(err => {
                console.error("Error fetching health data:", err);
            })
            .finally(() => {
                loader.style.display = 'none';
            });
    }
});
