// Datos de la galería
const galleryData = [
    {
        category: 'personajes',
        items: [
            {
                id: 'mora-porras',
                title: 'Juan Rafael Mora Porras',
                description: 'Presidente de Costa Rica durante la Campaña Nacional. Lideró al país en su lucha contra los filibusteros.',
                imageUrl: 'images/personajes/mora-porras.jpg',
                date: '1856'
            },
            {
                id: 'juan-santamaria',
                title: 'Juan Santamaría',
                description: 'Héroe nacional que sacrificó su vida incendiando el Mesón de Rivas el 11 de abril de 1856.',
                imageUrl: 'images/personajes/juan-santamaria.jpg',
                date: '1856'
            },
            {
                id: 'william-walker',
                title: 'William Walker',
                description: 'Filibustero estadounidense que intentó conquistar Centroamérica para establecer un imperio esclavista.',
                imageUrl: 'images/personajes/william-walker.jpg',
                date: '1856'
            }
        ]
    },
    {
        category: 'batallas',
        items: [
            {
                id: 'batalla-santa-rosa',
                title: 'Batalla de Santa Rosa',
                description: 'Primera victoria del ejército costarricense contra los filibusteros el 20 de marzo de 1856.',
                imageUrl: 'images/batallas/batalla-santa-rosa.jpg',
                date: '20 de marzo, 1856'
            },
            {
                id: 'batalla-rivas',
                title: 'Batalla de Rivas',
                description: 'Batalla decisiva donde Juan Santamaría realizó su acto heroico el 11 de abril de 1856.',
                imageUrl: 'images/batallas/batalla-rivas.jpg',
                date: '11 de abril, 1856'
            }
        ]
    },
    {
        category: 'lugares',
        items: [
            {
                id: 'casona-santa-rosa',
                title: 'Casona de Santa Rosa',
                description: 'Escenario de la histórica batalla del 20 de marzo de 1856.',
                imageUrl: 'images/lugares/casona-santa-rosa.jpg',
                date: '1856'
            },
            {
                id: 'meson-rivas',
                title: 'Mesón de Rivas',
                description: 'Edificio estratégico en Rivas, Nicaragua, donde se desarrolló parte crucial de la batalla.',
                imageUrl: 'images/lugares/meson-rivas.jpg',
                date: '1856'
            },
            {
                id: 'san-jose-1856',
                title: 'San José en 1856',
                description: 'Vista de la capital costarricense durante la época de la Campaña Nacional.',
                imageUrl: 'images/lugares/san-jose-1856.jpg',
                date: '1856'
            }
        ]
    }
];

// Función para crear los elementos de la galería
function createGalleryItems() {
    console.log('Iniciando creación de galería...');
    const container = document.getElementById('galeria-container');
    
    if (!container) {
        console.error('No se encontró el contenedor de la galería');
        return;
    }

    // Limpiar el contenedor primero
    container.innerHTML = '';
    
    galleryData.forEach(category => {
        console.log('Procesando categoría:', category.category);
        
        // Crear encabezado de categoría
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section mb-5';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'col-12 mb-4 mt-4 text-center';
        categoryTitle.textContent = category.category.charAt(0).toUpperCase() + category.category.slice(1);
        categorySection.appendChild(categoryTitle);

        // Crear contenedor de fila para los items
        const row = document.createElement('div');
        row.className = 'row justify-content-center';
        categorySection.appendChild(row);

        // Crear items de la categoría
        category.items.forEach(item => {
            console.log('Creando item:', item.title);
            
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.setAttribute('data-aos', 'fade-up');

            col.innerHTML = `
                <div class="gallery-item card h-100 shadow-sm">
                    <div class="card-img-container" style="height: 250px; overflow: hidden;">
                        <img src="${item.imageUrl}" alt="${item.title}" 
                             class="card-img-top h-100 w-100" style="object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/400x300?text=Imagen+Pendiente'">
                    </div>
                    <div class="card-body">
                        <h4 class="card-title">${item.title}</h4>
                        <p class="card-subtitle text-muted mb-2">${item.date}</p>
                        <p class="card-text">${item.description}</p>
                    </div>
                </div>
            `;

            row.appendChild(col);
        });

        container.appendChild(categorySection);
    });

    console.log('Galería inicializada correctamente');
}

// Asegurarse de que el script se está ejecutando
console.log('Script de galería cargado');

// Inicializar la galería cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando galería...');
    createGalleryItems();
});
