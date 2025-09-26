let currentQuestion = 0;
let userAnswers = [];
let score = 0;

const quizQuestions = [
    {
        question: 'Qual ação doméstica mais economiza água?',
        options: ['Lavar carro com mangueira', 'Tomar banhos curtos', 'Lavar calçada com água', 'Deixar torneira pingando'],
        correct: 1
    },
    {
        question: 'Qual é o melhor destino para vidro quebrado?',
        options: ['Lixo comum', 'Vaso sanitário', 'Coleta seletiva', 'Compostagem'],
        correct: 2
    },
    {
        question: 'LEDs consomem aproximadamente quantos % a menos que incandescentes?',
        options: ['10%', '40%', '80%', '95%'],
        correct: 2
    },
    {
        question: 'Qual transporte emite menos CO₂ por km?',
        options: ['Carro solo', 'Motocicleta', 'Ônibus', 'Bicicleta'],
        correct: 3
    },
    {
        question: 'Qual material NÃO é reciclável em casa?',
        options: ['Papel', 'Metal', 'Isopor', 'Resto de Comida'],
        correct: 3
    },
    {
        question: 'Qual atitude reduz a pegada de carbono alimentar?',
        options: ['Comer carne vermelha diariamente', 'Preferir alimentos locais e sazonais', 'Usar descartáveis', 'Desperdiçar sobras'],
        correct: 1
    },
    {
        question: 'Qual é uma fonte de energia renovável?',
        options: ['Carvão mineral', 'Petróleo', 'Solar', 'Nuclear'],
        correct: 2
    },
    {
        question: 'O que significa “consumo responsável”?',
        options: ['Comprar sempre o mais barato', 'Comprar só o necessário e com menor impacto', 'Comprar por impulso', 'Ignorar a origem do produto'],
        correct: 1
    },
    {
        question: 'Qual prática economiza energia em casa?',
        options: ['Standby permanente', 'Desligar aparelhos da tomada', 'Abrir geladeira por tempo longo', 'Lâmpadas incandescentes'],
        correct: 1
    },
    {
        question: 'Qual é a melhor forma de descartar pilhas/baterias?',
        options: ['Lixo comum', 'Enterrar no quintal', 'Pontos de coleta', 'Ralinho da pia'],
        correct: 2
    }
];

function renderQuestion() {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const progressText = document.getElementById('current-question');

    const q = quizQuestions[currentQuestion];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.setAttribute('data-index', String(idx));
        if (userAnswers[currentQuestion] === idx) {
            btn.classList.add('selected');
        }
        btn.addEventListener('click', () => {
            userAnswers[currentQuestion] = idx;
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        optionsContainer.appendChild(btn);
    });

    progressText.textContent = String(currentQuestion + 1);
    updateControls();
    updateProgressBar();
}

function updateControls() {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    const submitBtn = document.getElementById('submit-quiz');

    if (prevBtn) prevBtn.disabled = currentQuestion === 0;
    if (nextBtn) nextBtn.style.display = currentQuestion < quizQuestions.length - 1 ? 'inline-flex' : 'none';
    if (submitBtn) submitBtn.style.display = currentQuestion === quizQuestions.length - 1 ? 'inline-flex' : 'none';
}

function updateProgressBar() {
    const fill = document.querySelector('.progress-fill');
    if (!fill) return;
    const pct = ((currentQuestion) / (quizQuestions.length - 1)) * 100;
    fill.setAttribute('style', `width:${pct}%`);
}

function computeScore() {
    score = 0;
    userAnswers.forEach((ans, idx) => {
        if (ans === quizQuestions[idx].correct) score++;
    });
}

function submitQuiz() {
    computeScore();
    const resultsPayload = {
        score,
        total: quizQuestions.length,
        userAnswers,
        questions: quizQuestions
    };
    try {
        localStorage.setItem('quizResults', JSON.stringify(resultsPayload));
    } catch (e) {}
    
    // Disparar evento de gamificação
    const perfectScore = score === quizQuestions.length;
    document.dispatchEvent(new CustomEvent('quizCompleted', {
        detail: { 
            score, 
            total: quizQuestions.length, 
            perfectScore 
        }
    }));
    
    // Mostrar notificação
    if (window.notifications) {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        if (perfectScore) {
            window.notifications.success(
                `🎉 Parabéns! Você acertou ${score}/${quizQuestions.length} (${percentage}%)`,
                5000
            );
        } else {
            window.notifications.info(
                `Quiz concluído! Você acertou ${score}/${quizQuestions.length} (${percentage}%)`,
                5000
            );
        }
    }
    
    fetch('/api/salvar-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pontuacao: score, total_perguntas: quizQuestions.length })
    }).finally(() => {
        window.location.href = 'resultados.html';
    });
}

function startQuiz() {
    userAnswers = Array(quizQuestions.length).fill(null);
    currentQuestion = 0;
    score = 0;
    document.getElementById('quiz-intro').classList.remove('active');
    document.getElementById('quiz-questions').classList.add('active');
    renderQuestion();
}

function wireEvents() {
    const startBtn = document.getElementById('start-quiz');
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    const submitBtn = document.getElementById('submit-quiz');

    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (currentQuestion < quizQuestions.length - 1) {
            currentQuestion++;
            renderQuestion();
        }
    });
    if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
}

document.addEventListener('DOMContentLoaded', wireEvents);