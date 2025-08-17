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
    // Buscar el contenedor correcto
    let quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) {
        quizContainer = document.querySelector('.quiz-container-modern');
    }
    
    if (!quizContainer) {
        console.error('❌ No se encontró contenedor de quiz');
        return;
    }
    
    const question = questions[currentQuestion];
    const progressPercentage = (currentQuestion / questions.length) * 100;
    const currentTime = Math.floor((Date.now() - startTime) / 1000);

    const html = `
        <div class="quiz-question-modern">
            <!-- Header del Quiz -->
            <div class="quiz-header">
                <div class="quiz-progress-container">
                    <div class="quiz-progress-bar">
                        <div class="quiz-progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="quiz-progress-text">Pregunta ${currentQuestion + 1} de ${questions.length}</div>
                </div>
                <div class="quiz-timer">
                    <i class="fas fa-clock"></i>
                    <span id="timer-display">${formatTime(currentTime)}</span>
                </div>
            </div>

            <!-- Imagen de la Pregunta -->
            <div class="quiz-image-container">
                <img src="${question.image}" class="quiz-image-modern" alt="Imagen de la pregunta">
                <div class="quiz-image-overlay"></div>
            </div>

            <!-- Pregunta -->
            <div class="quiz-question-container">
                <h2 class="quiz-question-title">${question.question}</h2>
            </div>

            <!-- Opciones de Respuesta -->
            <div class="quiz-options-modern">
                ${question.options.map((option, index) => `
                    <button class="quiz-option-modern" onclick="checkAnswer(${index})" data-option="${index}">
                        <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                        <div class="option-text">${option}</div>
                        <div class="option-indicator"></div>
                    </button>
                `).join('')}
            </div>

            <!-- Footer con Info -->
            <div class="quiz-footer">
                <div class="quiz-player-info">
                    <i class="fas fa-user"></i>
                    <span>${playerName}</span>
                </div>
                <div class="quiz-score-info">
                    <i class="fas fa-star"></i>
                    <span>${score} correctas</span>
                </div>
            </div>
        </div>

        <style>
        .quiz-question-modern {
            width: 95%;
            max-width: 1100px;
            margin: 0 auto;
            background: linear-gradient(135deg, #2c1810 0%, #8B4513 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            color: #f4e4c1;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 350px;
        }

        .quiz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 35px;
            background: rgba(244,228,193,0.1);
            backdrop-filter: blur(10px);
        }

        .quiz-progress-container {
            flex: 1;
            margin-right: 30px;
        }

        .quiz-progress-bar {
            width: 100%;
            height: 10px;
            background: rgba(139,69,19,0.3);
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .quiz-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff8c00, #ffa500);
            border-radius: 5px;
            transition: width 0.3s ease;
        }

        .quiz-progress-text {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 500;
        }

        .quiz-timer {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255,140,0,0.2);
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            border: 1px solid rgba(255,165,0,0.3);
            font-size: 16px;
        }

        .quiz-image-container {
            position: relative;
            height: 150px;
            overflow: hidden;
        }

        .quiz-image-modern {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .quiz-image-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(transparent, rgba(44,24,16,0.8));
        }

        .quiz-question-container {
            padding: 20px 35px;
            text-align: center;
        }

        .quiz-question-title {
            font-size: 26px;
            font-weight: 700;
            line-height: 1.4;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            color: #ffa500;
            max-width: none;
            margin: 0;
        }

        .quiz-options-modern {
            padding: 0 35px 20px;
            display: grid;
            gap: 12px;
            max-width: none;
            margin: 0;
        }

        .quiz-option-modern {
            display: flex;
            align-items: center;
            padding: 15px 25px;
            background: rgba(244,228,193,0.95);
            color: #2c1810;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
            min-height: 50px;
        }

        .quiz-option-modern:hover {
            background: rgba(244,228,193,1);
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(255,140,0,0.3);
            border-color: #ff8c00;
        }

        .option-letter {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #ff8c00, #ffa500);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            margin-right: 20px;
            flex-shrink: 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .option-text {
            flex: 1;
            text-align: left;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.4;
        }

        .option-indicator {
            width: 20px;
            height: 20px;
            border: 2px solid #8B4513;
            border-radius: 50%;
            margin-left: 15px;
            transition: all 0.3s ease;
        }

        .quiz-option-modern:hover .option-indicator {
            border-color: #ff8c00;
            background: #ff8c00;
        }

        .quiz-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 35px;
            background: rgba(0,0,0,0.3);
            font-size: 14px;
        }

        .quiz-player-info, .quiz-score-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        }

        /* Animaciones para respuestas */
        .quiz-option-modern.correct {
            background: linear-gradient(135deg, #228B22, #32CD32) !important;
            color: white !important;
            transform: scale(1.02);
            border-color: #228B22 !important;
        }

        .quiz-option-modern.correct .option-letter {
            background: rgba(255,255,255,0.3);
        }

        .quiz-option-modern.incorrect {
            background: linear-gradient(135deg, #DC143C, #FF6347) !important;
            color: white !important;
            transform: scale(0.98);
            border-color: #DC143C !important;
        }

        .quiz-option-modern.incorrect .option-letter {
            background: rgba(255,255,255,0.3);
        }

        .quiz-option-modern:disabled {
            cursor: not-allowed;
        }

        @media (max-width: 1024px) {
            .quiz-question-modern {
                margin: 10px;
                border-radius: 15px;
            }
            
            .quiz-header {
                padding: 25px 40px;
            }
            
            .quiz-question-container {
                padding: 35px 40px;
            }
            
            .quiz-options-modern {
                padding: 0 40px 35px;
            }
            
            .quiz-footer {
                padding: 25px 40px;
            }
        }

        @media (max-width: 768px) {
            .quiz-question-modern {
                margin: 10px;
                border-radius: 15px;
                max-width: none;
            }
            
            .quiz-header {
                padding: 20px 25px;
                flex-direction: column;
                gap: 15px;
            }
            
            .quiz-progress-container {
                margin-right: 0;
                width: 100%;
            }
            
            .quiz-question-container {
                padding: 25px 30px;
            }
            
            .quiz-question-title {
                font-size: 22px;
            }
            
            .quiz-options-modern {
                padding: 0 25px 25px;
                gap: 15px;
            }
            
            .quiz-option-modern {
                padding: 18px 20px;
                min-height: 60px;
            }
            
            .option-letter {
                width: 40px;
                height: 40px;
                font-size: 16px;
                margin-right: 20px;
            }
            
            .option-text {
                font-size: 16px;
            }
            
            .quiz-footer {
                padding: 20px 25px;
                font-size: 14px;
            }
        }
        </style>
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
    const options = document.querySelectorAll('.quiz-option-modern');

    // Deshabilitar todos los botones
    options.forEach(button => {
        button.disabled = true;
        button.style.cursor = 'not-allowed';
    });

    // Mostrar respuesta correcta
    options[question.correct].classList.add('correct');

    // Si la respuesta es incorrecta, mostrarla
    if (selectedIndex !== question.correct) {
        options[selectedIndex].classList.add('incorrect');
    } else {
        score++;
        // Efecto de celebración para respuesta correcta
        options[selectedIndex].style.animation = 'pulse 0.6s ease-in-out';
    }

    // Actualizar el contador de respuestas correctas en tiempo real
    const scoreInfo = document.querySelector('.quiz-score-info span');
    if (scoreInfo) {
        scoreInfo.textContent = `${score} correctas`;
    }

    // Esperar 2 segundos antes de mostrar la siguiente pregunta
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 2000);
}

function showResults() {
    // Buscar el contenedor correcto
    let quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) {
        quizContainer = document.querySelector('.quiz-container-modern');
    }
    
    if (!quizContainer) {
        console.error('❌ No se encontró contenedor de quiz');
        return;
    }
    
    totalTime = Math.floor((Date.now() - startTime) / 1000);
    const percentage = Math.round((score / questions.length) * 100);
   
    const html = `
        <div class="quiz-results-modern">
            <!-- Header de Resultados -->
            <div class="results-header">
                <div class="results-icon">
                    ${percentage >= 70 ? '🏆' : percentage >= 50 ? '👍' : '📚'}
                </div>
                <h1 class="results-title">¡Quiz Completado!</h1>
                <p class="results-subtitle">¡Gracias por participar, <strong>${playerName}</strong>!</p>
            </div>

            <!-- Estadísticas Principales -->
            <div class="results-stats">
                <div class="stat-card primary">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <div class="stat-number">${score}/${questions.length}</div>
                        <div class="stat-label">Respuestas Correctas</div>
                        <div class="stat-percentage">${percentage}% de aciertos</div>
                    </div>
                </div>
                
                <div class="stat-card secondary">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-content">
                        <div class="stat-number">${formatTime(totalTime)}</div>
                        <div class="stat-label">Tiempo Total</div>
                        <div class="stat-detail">${Math.round(totalTime/questions.length)}s por pregunta</div>
                    </div>
                </div>
            </div>

            <!-- Mensaje de Evaluación -->
            <div class="results-evaluation ${percentage >= 70 ? 'excellent' : percentage >= 50 ? 'good' : 'needs-improvement'}">
                <div class="evaluation-content">
                    ${percentage >= 70 ? 
                        '<h3>¡Excelente conocimiento! 🌟</h3><p>Dominas muy bien la historia costarricense. ¡Felicitaciones!</p>' : 
                        percentage >= 50 ? 
                        '<h3>¡Buen trabajo! 💪</h3><p>Tienes una base sólida, pero puedes mejorar un poco más.</p>' : 
                        '<h3>¡Sigue estudiando! 📖</h3><p>La historia es fascinante. ¡No te rindas y vuelve a intentarlo!</p>'
                    }
                </div>
            </div>

            <!-- Botones de Acción -->
            <div class="results-actions">
                <button onclick="resetQuiz()" class="action-btn primary">
                    <i class="fas fa-redo"></i>
                    Intentar de Nuevo
                </button>
                <button onclick="window.location.reload()" class="action-btn secondary">
                    <i class="fas fa-home"></i>
                    Volver al Inicio
                </button>
            </div>
        </div>

        <style>
        .quiz-results-modern {
            max-width: 800px;
            margin: 0 auto;
            background: linear-gradient(135deg, #2c1810 0%, #8B4513 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            color: #f4e4c1;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .results-header {
            text-align: center;
            padding: 40px 30px 30px;
            background: rgba(244,228,193,0.1);
            backdrop-filter: blur(10px);
        }

        .results-icon {
            font-size: 60px;
            margin-bottom: 20px;
            animation: bounce 1s ease-in-out;
        }

        .results-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 10px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            color: #ffa500;
        }

        .results-subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin: 0;
        }

        .results-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 30px;
        }

        .stat-card {
            background: rgba(244,228,193,0.15);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,165,0,0.2);
        }

        .stat-card.primary {
            background: linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,165,0,0.2));
        }

        .stat-card.secondary {
            background: linear-gradient(135deg, rgba(139,69,19,0.2), rgba(160,82,45,0.2));
        }

        .stat-icon {
            font-size: 24px;
            margin-bottom: 15px;
        }

        .stat-number {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
            color: #ffa500;
        }

        .stat-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
        }

        .stat-percentage, .stat-detail {
            font-size: 12px;
            opacity: 0.8;
        }

        .results-evaluation {
            margin: 20px 30px;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
        }

        .results-evaluation.excellent {
            background: linear-gradient(135deg, rgba(34,139,34,0.2), rgba(50,205,50,0.2));
            border: 1px solid rgba(34,139,34,0.3);
        }

        .results-evaluation.good {
            background: linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,165,0,0.2));
            border: 1px solid rgba(255,140,0,0.3);
        }

        .results-evaluation.needs-improvement {
            background: linear-gradient(135deg, rgba(139,69,19,0.2), rgba(160,82,45,0.2));
            border: 1px solid rgba(139,69,19,0.3);
        }

        .evaluation-content h3 {
            margin: 0 0 10px 0;
            font-size: 20px;
            color: #ffa500;
        }

        .evaluation-content p {
            margin: 0;
            opacity: 0.9;
        }

        .results-actions {
            padding: 30px;
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .action-btn {
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .action-btn.primary {
            background: linear-gradient(135deg, #ff8c00, #ffa500);
            color: white;
            box-shadow: 0 4px 15px rgba(255,140,0,0.3);
        }

        .action-btn.secondary {
            background: rgba(244,228,193,0.2);
            color: #f4e4c1;
            border: 1px solid rgba(244,228,193,0.3);
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255,140,0,0.4);
        }

        .action-btn.primary:hover {
            background: linear-gradient(135deg, #ffa500, #ff8c00);
        }

        .action-btn.secondary:hover {
            background: rgba(244,228,193,0.3);
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        @media (max-width: 768px) {
            .quiz-results-modern {
                margin: 10px;
                border-radius: 15px;
            }
            
            .results-header {
                padding: 30px 20px 20px;
            }
            
            .results-title {
                font-size: 24px;
            }
            
            .results-stats {
                grid-template-columns: 1fr;
                padding: 20px;
                gap: 15px;
            }
            
            .results-actions {
                flex-direction: column;
                padding: 20px;
            }
            
            .action-btn {
                width: 100%;
                justify-content: center;
            }
        }
        </style>
    `;

    quizContainer.innerHTML = html;
}

// Función para resetear el quiz
function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    startTime = null;
    window.location.reload();
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
    
    // Inicializar Firebase y cargar podio
    initializeFirebase();
    
    // Cargar el podio inicial
    setTimeout(() => {
        updatePodiumDisplay();
    }, 1000);
    
    // Configurar el botón de "Comenzar Quiz"
    const startQuizButton = document.getElementById('start-quiz-btn');
    if (startQuizButton) {
        console.log('🎮 Configurando botón de Comenzar Quiz...');
        startQuizButton.addEventListener('click', function(event) {
            event.preventDefault();
            
            const playerNameInput = document.getElementById('player-name');
            if (playerNameInput) {
                const name = playerNameInput.value.trim();
                if (name) {
                    console.log('🎮 Iniciando quiz para:', name);
                    playerName = name;
                    currentQuestion = 0;
                    score = 0;
                    startTime = Date.now();
                    
                    // Iniciar el quiz directamente
                    showQuestion();
                } else {
                    alert('Por favor, ingresa tu nombre para comenzar');
                    playerNameInput.focus();
                }
            }
        });
    }
});

// Hacer las funciones disponibles globalmente
window.checkAnswer = checkAnswer;
window.resetQuiz = resetQuiz;
