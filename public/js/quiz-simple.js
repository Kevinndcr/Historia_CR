// Preguntas del quiz
const questions = [
    {
        question: "¿En qué año comenzó la Campaña Nacional?",
        options: ["1855", "1856", "1857", "1858"],
        correct: 1,
        image: "images/quiz/quiz1.jpg"
    },
    {
        question: "¿Quién fue el presidente de Costa Rica durante la Campaña Nacional?",
        options: ["Juan Rafael Mora Porras", "José María Castro Madriz", "Juan Mora Fernández", "Braulio Carrillo"],
        correct: 0,
        image: "images/quiz/quis.jpg"
    },
    {
        question: "¿Cuál fue la primera batalla importante de la Campaña Nacional?",
        options: ["Batalla de Rivas", "Batalla de Santa Rosa", "Batalla de San Juan del Sur", "Batalla de Granada"],
        correct: 1,
        image: "images/quiz/r23.jpg"
    },
    {
        question: "¿Quién fue el líder de los filibusteros?",
        options: ["William Walker", "Frederick Henningsen", "Charles Frederick Henningsen", "Byron Cole"],
        correct: 0,
        image: "images/quiz/sdffsadfsD.jpg"
    },
    {
        question: "¿En qué fecha se dio la Batalla de Rivas?",
        options: ["11 de abril de 1856", "20 de marzo de 1856", "15 de septiembre de 1856", "1 de mayo de 1857"],
        correct: 0,
        image: "images/quiz/quiz1.jpg"
    },
    {
        question: "¿Quién fue el héroe nacional que incendió el Mesón?",
        options: ["Juan Santamaría", "Juan Rafael Mora", "José María Cañas", "José Joaquín Mora"],
        correct: 0,
        image: "images/quiz/quis.jpg"
    },
    {
        question: "¿Qué país centroamericano fue invadido primero por William Walker?",
        options: ["Costa Rica", "Nicaragua", "El Salvador", "Honduras"],
        correct: 1,
        image: "images/quiz/r23.jpg"
    },
    {
        question: "¿Cuál fue el resultado final de la Campaña Nacional?",
        options: [
            "Victoria de las fuerzas centroamericanas",
            "Victoria de los filibusteros", 
            "Empate y tratado de paz",
            "Intervención de Estados Unidos"
        ],
        correct: 0,
        image: "images/quiz/sdffsadfsD.jpg"
    },
    {
        question: "¿Qué enfermedad afectó gravemente a las tropas durante la campaña?",
        options: ["El cólera", "La malaria", "La fiebre amarilla", "La tuberculosis"],
        correct: 0,
        image: "images/quiz/quiz1.jpg"
    },
    {
        question: "¿En qué año terminó la Campaña Nacional?",
        options: ["1856", "1857", "1858", "1859"],
        correct: 1,
        image: "images/quiz/quis.jpg"
    }
];

// Variables globales
let currentQuestion = 0;
let score = 0;
let playerName = '';
let startTime = null;
let totalTime = 0;
let db = null;

// Inicializar Firebase
function initializeFirebase() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
            db = firebase.firestore();
            console.log('🔥 Firebase inicializado correctamente');
        } catch (error) {
            console.warn('⚠️ Error inicializando Firebase:', error);
            db = null;
        }
    } else {
        console.log('💾 Firebase no está disponible, usando localStorage');
        db = null;
    }
}

// Función para formatear el tiempo
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Función para calcular la puntuación final
function calculateFinalScore(correctAnswers, timeInSeconds) {
    // Base: 100 puntos por respuesta correcta
    const baseScore = correctAnswers * 100;
   
    // Bonus por tiempo: máximo 50 puntos extra por pregunta
    // Se da el máximo bonus si responde en 15 segundos o menos por pregunta
    const expectedTime = questions.length * 15; // 15 segundos por pregunta
    const timeBonus = Math.max(0, Math.floor(50 * questions.length * (1 - timeInSeconds / (expectedTime * 2))));
   
    return {
        baseScore,
        timeBonus,
        totalScore: baseScore + timeBonus,
        timeInSeconds
    };
}

// Función para actualizar el podio en la página principal
async function updatePodiumDisplay() {
    const positions = ['first', 'second', 'third'];
    
    try {
        let topScores = [];
        
        if (db) {
            // Cargar desde Firebase
            console.log('🔥 Cargando podio desde Firebase...');
            const snapshot = await db.collection('leaderboard')
                .orderBy('totalScore', 'desc')
                .limit(3)
                .get();
            
            topScores = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    playerName: data.name,
                    score: data.totalScore,
                    timeInSeconds: data.timeInSeconds
                };
            });
            console.log('🏆 Datos del podio desde Firebase:', topScores);
        } else {
            // Fallback a localStorage
            console.log('💾 Cargando podio desde localStorage...');
            const localScores = JSON.parse(localStorage.getItem('quizScores') || '[]');
            topScores = localScores
                .sort((a, b) => {
                    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                    return a.timeInSeconds - b.timeInSeconds;
                })
                .slice(0, 3);
            console.log('🏆 Datos del podio desde localStorage:', topScores);
        }
        
        positions.forEach((position, index) => {
            const nameElement = document.getElementById(`${position}-place-name`);
            const scoreElement = document.getElementById(`${position}-place-score`);
            const timeElement = document.getElementById(`${position}-place-time`);
            
            console.log(`🔍 Actualizando ${position} lugar - Elementos:`, {
                name: nameElement ? 'OK' : 'FALTA',
                score: scoreElement ? 'OK' : 'FALTA',
                time: timeElement ? 'OK' : 'FALTA'
            });
            
            if (nameElement && scoreElement && timeElement) {
                const playerData = topScores[index];
                
                if (playerData) {
                    nameElement.textContent = playerData.playerName || 'Jugador';
                    scoreElement.textContent = `${playerData.score} pts`;
                    timeElement.textContent = formatTime(playerData.timeInSeconds);
                    
                    console.log(`✅ ${position} lugar actualizado:`, {
                        nombre: nameElement.textContent,
                        puntaje: scoreElement.textContent,
                        tiempo: timeElement.textContent
                    });
                    
                    // Animación de entrada
                    nameElement.style.opacity = '1';
                    scoreElement.style.opacity = '1';
                    timeElement.style.opacity = '1';
                } else {
                    nameElement.textContent = '---';
                    scoreElement.textContent = '--- pts';
                    timeElement.textContent = '--:--';
                    
                    nameElement.style.opacity = '0.5';
                    scoreElement.style.opacity = '0.5';
                    timeElement.style.opacity = '0.5';
                    
                    console.log(`➖ ${position} lugar vacío`);
                }
            } else {
                console.error(`❌ Elementos faltantes para ${position} lugar`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error actualizando podio:', error);
    }
}

// Función para actualizar el leaderboard
async function updateLeaderboard(targetId = 'leaderboardBody', limit = null) {
    const leaderboardBody = document.getElementById(targetId);
    if (!leaderboardBody) return;

    try {
        let scores = [];
        
        if (db) {
            let query = db.collection('leaderboard')
                .orderBy('totalScore', 'desc');
           
            if (limit) {
                query = query.limit(limit);
            }

            const snapshot = await query.get();

            if (snapshot.empty) {
                leaderboardBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">Aún no hay puntuaciones registradas</td>
                    </tr>
                `;
                return;
            }

            scores = snapshot.docs.map(doc => doc.data());
        } else {
            // Fallback a localStorage
            scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
            scores.sort((a, b) => {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                return a.timeInSeconds - b.timeInSeconds;
            });
            
            if (limit) {
                scores = scores.slice(0, limit);
            }
        }

        const html = scores.map((data, index) => {
            const showMedal = index < 3;
            return `
                <tr class="${index === 0 ? 'table-warning' : ''} ${index === 1 ? 'table-light' : ''} ${index === 2 ? 'table-secondary' : ''}">
                    <td>${index + 1}${showMedal ? (index === 0 ? ' 🥇' : index === 1 ? ' 🥈' : ' 🥉') : ''}</td>
                    <td>${data.name}</td>
                    <td>${data.totalScore}</td>
                    <td>${formatTime(data.timeInSeconds)}</td>
                </tr>
            `;
        }).join('');

        leaderboardBody.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar el podio:', error);
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">Error al cargar las puntuaciones</td>
            </tr>
        `;
    }
}

// Función para mostrar el formulario de nombre
function showNameForm() {
    const quizContainer = document.querySelector('.quiz-container');
   
    const html = `
        <div class="card shadow-sm">
            <div class="card-body text-center">
                <h4 class="mb-4">¡Bienvenido al Quiz!</h4>
                <p class="mb-3">Ingresa tu nombre para comenzar:</p>
                <form id="nameForm" class="mb-4">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="playerNameInput"
                               placeholder="Tu nombre" required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        Comenzar Quiz
                    </button>
                </form>
                <div id="miniLeaderboard">
                    <h5 class="mb-3">🏆 Top 3 Mejores Puntajes 🏆</h5>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Nombre</th>
                                    <th>Puntuación</th>
                                    <th>Tiempo</th>
                                </tr>
                            </thead>
                            <tbody id="miniLeaderboardBody">
                                <tr>
                                    <td colspan="4">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="text-center mt-3">
                        <a href="#podio" class="btn btn-outline-primary btn-sm">
                            Ver historial completo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    quizContainer.innerHTML = html;
   
    document.getElementById('nameForm').addEventListener('submit', (e) => {
        e.preventDefault();
        playerName = document.getElementById('playerNameInput').value.trim();
        if (playerName) {
            startTime = Date.now();
            showQuestion();
        }
    });
   
    updateLeaderboard('miniLeaderboardBody', 3);
}

// Función para mostrar el podio independiente
function showStandaloneLeaderboard() {
    const leaderboardContainer = document.querySelector('.leaderboard-container');
    if (!leaderboardContainer) return;

    const html = `
        <div class="card shadow-sm">
            <div class="card-body">
                <h5 class="card-title text-center mb-4">Historial de Participaciones</h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Posición</th>
                                <th>Nombre</th>
                                <th>Puntuación</th>
                                <th>Tiempo</th>
                            </tr>
                        </thead>
                        <tbody id="standaloneLeaderboardBody">
                            <tr>
                                <td colspan="4">Cargando...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    leaderboardContainer.innerHTML = html;
    updateLeaderboard('standaloneLeaderboardBody');
}

// Función para mostrar el formulario del quiz desde el podio
function showQuizForm() {
    window.location.href = '#quiz';
    currentQuestion = 0;
    score = 0;
    startTime = null;
    showNameForm();
}

// Función para guardar el puntaje
async function saveScore(name, scoreData) {
    try {
        if (db) {
            // Guardar en Firebase
            console.log('🔥 Guardando en Firebase:', { name, ...scoreData });
            await db.collection('leaderboard').add({
                name: name,
                ...scoreData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Guardado en Firebase exitoso');
        } else {
            // Guardar en localStorage
            console.log('💾 Guardando en localStorage:', { name, ...scoreData });
            const existingScores = JSON.parse(localStorage.getItem('quizScores') || '[]');
            existingScores.push({
                name: name,
                ...scoreData,
                timestamp: Date.now()
            });
            localStorage.setItem('quizScores', JSON.stringify(existingScores));
            console.log('✅ Guardado en localStorage exitoso');
        }
        return true;
    } catch (error) {
        console.error('❌ Error al guardar la puntuación:', error);
        return false;
    }
}

function showQuestion() {
    const quizContainer = document.querySelector('.quiz-container');
    const question = questions[currentQuestion];
    const progressPercentage = (currentQuestion / questions.length) * 100;
    const currentTime = Math.floor((Date.now() - startTime) / 1000);

    const html = `
        <div class="quiz-question card shadow-sm">
            <img src="${question.image}" class="card-img-top quiz-image" alt="Imagen de la pregunta">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="progress flex-grow-1 me-3" style="height: 10px;">
                        <div class="progress-bar" role="progressbar" style="width: ${progressPercentage}%"
                             aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div class="badge bg-primary">⏱️ ${formatTime(currentTime)}</div>
                </div>
                <h5 class="card-title mb-4">${question.question}</h5>
                <div class="quiz-options d-grid gap-2">
                    ${question.options.map((option, index) => `
                        <button class="btn btn-outline-primary quiz-option" onclick="checkAnswer(${index})">
                            ${option}
                        </button>
                    `).join('')}
                </div>
                <div class="mt-3 text-muted">
                    Pregunta ${currentQuestion + 1} de ${questions.length}
                </div>
            </div>
        </div>
    `;

    quizContainer.innerHTML = html;
   
    // Actualizar el tiempo cada segundo
    const timer = setInterval(() => {
        const timeDisplay = document.querySelector('.badge.bg-primary');
        if (timeDisplay) {
            const currentTime = Math.floor((Date.now() - startTime) / 1000);
            timeDisplay.textContent = `⏱️ ${formatTime(currentTime)}`;
        } else {
            clearInterval(timer);
        }
    }, 1000);
}

function checkAnswer(selectedIndex) {
    const question = questions[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');

    // Deshabilitar todos los botones
    options.forEach(button => button.disabled = true);

    // Mostrar respuesta correcta e incorrecta
    options[question.correct].classList.remove('btn-outline-primary');
    options[question.correct].classList.add('btn-success');

    if (selectedIndex !== question.correct) {
        options[selectedIndex].classList.remove('btn-outline-primary');
        options[selectedIndex].classList.add('btn-danger');
    } else {
        score++;
    }

    // Esperar 1.5 segundos antes de mostrar la siguiente pregunta
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

async function showResults() {
    const quizContainer = document.querySelector('.quiz-container');
    totalTime = Math.floor((Date.now() - startTime) / 1000);
   
    const scoreData = calculateFinalScore(score, totalTime);
    const madeLeaderboard = await saveScore(playerName, {
        correctAnswers: score,
        timeInSeconds: totalTime,
        ...scoreData
    });
   
    const html = `
        <div class="card shadow-sm">
            <div class="card-body text-center">
                <h4 class="mb-4">Resultados del Quiz</h4>
                <p class="mb-3">¡Gracias por participar, ${playerName}!</p>
               
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2">Respuestas Correctas</h6>
                                <h4 class="card-title mb-0">${score}/${questions.length}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2">Tiempo Total</h6>
                                <h4 class="card-title mb-0">⏱️ ${formatTime(totalTime)}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2">Puntuación Final</h6>
                                <h4 class="card-title mb-0">${scoreData.totalScore}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="alert alert-info mb-4">
                    <p class="mb-1">Desglose de puntuación:</p>
                    <ul class="list-unstyled mb-0">
                        <li>Base: ${scoreData.baseScore} (${score} respuestas correctas)</li>
                        <li>Bonus por tiempo: +${scoreData.timeBonus}</li>
                    </ul>
                </div>

                ${madeLeaderboard ?
                    '<div class="alert alert-success mb-4">¡Felicitaciones! Tu puntuación ha sido guardada 🏆</div>' :
                    '<div class="text-muted mb-4">Sigue intentando para mejorar tu puntuación</div>'
                }

                <div id="leaderboard" class="mb-4">
                    <h5 class="mb-3">Top 3 Mejores Puntajes</h5>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Nombre</th>
                                    <th>Puntuación</th>
                                    <th>Tiempo</th>
                                </tr>
                            </thead>
                            <tbody id="leaderboardBody">
                                <tr>
                                    <td colspan="4">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="d-grid">
                    <button class="btn btn-primary" onclick="resetQuiz()">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        </div>
    `;

    quizContainer.innerHTML = html;
    updateLeaderboard('leaderboardBody', 3);
    
    // Actualizar el podio principal después de guardar el puntaje
    setTimeout(() => {
        updatePodiumDisplay();
    }, 1000);
}

function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    startTime = null;
    showNameForm();
}

// Función para refrescar el podio manualmente
function refreshPodium() {
    console.log('🔄 Refrescando podio manualmente...');
    updatePodiumDisplay();
}

// Función para agregar datos de prueba
function addTestData() {
    if (!localStorage.getItem('quizScores')) {
        console.log('🧪 Agregando datos de prueba...');
        const testScores = [
            {
                name: 'Juan Pérez',
                baseScore: 900,
                timeBonus: 150,
                totalScore: 1050,
                timeInSeconds: 180,
                correctAnswers: 9,
                timestamp: Date.now() - 86400000
            },
            {
                name: 'María González',
                baseScore: 800,
                timeBonus: 80,
                totalScore: 880,
                timeInSeconds: 210,
                correctAnswers: 8,
                timestamp: Date.now() - 43200000
            },
            {
                name: 'Carlos Rodríguez',
                baseScore: 700,
                timeBonus: 120,
                totalScore: 820,
                timeInSeconds: 195,
                correctAnswers: 7,
                timestamp: Date.now() - 3600000
            }
        ];
        
        localStorage.setItem('quizScores', JSON.stringify(testScores));
        console.log('✅ Datos de prueba agregados');
    }
}

// Inicializar cuando se carga el documento
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando sistema de quiz...');
    
    // Inicializar Firebase
    initializeFirebase();
    
    // Agregar datos de prueba si no hay Firebase
    if (!db) {
        addTestData();
    }
    
    // Inicializar el quiz si estamos en la sección correspondiente
    if (document.querySelector('.quiz-container')) {
        showNameForm();
    }
    
    // Inicializar el leaderboard independiente
    if (document.querySelector('.leaderboard-container')) {
        showStandaloneLeaderboard();
    }
    
    // Actualizar el podio principal
    setTimeout(() => {
        updatePodiumDisplay();
    }, 500);
    
    // Configurar el botón de refresh del podio si existe
    const refreshButton = document.getElementById('refresh-podium');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshPodium);
    }
   
    // Actualizar el podio cada 30 segundos
    setInterval(() => {
        updatePodiumDisplay();
        updateLeaderboard('standaloneLeaderboardBody');
        const miniLeaderboardBody = document.getElementById('miniLeaderboardBody');
        if (miniLeaderboardBody) {
            updateLeaderboard('miniLeaderboardBody', 3);
        }
    }, 30000);
});

// Hacer las funciones disponibles globalmente
window.showQuizForm = showQuizForm;
window.checkAnswer = checkAnswer;
window.resetQuiz = resetQuiz;
window.refreshPodium = refreshPodium;
