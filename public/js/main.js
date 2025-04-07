// Smooth scrolling para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Añadir clase visible antes del scroll
            targetElement.classList.add('visible');
            
            // Scroll suave
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Ajuste para el navbar fijo
                behavior: 'smooth'
            });
        }
    });
});

// Navbar transparente al inicio y sólida al hacer scroll
function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('bg-dark');
        navbar.classList.remove('bg-transparent');
    } else {
        navbar.classList.add('bg-transparent');
        navbar.classList.remove('bg-dark');
    }
}

// Activar el enlace de navegación actual basado en la sección visible
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
            const id = section.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Event listeners
window.addEventListener('scroll', () => {
    updateNavbar();
    updateActiveNavLink();
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando aplicación...');

    // Inicializar AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Observer para las transiciones de sección
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observar todas las secciones con transición
    document.querySelectorAll('.section-transition').forEach(section => {
        observer.observe(section);
    });

    // Smooth scroll para los enlaces del navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Añadir clase visible antes del scroll
                targetElement.classList.add('visible');
                
                // Scroll suave
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Ajuste para el navbar fijo
                    behavior: 'smooth'
                });
            }
        });
    });

    // Verificar que los contenedores existen
    const timelineContainer = document.querySelector('.timeline-container');
    const galleryContainer = document.getElementById('galeria-container');
    const mapContainer = document.getElementById('map');
    const quizContainer = document.querySelector('.quiz-container');
    
    console.log('Contenedores encontrados:', {
        timeline: !!timelineContainer,
        gallery: !!galleryContainer,
        map: !!mapContainer,
        quiz: !!quizContainer
    });

    // Verificar que los scripts se cargaron
    console.log('Scripts cargados:', {
        timeline: typeof initTimeline !== 'undefined',
        gallery: typeof createGalleryItems !== 'undefined',
        map: typeof initMap !== 'undefined',
        quiz: typeof initQuiz !== 'undefined'
    });

    // Inicializar componentes
    if (typeof initTimeline === 'function') initTimeline();
    if (typeof createGalleryItems === 'function') createGalleryItems();
    if (typeof initMap === 'function') initMap();
});
