const timelineData = [
    {
        date: "1855",
        title: "Inicio de la amenaza filibustera",
        description: "William Walker y sus filibusteros toman el control de Nicaragua.",
        image: "images/batallas/nica.jpg"
    },
    {
        date: "20 de marzo, 1856",
        title: "Primera Campaña Nacional",
        description: "Costa Rica le declara la guerra a los filibusteros. El presidente Juan Rafael Mora Porras hace un llamado a las armas.",
        image: "images/liberia-antigua.jpg"
    },
    {
        date: "20 de marzo, 1856",
        title: "Batalla de Santa Rosa",
        description: "Primera victoria costarricense contra los filibusteros en suelo nacional.",
        image: "images/batallas/batalla-santa-rosa.jpg"
    },
    {
        date: "11 de abril, 1856",
        title: "Batalla de Rivas",
        description: "Juan Santamaría sacrifica su vida por la patria al incendiar el Mesón donde se refugiaban los filibusteros.",
        image: "images/batallas/batalla-rivas.jpg"
    },
    {
        date: "1857",
        title: "Victoria Final",
        description: "Los filibusteros son expulsados de Centroamérica. Walker se rinde el 1 de mayo.",
        image: "images/lugares/meson-rivas.jpg"
    }
];

function createTimelineItem(item) {
    return `
        <div class="timeline-item">
            <div class="timeline-content">
                <div class="timeline-date">${item.date}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <img src="${item.image}" alt="${item.title}" class="timeline-image">
            </div>
        </div>
    `;
}

function initTimeline() {
    console.log('Inicializando línea de tiempo...');
    const container = document.querySelector('.timeline-container');
    
    if (!container) {
        console.error('No se encontró el contenedor de la línea de tiempo');
        return;
    }

    // Limpiar el contenedor
    container.innerHTML = '';

    // Crear y agregar los elementos del timeline
    const timelineHTML = timelineData.map(createTimelineItem).join('');
    container.innerHTML = timelineHTML;

    console.log('Línea de tiempo inicializada correctamente');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initTimeline);
