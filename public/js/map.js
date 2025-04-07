function initMap() {
    // Centrar el mapa en Costa Rica
    const map = L.map('map').setView([10.2, -84.5], 8);

    // Añadir capa de OpenStreetMap con estilo más moderno
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    // Puntos históricos importantes con detalles
    const historicalPoints = [
        {
            name: "San José",
            coords: [9.9281, -84.0907],
            description: `<div class="map-popup">
                <h4>San José - Punto de Partida</h4>
                <p>El 4 de marzo de 1856, el Presidente Juan Rafael Mora Porras hace un llamado a las armas desde San José. 
                Aquí se organizó el ejército expedicionario que marcharía hacia el norte.</p>
                <img src="images/lugares/san-jose-1856.jpg" alt="San José 1856" class="popup-img">
            </div>`
        },
        {
            name: "Liberia",
            coords: [10.6333, -85.4333],
            description: `<div class="map-popup">
                <h4>Liberia - Punto de Concentración</h4>
                <p>Las tropas costarricenses se concentraron en Liberia antes de marchar hacia Santa Rosa. 
                Esta ciudad fue crucial como centro de operaciones en Guanacaste.</p>
                <img src="images/lugares/liberia-antigua.jpg" alt="Liberia" class="popup-img">
            </div>`
        },
        {
            name: "Hacienda Santa Rosa",
            coords: [10.8375, -85.6179],
            description: `<div class="map-popup">
                <h4>Batalla de Santa Rosa - 20 de marzo de 1856</h4>
                <p>Primera victoria decisiva de Costa Rica. En solo 14 minutos, las tropas costarricenses 
                expulsaron a los filibusteros de la Casona histórica. Esta batalla demostró la determinación 
                del ejército costarricense.</p>
                <img src="images/lugares/casona-santa-rosa.jpg" alt="Casona Santa Rosa" class="popup-img">
            </div>`
        },
        {
            name: "Rivas",
            coords: [11.4419, -85.8375],
            description: `<div class="map-popup">
                <h4>Batalla de Rivas - 11 de abril de 1856</h4>
                <p>Batalla crucial donde Juan Santamaría, un soldado del ejército costarricense, realizó su acto heroico 
                al incendiar el Mesón donde se refugiaban los filibusteros, a costa de su propia vida. Esta acción fue 
                determinante para la victoria.</p>
                <img src="images/lugares/meson-rivas.jpg" alt="Mesón de Rivas" class="popup-img">
            </div>`
        },
        {
            name: "La Trinidad",
            coords: [11.1667, -85.7500],
            description: `<div class="map-popup">
                <h4>Punto Estratégico - La Trinidad</h4>
                <p>Ubicación estratégica en la ruta hacia Nicaragua. Las tropas costarricenses utilizaron este punto 
                como lugar de descanso y reabastecimiento.</p>
                <img src="images/lugares/trinida.jpg" alt="La Trinidad" class="popup-img">
            </div>`
        }
    ];

    // Rutas de la campaña con descripción
    const campaignRoutes = [
        {
            path: [
                [9.9281, -84.0907], // San José
                [10.6333, -85.4333], // Liberia
                [10.8375, -85.6179], // Santa Rosa
                [11.4419, -85.8375]  // Rivas
            ],
            description: "Ruta principal del ejército"
        },
        {
            path: [
                [10.6333, -85.4333], // Liberia
                [11.1667, -85.7500], // La Trinidad
                [11.4419, -85.8375]  // Rivas
            ],
            description: "Ruta de abastecimiento"
        }
    ];

    // Estilo personalizado para los popups
    const customPopup = {
        'maxWidth': '500',
        'className': 'custom-popup'
    };

    // Añadir marcadores y popups
    historicalPoints.forEach(point => {
        L.marker(point.coords)
            .bindPopup(point.description, customPopup)
            .addTo(map);
    });

    // Dibujar las rutas con diferentes estilos
    campaignRoutes.forEach((route, index) => {
        const color = index === 0 ? '#e74c3c' : '#3498db';
        L.polyline(route.path, {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: index === 1 ? '10, 10' : null
        })
        .bindPopup(route.description)
        .addTo(map);
    });

    // Añadir leyenda
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
            <div class="legend-item">
                <hr style="border-color: #e74c3c">
                <span>Ruta principal</span>
            </div>
            <div class="legend-item">
                <hr style="border-color: #3498db; border-style: dashed">
                <span>Ruta de abastecimiento</span>
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}

document.addEventListener('DOMContentLoaded', () => {
    // Cargar el mapa cuando la sección sea visible
    const mapSection = document.getElementById('mapa');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initMap();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(mapSection);
});
