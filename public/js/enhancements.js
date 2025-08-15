// Funciones adicionales para mejorar la experiencia de usuario

// Función para efectos de sonido (DESHABILITADA)
function initSoundEffects() {
    // Sonidos deshabilitados por preferencia del usuario
    return;
}

// Funcionalidad del tema oscuro
function initThemeToggle() {
    console.log('Inicializando toggle de tema...');
    
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    console.log('Elementos encontrados:', { themeToggle, themeIcon, body });
    
    if (!themeToggle || !themeIcon) {
        console.error('No se encontraron los elementos del tema');
        return;
    }
    
    // Verificar el estado actual del tema
    const savedTheme = localStorage.getItem('theme');
    console.log('Tema guardado:', savedTheme);
    
    // Asegurar que el estado del icono coincida con el tema actual
    if (savedTheme === 'light') {
        // Modo claro: mostrar luna (para cambiar a oscuro)
        body.classList.remove('dark-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        console.log('Aplicando modo claro');
    } else {
        // Modo oscuro (por defecto): mostrar sol (para cambiar a claro)
        body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        // Asegurar que el tema oscuro esté guardado
        if (!savedTheme) {
            localStorage.setItem('theme', 'dark');
        }
        console.log('Aplicando modo oscuro');
    }
    
    // Event listener para el botón de tema
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Click en botón de tema detectado');
        
        body.classList.toggle('dark-theme');
        
        if (body.classList.contains('dark-theme')) {
            // Cambió a modo oscuro: mostrar sol (para cambiar a claro)
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
            console.log('Cambiado a modo oscuro');
        } else {
            // Cambió a modo claro: mostrar luna (para cambiar a oscuro)
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
            console.log('Cambiado a modo claro');
        }
        
        // Añadir efecto de transición suave
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    });
    
    console.log('Event listener agregado exitosamente');
}

// Función para crear efecto de cursor personalizado
function createCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div>';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Efecto en elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, .card, .btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
}

// Función para efecto de parallax mejorado
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });
}

// Función para lazy loading de imágenes
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Función para efectos de sonido (DESHABILITADA)
function initSoundEffects() {
    // Sonidos deshabilitados por preferencia del usuario
    return;
}

// Función para modo oscuro/claro
function initThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.className = 'theme-toggle btn btn-outline-secondary position-fixed';
    themeToggle.style.cssText = 'bottom: 20px; right: 20px; z-index: 1000; border-radius: 50%; width: 50px; height: 50px;';
    document.body.appendChild(themeToggle);

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        icon.className = document.body.classList.contains('dark-theme') ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// Función para efectos de partículas en el hero
function createParticleEffect() {
    const hero = document.querySelector('.hero-section');
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    hero.appendChild(particleContainer);

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particleContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 5000);
    }

    setInterval(createParticle, 300);
}

// Función para efectos de typing
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typewriter-text');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid var(--accent-color)';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i > text.length) {
                clearInterval(typeInterval);
                element.style.borderRight = 'none';
            }
        }, 100);
    });
}

// Función para smooth reveal de elementos
function initSmoothReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
}

// Función para mejorar la navegación con teclado
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        const sections = ['#inicio', '#timeline', '#mapa', '#galeria', '#quiz'];
        let currentSection = 0;

        // Navegación con flechas
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            currentSection = Math.min(currentSection + 1, sections.length - 1);
            document.querySelector(sections[currentSection])?.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            currentSection = Math.max(currentSection - 1, 0);
            document.querySelector(sections[currentSection])?.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Función para performance optimization
function optimizePerformance() {
    // Defer non-critical animations
    const deferredAnimations = document.querySelectorAll('.defer-animation');
    setTimeout(() => {
        deferredAnimations.forEach(el => el.classList.add('animate'));
    }, 1000);

    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });
}

// Inicializar todas las funciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar en desktop para mejor performance
    if (window.innerWidth > 768) {
        createCustomCursor();
        initParallaxEffect();
        createParticleEffect();
    }
    
    initLazyLoading();
    initThemeToggle();
    initTypingEffect();
    initSmoothReveal();
    initKeyboardNavigation();
    optimizePerformance();
    
    // Inicializar sonidos solo si el usuario interactúa
    let soundsInitialized = false;
    document.addEventListener('click', () => {
        if (!soundsInitialized) {
            initSoundEffects();
            soundsInitialized = true;
        }
    }, { once: true });
});

// Export para uso en otros scripts
window.HistoriaUtils = {
    createCustomCursor,
    initParallaxEffect,
    initLazyLoading,
    initSoundEffects,
    initThemeToggle,
    createParticleEffect,
    initTypingEffect,
    initSmoothReveal,
    initKeyboardNavigation,
    optimizePerformance
};

// Auto-inicializar el tema cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
    console.log('Enhancements.js cargado, inicializando tema...');
    initThemeToggle();
});
