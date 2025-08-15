// Enhanced Quiz System con Firebase Integration
class QuizSystem {
    constructor() {
        this.questions = [
            {
                question: "¿En qué año comenzó la Campaña Nacional?",
                options: ["1855", "1856", "1857", "1858"],
                correct: 1,
                image: "images/quiz/quiz1.jpg",
                points: 100
            },
            {
                question: "¿Quién fue el presidente de Costa Rica durante la Campaña Nacional?",
                options: ["Juan Rafael Mora Porras", "José María Castro Madriz", "Juan Mora Fernández", "Braulio Carrillo"],
                correct: 0,
                image: "images/quiz/quis.jpg",
                points: 120
            },
            {
                question: "¿Cuál fue la primera batalla importante de la Campaña Nacional?",
                options: ["Batalla de Rivas", "Batalla de Santa Rosa", "Batalla de San Juan del Sur", "Batalla de Granada"],
                correct: 1,
                image: "images/quiz/r23.jpg",
                points: 150
            },
            {
                question: "¿Quién fue el líder de los filibusteros?",
                options: ["William Walker", "Frederick Henningsen", "Charles Frederick Henningsen", "Byron Cole"],
                correct: 0,
                image: "images/quiz/sdffsadfsD.jpg",
                points: 100
            },
            {
                question: "¿En qué fecha se dio la Batalla de Rivas?",
                options: ["11 de abril de 1856", "20 de marzo de 1856", "15 de septiembre de 1856", "1 de mayo de 1857"],
                correct: 0,
                image: "images/quiz/quiz1.jpg",
                points: 180
            },
            {
                question: "¿Quién fue el héroe nacional que incendió el Mesón?",
                options: ["Juan Santamaría", "Juan Rafael Mora", "José María Cañas", "José Joaquín Mora"],
                correct: 0,
                image: "images/quiz/quis.jpg",
                points: 130
            },
            {
                question: "¿Qué país centroamericano fue invadido primero por William Walker?",
                options: ["Costa Rica", "Nicaragua", "El Salvador", "Honduras"],
                correct: 1,
                image: "images/quiz/r23.jpg",
                points: 110
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
                image: "images/quiz/sdffsadfsD.jpg",
                points: 200
            },
            {
                question: "¿Qué enfermedad fue utilizada como arma biológica contra los filibusteros?",
                options: ["Malaria", "Cólera", "Fiebre amarilla", "Viruela"],
                correct: 1,
                image: "images/quiz/quiz1.jpg",
                points: 160
            },
            {
                question: "¿En qué año terminó definitivamente la Campaña Nacional?",
                options: ["1856", "1857", "1858", "1859"],
                correct: 1,
                image: "images/quiz/quis.jpg",
                points: 140
            }
        ];

        this.currentQuestion = 0;
        this.score = 0;
        this.playerName = '';
        this.startTime = null;
        this.endTime = null;
        this.answers = [];
        this.db = null;
        
        console.log('Inicializando QuizSystem...');
        this.initializeFirebase();
        this.initializeEventListeners();
        
        // Cargar los puntajes inmediatamente
        setTimeout(() => {
            this.loadTopScores();
        }, 1000); // Esperar 1 segundo para que Firebase se inicialice
    }

    initializeFirebase() {
        // Inicializar Firebase si está disponible
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                this.db = firebase.firestore();
                console.log('Firebase inicializado correctamente');
                
                // Test de conexión
                this.db.collection('leaderboard').limit(1).get()
                    .then(() => {
                        console.log('Conexión a Firestore exitosa');
                    })
                    .catch((error) => {
                        console.warn('Error de conexión a Firestore:', error);
                        this.db = null;
                    });
            } catch (error) {
                console.error('Error inicializando Firebase:', error);
                this.db = null;
            }
        } else {
            console.warn('Firebase no está disponible. Usando almacenamiento local.');
        }
    }

    initializeEventListeners() {
        // Event listener para el botón de iniciar quiz
        document.addEventListener('click', (e) => {
            if (e.target.id === 'start-quiz-btn') {
                this.startQuiz();
            } else if (e.target.id === 'view-leaderboard-btn') {
                this.showLeaderboardModal();
            } else if (e.target.id === 'participate-quiz-btn') {
                $('#leaderboardModal').modal('hide');
                document.getElementById('player-name').focus();
            } else if (e.target.id === 'refresh-podium' || e.target.closest('#refresh-podium')) {
                console.log('Refrescando podio...');
                this.loadTopScores();
            } else if (e.target.classList.contains('quiz-option')) {
                this.selectAnswer(parseInt(e.target.dataset.option));
            } else if (e.target.id === 'next-question-btn') {
                this.nextQuestion();
            } else if (e.target.id === 'restart-quiz-btn') {
                this.restartQuiz();
            }
        });

        // Event listener para Enter en el input del nombre
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'player-name' && e.key === 'Enter') {
                this.startQuiz();
            }
        });
    }

    async loadTopScores() {
        try {
            let scores = [];
            
            if (this.db) {
                // Cargar desde Firebase - usando el nombre correcto de la colección
                try {
                    console.log('Cargando datos desde Firebase...');
                    const snapshot = await this.db.collection('leaderboard')
                        .orderBy('totalScore', 'desc')
                        .orderBy('timeInSeconds', 'asc')
                        .limit(20)
                        .get();
                    
                    scores = snapshot.docs.map(doc => {
                        const data = doc.data();
                        console.log('Dato de Firebase:', data);
                        return {
                            id: doc.id,
                            playerName: data.name || 'Anónimo',
                            score: data.totalScore || data.baseScore || 0,
                            completionTime: (data.timeInSeconds || 0) * 1000, // Convertir a millisegundos
                            correctAnswers: data.correctAnswers || 0,
                            timestamp: data.timestamp || Date.now(),
                            timeInSeconds: data.timeInSeconds || 0,
                            ...data
                        };
                    });
                    
                    console.log('Scores procesados:', scores);
                } catch (fbError) {
                    console.warn('Error cargando desde Firebase, usando localStorage:', fbError);
                    // Fallback a localStorage si Firebase falla
                    scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
                }
            } else {
                console.log('Firebase no disponible, usando localStorage');
                // Cargar desde localStorage
                scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
                scores.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.completionTime - b.completionTime;
                });
            }

            console.log('Top 3 scores para podio:', scores.slice(0, 3));
            this.updatePodium(scores.slice(0, 3));
            this.updateLeaderboardModal(scores);
        } catch (error) {
            console.error('Error cargando puntajes:', error);
            this.updatePodium([]);
        }
    }

    updatePodium(topScores) {
        console.log('Actualizando podio con:', topScores);
        
        const positions = [
            { position: 'first', index: 0 },
            { position: 'second', index: 1 },
            { position: 'third', index: 2 }
        ];
        
        positions.forEach(({ position, index }) => {
            const score = topScores[index];
            const nameElement = document.getElementById(`${position}-place-name`);
            const scoreElement = document.getElementById(`${position}-place-score`);
            const timeElement = document.getElementById(`${position}-place-time`);

            if (score && nameElement && scoreElement && timeElement) {
                console.log(`Actualizando ${position} lugar:`, score);
                nameElement.textContent = score.playerName || 'Jugador';
                scoreElement.textContent = `${score.score} pts`;
                timeElement.textContent = this.formatTime(score.completionTime || score.timeInSeconds * 1000);
                
                // Agregar animación de entrada
                nameElement.style.opacity = '0';
                scoreElement.style.opacity = '0';
                timeElement.style.opacity = '0';
                
                setTimeout(() => {
                    nameElement.style.transition = 'opacity 0.5s ease';
                    scoreElement.style.transition = 'opacity 0.5s ease';
                    timeElement.style.transition = 'opacity 0.5s ease';
                    nameElement.style.opacity = '1';
                    scoreElement.style.opacity = '1';
                    timeElement.style.opacity = '1';
                }, index * 200);
                
            } else if (nameElement && scoreElement && timeElement) {
                console.log(`No hay datos para ${position} lugar`);
                nameElement.textContent = '---';
                scoreElement.textContent = '--- pts';
                timeElement.textContent = '--:--';
                
                nameElement.style.opacity = '0.5';
                scoreElement.style.opacity = '0.5';
                timeElement.style.opacity = '0.5';
            }
        });
    }

    updateLeaderboardModal(scores) {
        const tbody = document.getElementById('leaderboard-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (scores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay puntuaciones registradas</td></tr>';
            return;
        }

        scores.slice(0, 20).forEach((score, index) => {
            const row = document.createElement('tr');
            const position = index + 1;
            let medal = '';
            
            if (position === 1) medal = '🥇';
            else if (position === 2) medal = '🥈';
            else if (position === 3) medal = '🥉';

            row.innerHTML = `
                <td><strong>${medal} ${position}</strong></td>
                <td>${score.playerName || 'Anónimo'}</td>
                <td><span class="badge bg-success">${score.score} pts</span></td>
                <td>${this.formatTime(score.completionTime)}</td>
                <td>${new Date(score.timestamp).toLocaleDateString()}</td>
            `;
            
            if (position <= 3) {
                row.classList.add('table-warning');
            }
            
            tbody.appendChild(row);
        });
    }

    startQuiz() {
        const nameInput = document.getElementById('player-name');
        const playerName = nameInput.value.trim();

        if (!playerName) {
            nameInput.classList.add('is-invalid');
            nameInput.focus();
            return;
        }

        nameInput.classList.remove('is-invalid');
        this.playerName = playerName;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.startTime = Date.now();

        this.showQuestion();
    }

    showQuestion() {
        const container = document.getElementById('quiz-dynamic-content');
        const question = this.questions[this.currentQuestion];

        container.innerHTML = `
            <div class="quiz-question-card">
                <div class="quiz-progress">
                    <div class="progress mb-4">
                        <div class="progress-bar bg-warning" style="width: ${((this.currentQuestion + 1) / this.questions.length) * 100}%"></div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="quiz-question-number">Pregunta ${this.currentQuestion + 1} de ${this.questions.length}</span>
                        <span class="quiz-current-score">Puntuación: ${this.score}</span>
                    </div>
                </div>
                
                <div class="question-content">
                    <div class="row">
                        <div class="col-lg-6">
                            <h4 class="question-text">${question.question}</h4>
                            <div class="question-options mt-4">
                                ${question.options.map((option, index) => `
                                    <button class="quiz-option btn btn-outline-primary w-100 mb-3" data-option="${index}">
                                        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                                        ${option}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="question-image-container">
                                <img src="${question.image}" alt="Imagen de la pregunta" class="question-image">
                                <div class="image-overlay">
                                    <span class="points-indicator">+${question.points} pts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    selectAnswer(selectedOption) {
        const options = document.querySelectorAll('.quiz-option');
        const question = this.questions[this.currentQuestion];
        
        // Deshabilitar todas las opciones
        options.forEach(option => option.disabled = true);
        
        // Marcar la respuesta seleccionada
        options[selectedOption].classList.remove('btn-outline-primary');
        
        if (selectedOption === question.correct) {
            options[selectedOption].classList.add('btn-success');
            this.score += question.points;
            this.showAnswerFeedback(true, question.points);
        } else {
            options[selectedOption].classList.add('btn-danger');
            options[question.correct].classList.add('btn-success');
            this.showAnswerFeedback(false, 0);
        }

        this.answers.push({
            question: this.currentQuestion,
            selected: selectedOption,
            correct: question.correct,
            isCorrect: selectedOption === question.correct,
            points: selectedOption === question.correct ? question.points : 0
        });

        // Mostrar botón para continuar después de un delay
        setTimeout(() => {
            this.showNextButton();
        }, 1500);
    }

    showAnswerFeedback(isCorrect, points) {
        const feedbackHtml = `
            <div class="answer-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback-icon">
                    <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                </div>
                <div class="feedback-text">
                    <h5>${isCorrect ? '¡Correcto!' : 'Incorrecto'}</h5>
                    ${isCorrect ? `<p>+${points} puntos</p>` : '<p>La respuesta correcta está marcada en verde</p>'}
                </div>
            </div>
        `;

        const questionCard = document.querySelector('.quiz-question-card');
        questionCard.insertAdjacentHTML('beforeend', feedbackHtml);
    }

    showNextButton() {
        const isLastQuestion = this.currentQuestion === this.questions.length - 1;
        const buttonText = isLastQuestion ? 'Ver Resultados' : 'Siguiente Pregunta';
        const buttonId = isLastQuestion ? 'finish-quiz-btn' : 'next-question-btn';

        const nextButtonHtml = `
            <div class="text-center mt-4">
                <button id="${buttonId}" class="btn btn-lg btn-warning px-5">
                    <i class="fas ${isLastQuestion ? 'fa-flag-checkered' : 'fa-arrow-right'} me-2"></i>
                    ${buttonText}
                </button>
            </div>
        `;

        const questionCard = document.querySelector('.quiz-question-card');
        questionCard.insertAdjacentHTML('beforeend', nextButtonHtml);

        // Event listener para el botón
        document.getElementById(buttonId).addEventListener('click', () => {
            if (isLastQuestion) {
                this.finishQuiz();
            } else {
                this.nextQuestion();
            }
        });
    }

    nextQuestion() {
        this.currentQuestion++;
        this.showQuestion();
    }

    async finishQuiz() {
        this.endTime = Date.now();
        const completionTime = this.endTime - this.startTime;
        
        const finalScore = {
            playerName: this.playerName,
            score: this.score,
            completionTime: completionTime,
            totalQuestions: this.questions.length,
            correctAnswers: this.answers.filter(a => a.isCorrect).length,
            timestamp: Date.now(),
            answers: this.answers
        };

        try {
            await this.saveScore(finalScore);
            this.showResults(finalScore);
            this.loadTopScores(); // Actualizar el podio
        } catch (error) {
            console.error('Error guardando puntuación:', error);
            this.showResults(finalScore);
        }
    }

    async saveScore(scoreData) {
        try {
            if (this.db) {
                // Guardar en Firebase con el formato correcto
                const firebaseData = {
                    name: scoreData.playerName,
                    totalScore: scoreData.score,
                    timeInSeconds: Math.floor(scoreData.completionTime / 1000),
                    correctAnswers: scoreData.correctAnswers,
                    timestamp: Date.now(),
                    timeBonus: 0, // Si quieres agregar bonus por tiempo
                    baseScore: scoreData.score
                };
                
                await this.db.collection('leaderboard').add(firebaseData);
                console.log('Puntuación guardada en Firebase');
            } else {
                // Guardar en localStorage
                const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
                scores.push(scoreData);
                scores.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.completionTime - b.completionTime;
                });
                localStorage.setItem('quizScores', JSON.stringify(scores.slice(0, 100))); // Mantener solo top 100
                console.log('Puntuación guardada en localStorage');
            }
        } catch (error) {
            console.error('Error guardando puntuación:', error);
            // Fallback a localStorage en caso de error con Firebase
            const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
            scores.push(scoreData);
            localStorage.setItem('quizScores', JSON.stringify(scores.slice(0, 100)));
        }
    }

    showResults(scoreData) {
        const container = document.getElementById('quiz-dynamic-content');
        const percentage = (scoreData.correctAnswers / scoreData.totalQuestions) * 100;
        
        let performanceLevel = '';
        let performanceColor = '';
        let performanceIcon = '';
        
        if (percentage >= 90) {
            performanceLevel = 'Excelente';
            performanceColor = 'success';
            performanceIcon = 'fas fa-star';
        } else if (percentage >= 70) {
            performanceLevel = 'Muy Bien';
            performanceColor = 'info';
            performanceIcon = 'fas fa-thumbs-up';
        } else if (percentage >= 50) {
            performanceLevel = 'Bien';
            performanceColor = 'warning';
            performanceIcon = 'fas fa-check';
        } else {
            performanceLevel = 'Puedes Mejorar';
            performanceColor = 'danger';
            performanceIcon = 'fas fa-redo';
        }

        container.innerHTML = `
            <div class="quiz-results-card">
                <div class="results-header">
                    <div class="results-icon">
                        <i class="${performanceIcon}"></i>
                    </div>
                    <h3>¡Quiz Completado!</h3>
                    <p class="text-muted">Resultados de ${this.playerName}</p>
                </div>
                
                <div class="results-stats">
                    <div class="row text-center">
                        <div class="col-6 col-md-3">
                            <div class="stat-card">
                                <div class="stat-number text-primary">${scoreData.score}</div>
                                <div class="stat-label">Puntos</div>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="stat-card">
                                <div class="stat-number text-success">${scoreData.correctAnswers}/${scoreData.totalQuestions}</div>
                                <div class="stat-label">Correctas</div>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="stat-card">
                                <div class="stat-number text-info">${percentage.toFixed(1)}%</div>
                                <div class="stat-label">Precisión</div>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="stat-card">
                                <div class="stat-number text-warning">${this.formatTime(scoreData.completionTime)}</div>
                                <div class="stat-label">Tiempo</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="performance-badge">
                    <span class="badge bg-${performanceColor} fs-6 px-4 py-2">
                        <i class="${performanceIcon} me-2"></i>
                        ${performanceLevel}
                    </span>
                </div>
                
                <div class="results-actions">
                    <button id="restart-quiz-btn" class="btn btn-primary btn-lg me-3">
                        <i class="fas fa-redo me-2"></i>
                        Intentar de nuevo
                    </button>
                    <button id="view-leaderboard-btn" class="btn btn-outline-secondary btn-lg">
                        <i class="fas fa-trophy me-2"></i>
                        Ver Ranking
                    </button>
                </div>
            </div>
        `;
    }

    restartQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.startTime = Date.now();
        this.showQuestion();
    }

    showLeaderboardModal() {
        const modal = new bootstrap.Modal(document.getElementById('leaderboardModal'));
        modal.show();
    }

    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Estilos adicionales para el quiz (se agregarán dinámicamente)
const quizStyles = `
<style>
.quiz-question-card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.quiz-progress .quiz-question-number {
    color: #6c757d;
    font-weight: 500;
}

.quiz-current-score {
    color: #28a745;
    font-weight: 600;
}

.question-text {
    color: var(--primary-color);
    font-weight: 600;
    margin-bottom: 20px;
}

.quiz-option {
    text-align: left;
    padding: 15px 20px;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    transition: all 0.3s ease;
    position: relative;
}

.quiz-option:hover:not(:disabled) {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.option-letter {
    display: inline-block;
    width: 30px;
    height: 30px;
    background: var(--accent-color);
    color: var(--primary-color);
    border-radius: 50%;
    text-align: center;
    line-height: 30px;
    font-weight: bold;
    margin-right: 15px;
}

.question-image-container {
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.question-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
}

.image-overlay {
    position: absolute;
    top: 15px;
    right: 15px;
}

.points-indicator {
    background: var(--accent-color);
    color: var(--primary-color);
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9rem;
    box-shadow: 0 4px 15px rgba(255,215,0,0.3);
}

.answer-feedback {
    margin-top: 20px;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    animation: fadeInUp 0.5s ease;
}

.answer-feedback.correct {
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    border: 2px solid #28a745;
    color: #155724;
}

.answer-feedback.incorrect {
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    border: 2px solid #dc3545;
    color: #721c24;
}

.feedback-icon i {
    font-size: 2rem;
    margin-bottom: 10px;
}

.quiz-results-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.results-header .results-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--accent-color), #FFA500);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: var(--primary-color);
    font-size: 2rem;
}

.stat-card {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 15px;
}

.stat-number {
    font-size: 1.5rem;
    font-weight: bold;
}

.stat-label {
    color: #6c757d;
    font-size: 0.9rem;
    margin-top: 5px;
}

.performance-badge {
    margin: 30px 0;
}

.results-actions {
    margin-top: 30px;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .quiz-question-card {
        padding: 20px;
    }
    
    .question-image {
        height: 200px;
    }
    
    .results-actions .btn {
        width: 100%;
        margin-bottom: 10px;
    }
}
</style>
`;

// Función de inicialización
function initQuizSystem() {
    // Agregar estilos
    document.head.insertAdjacentHTML('beforeend', quizStyles);
    
    // Inicializar el sistema de quiz
    window.quizSystem = new QuizSystem();
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuizSystem);
} else {
    initQuizSystem();
}

// Función global para compatibilidad
function initQuiz() {
    initQuizSystem();
}
