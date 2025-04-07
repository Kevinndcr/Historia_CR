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
        image: "images/quiz/quiz1.jpg" // Reutilizamos imágenes si hay menos que preguntas
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
const db = firebase.firestore();

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

// Función para mostrar el formulario de nombre
function showNameForm() {
    const quizContainer = document.querySelector('.quiz-container');
    
    const html = `
        <div class="card shadow-sm">
            <div class="card-body text-center">
                <h4 class="mb-4">¡Bienvenido al Quiz!</h4>
                <p class="mb-4">Ingresa tu nombre para comenzar:</p>
                <form id="nameForm" class="mb-4">
                    <div class="form-group">
                        <input type="text" 
                               class="form-control mb-3" 
                               id="playerNameInput" 
                               placeholder="Tu nombre"
                               required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        Comenzar Quiz
                    </button>
                </form>
            </div>
        </div>
    `;

    quizContainer.innerHTML = html;

    // Manejar el envío del formulario
    document.getElementById('nameForm').addEventListener('submit', (e) => {
        e.preventDefault();
        playerName = document.getElementById('playerNameInput').value.trim();
        if (playerName) {
            // Reiniciar el estado del quiz
            currentQuestion = 0;
            score = 0;
            startTime = Date.now();
            showQuestion();
        }
    });
}

// Función para actualizar el podio
async function updateLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    
    try {
        const snapshot = await db.collection('leaderboard')
            .orderBy('totalScore', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            leaderboardBody.innerHTML = '<tr><td colspan="4">Sin registros aún</td></tr>';
            return;
        }
        
        const html = snapshot.docs.map((doc, index) => {
            const data = doc.data();
            const position = index + 1;
            let medal = '';
            if (position === 1) medal = '🥇';
            else if (position === 2) medal = '🥈';
            else if (position === 3) medal = '🥉';
            
            return `
                <tr>
                    <td>${medal} ${position}°</td>
                    <td>${data.name}</td>
                    <td>${data.totalScore}</td>
                    <td>${formatTime(data.timeInSeconds)}</td>
                </tr>
            `;
        }).join('');
        
        leaderboardBody.innerHTML = html;
    } catch (error) {
        console.error("Error al cargar el podio:", error);
        leaderboardBody.innerHTML = '<tr><td colspan="4">Error al cargar el podio</td></tr>';
    }
}

// Función para guardar el puntaje
async function saveScore(name, scoreData) {
    try {
        const snapshot = await db.collection('leaderboard')
            .orderBy('totalScore', 'desc')
            .limit(5)
            .get();
        
        const scores = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        if (scores.length < 5 || scoreData.totalScore > scores[scores.length - 1].totalScore) {
            await db.collection('leaderboard').add({
                name: name,
                ...scoreData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            if (scores.length >= 5) {
                await db.collection('leaderboard').doc(scores[scores.length - 1].id).delete();
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error al guardar el puntaje:", error);
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
                    '<div class="alert alert-success mb-4">¡Felicitaciones! Has entrado al Top 5 🏆</div>' : 
                    '<div class="text-muted mb-4">Sigue intentando para entrar al Top 5</div>'
                }

                <div id="leaderboard" class="mb-4">
                    <h5 class="mb-3">🏆 Top 5 Jugadores 🏆</h5>
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

                <div class="d-grid gap-2">
                    <button class="btn btn-primary" onclick="resetQuiz()">
                        Intentar de nuevo
                    </button>
                    <button class="btn btn-outline-secondary" onclick="showNameForm()">
                        Cambiar Jugador
                    </button>
                </div>
            </div>
        </div>
    `;

    quizContainer.innerHTML = html;
    updateLeaderboard();
}

function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    startTime = Date.now();
    showQuestion();
}

// Inicializar el quiz cuando se carga el documento
document.addEventListener('DOMContentLoaded', () => {
    showNameForm();
});
