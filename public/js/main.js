// ==================== MAIN.JS - Funzionalità generali ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Benessere Digitale - Homepage inizializzata');
    
    // Inizializza tutte le funzionalità
    initNavigation();
    initParticles();
    initSmoothScroll();
    loadIstatData();
    initChartListeners();
});

// ==================== NAVIGATION ====================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // Toggle menu mobile
    window.toggleMenu = function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Animazione hamburger
        const spans = hamburger.querySelectorAll('span');
        if (hamburger.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    };
    
    // Chiudi menu al click su link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(13, 13, 13, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 240, 255, 0.1)';
        } else {
            navbar.style.background = 'rgba(13, 13, 13, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// ==================== PARTICLE BACKGROUND ====================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = Math.random() > 0.5 ? '#00F0FF' : '#FF007F';
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            
            // Effetto glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Crea particelle
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Linee di connessione
    function drawLines() {
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = '#00F0FF';
                    ctx.globalAlpha = 0.1 * (1 - distance / 150);
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
    }
    
    // Animazione
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawLines();
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(targetId);
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== CARICA DATI ISTAT ====================
async function loadIstatData() {
    const indicatorsGrid = document.getElementById('istatIndicators');
    if (!indicatorsGrid) return;
    
    try {
        const response = await fetch('/api/homepage-data');
        const data = await response.json();
        
        if (data.success && data.datiISTAT.length > 0) {
            renderIstatIndicators(data.datiISTAT);
        } else {
            showError(indicatorsGrid, 'Dati ISTAT non disponibili');
        }
    } catch (error) {
        console.error('Errore caricamento dati ISTAT:', error);
        showError(indicatorsGrid, 'Errore nel caricamento dati ISTAT');
    }
}

function renderIstatIndicators(dati) {
    const indicatorsGrid = document.getElementById('istatIndicators');
    indicatorsGrid.innerHTML = '';
    
    dati.forEach(dato => {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'indicator';
        indicatorDiv.innerHTML = `
            <div class="circular-chart" data-percent="${dato.percentuale}">
                <svg viewBox="0 0 36 36">
                    <path class="circle-bg" d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="circle" stroke-dasharray="${dato.percentuale}, 100"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <text x="18" y="20.35" class="percentage">${dato.percentuale}%</text>
                </svg>
            </div>
            <p class="indicator-label">${dato.eta}</p>
            <p class="indicator-desc">${dato.descrizione}</p>
        `;
        indicatorsGrid.appendChild(indicatorDiv);
    });
}

function showError(container, message) {
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <p style="color: #FF007F;">⚠️ ${message}</p>
            <button onclick="location.reload()" class="cyber-select" style="margin-top: 1rem;">
                Riprova
            </button>
        </div>
    `;
}

// ==================== CHART LISTENERS ====================
function initChartListeners() {
    const selectEta = document.getElementById('fasciaEta');
    const selectOre = document.getElementById('oreSchermo');
    
    if (selectEta && selectOre) {
        selectEta.addEventListener('change', updateChart);
        selectOre.addEventListener('change', updateChart);
    }
}

async function updateChart() {
    const fasciaEta = document.getElementById('fasciaEta').value;
    const oreSchermo = document.getElementById('oreSchermo').value;
    const loader = document.getElementById('chartLoader');
    
    try {
        // Mostra loader
        if (loader) loader.style.display = 'block';
        
        const response = await fetch(`/api/istat/stress-performance?fasciaEta=${fasciaEta}&oreSchermo=${oreSchermo}`);
        const data = await response.json();
        
        if (data.success && window.updateStressChart) {
            window.updateStressChart(data.dati);
        }
        
        // Nascondi loader
        if (loader) loader.style.display = 'none';
        
    } catch (error) {
        console.error('Errore aggiornamento grafico:', error);
        if (loader) loader.style.display = 'none';
        alert('Errore nell\'aggiornamento del grafico. Riprova.');
    }
}

// ==================== CARD HOVER EFFECTS ====================
document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        card.style.transform = 'translateY(-8px)';
        card.style.borderColor = 'var(--cyan)';
        card.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.3)';
    }
});

document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        card.style.transform = 'translateY(0)';
        card.style.borderColor = 'rgba(0, 240, 255, 0.2)';
        card.style.boxShadow = 'none';
    }
});

// ==================== INTERSECTION OBSERVER ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Osserva le sezioni per animazioni al scroll
document.querySelectorAll('.card, .indicator, .chart-container').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});