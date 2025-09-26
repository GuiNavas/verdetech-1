// Sistema de Tutoriais Interativos
class TutorialSystem {
    constructor() {
        this.tutorials = {
            'welcome': {
                title: 'Bem-vindo ao VERDETECH! 🌱',
                steps: [
                    {
                        target: '.logo',
                        content: 'Este é o VERDETECH, sua plataforma de sustentabilidade!',
                        position: 'bottom'
                    },
                    {
                        target: '.nav',
                        content: 'Navegue pelas diferentes seções para explorar funcionalidades.',
                        position: 'bottom'
                    },
                    {
                        target: '.main',
                        content: 'Aqui você encontrará informações e ferramentas para uma vida mais sustentável.',
                        position: 'top'
                    }
                ]
            },
            'carbon_calculator': {
                title: 'Calculadora de Pegada de Carbono',
                steps: [
                    {
                        target: '.calculator-card',
                        content: 'Preencha os campos para calcular sua pegada de carbono.',
                        position: 'top'
                    },
                    {
                        target: 'input[type="number"]',
                        content: 'Use números reais para obter resultados mais precisos.',
                        position: 'top'
                    },
                    {
                        target: 'button[type="submit"]',
                        content: 'Clique aqui para calcular sua pegada de carbono.',
                        position: 'top'
                    }
                ]
            },
            'quiz': {
                title: 'Quiz de Sustentabilidade',
                steps: [
                    {
                        target: '.quiz-container',
                        content: 'Teste seus conhecimentos sobre sustentabilidade!',
                        position: 'top'
                    },
                    {
                        target: '.question',
                        content: 'Leia a pergunta com atenção antes de responder.',
                        position: 'top'
                    },
                    {
                        target: '.options',
                        content: 'Escolha a resposta que considera mais correta.',
                        position: 'top'
                    }
                ]
            }
        };
        
        this.currentTutorial = null;
        this.currentStep = 0;
        this.overlay = null;
        this.init();
    }

    init() {
        this.createOverlay();
        this.setupEventListeners();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: none;
        `;
        document.body.appendChild(this.overlay);
    }

    setupEventListeners() {
        // Botão de tutorial no header
        document.addEventListener('DOMContentLoaded', () => {
            this.addTutorialButton();
        });
    }

    addTutorialButton() {
        const nav = document.querySelector('.nav ul');
        if (nav && !document.getElementById('tutorial-btn')) {
            const tutorialBtn = document.createElement('li');
            tutorialBtn.innerHTML = `
                <button id="tutorial-btn" class="nav-link" style="background: none; border: none; color: inherit; cursor: pointer;">
                    <i class="fas fa-question-circle"></i> Tutorial
                </button>
            `;
            nav.appendChild(tutorialBtn);
            
            tutorialBtn.addEventListener('click', () => {
                this.showTutorialMenu();
            });
        }
    }

    showTutorialMenu() {
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            width: 90%;
        `;

        menu.innerHTML = `
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">
                <i class="fas fa-graduation-cap"></i> Tutoriais Disponíveis
            </h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <button class="tutorial-option" data-tutorial="welcome" style="
                    padding: 1rem; border: 2px solid var(--accent-color); 
                    background: white; border-radius: 8px; cursor: pointer;
                    transition: all 0.3s ease; text-align: left;
                ">
                    <strong>🌱 Introdução</strong><br>
                    <small>Conheça o VERDETECH e suas funcionalidades</small>
                </button>
                <button class="tutorial-option" data-tutorial="carbon_calculator" style="
                    padding: 1rem; border: 2px solid var(--accent-color); 
                    background: white; border-radius: 8px; cursor: pointer;
                    transition: all 0.3s ease; text-align: left;
                ">
                    <strong>📊 Calculadora de Carbono</strong><br>
                    <small>Aprenda a usar a calculadora de pegada de carbono</small>
                </button>
                <button class="tutorial-option" data-tutorial="quiz" style="
                    padding: 1rem; border: 2px solid var(--accent-color); 
                    background: white; border-radius: 8px; cursor: pointer;
                    transition: all 0.3s ease; text-align: left;
                ">
                    <strong>🧠 Quiz de Sustentabilidade</strong><br>
                    <small>Como responder o quiz corretamente</small>
                </button>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <button id="close-tutorial-menu" style="
                    padding: 0.5rem 1rem; background: #6c757d; 
                    color: white; border: none; border-radius: 5px; cursor: pointer;
                ">Fechar</button>
            </div>
        `;

        // Adicionar estilos hover
        const style = document.createElement('style');
        style.textContent = `
            .tutorial-option:hover {
                background: var(--light-color) !important;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);

        this.overlay.appendChild(menu);
        this.overlay.style.display = 'block';

        // Event listeners
        menu.querySelectorAll('.tutorial-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tutorial = e.currentTarget.dataset.tutorial;
                this.startTutorial(tutorial);
                this.overlay.style.display = 'none';
            });
        });

        menu.querySelector('#close-tutorial-menu').addEventListener('click', () => {
            this.overlay.style.display = 'none';
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.overlay.style.display = 'none';
            }
        });
    }

    startTutorial(tutorialId) {
        const tutorial = this.tutorials[tutorialId];
        if (!tutorial) return;

        this.currentTutorial = tutorial;
        this.currentStep = 0;
        this.showStep();
    }

    showStep() {
        if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
            this.endTutorial();
            return;
        }

        const step = this.currentTutorial.steps[this.currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            this.currentStep++;
            setTimeout(() => this.showStep(), 100);
            return;
        }

        // Destacar elemento
        this.highlightElement(target, step);
    }

    highlightElement(element, step) {
        // Remover highlight anterior
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        // Adicionar highlight
        element.classList.add('tutorial-highlight');

        // Criar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            max-width: 300px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 14px;
            line-height: 1.4;
        `;

        tooltip.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <strong>${this.currentTutorial.title}</strong>
                <span style="font-size: 12px;">${this.currentStep + 1}/${this.currentTutorial.steps.length}</span>
            </div>
            <div>${step.content}</div>
            <div style="text-align: center; margin-top: 1rem;">
                <button id="tutorial-next" style="
                    background: var(--accent-color); color: white; 
                    border: none; padding: 0.5rem 1rem; 
                    border-radius: 5px; cursor: pointer; margin-right: 0.5rem;
                ">Próximo</button>
                <button id="tutorial-skip" style="
                    background: #6c757d; color: white; 
                    border: none; padding: 0.5rem 1rem; 
                    border-radius: 5px; cursor: pointer;
                ">Pular</button>
            </div>
        `;

        // Posicionar tooltip
        const rect = element.getBoundingClientRect();
        const position = this.calculateTooltipPosition(rect, step.position);
        tooltip.style.left = position.x + 'px';
        tooltip.style.top = position.y + 'px';

        document.body.appendChild(tooltip);

        // Event listeners
        tooltip.querySelector('#tutorial-next').addEventListener('click', () => {
            this.currentStep++;
            tooltip.remove();
            this.showStep();
        });

        tooltip.querySelector('#tutorial-skip').addEventListener('click', () => {
            this.endTutorial();
            tooltip.remove();
        });
    }

    calculateTooltipPosition(rect, position) {
        const tooltipWidth = 300;
        const tooltipHeight = 150;
        const margin = 10;

        let x, y;

        switch (position) {
            case 'top':
                x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                y = rect.top - tooltipHeight - margin;
                break;
            case 'bottom':
                x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                y = rect.bottom + margin;
                break;
            case 'left':
                x = rect.left - tooltipWidth - margin;
                y = rect.top + (rect.height / 2) - (tooltipHeight / 2);
                break;
            case 'right':
                x = rect.right + margin;
                y = rect.top + (rect.height / 2) - (tooltipHeight / 2);
                break;
            default:
                x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                y = rect.top - tooltipHeight - margin;
        }

        // Ajustar para não sair da tela
        x = Math.max(margin, Math.min(x, window.innerWidth - tooltipWidth - margin));
        y = Math.max(margin, Math.min(y, window.innerHeight - tooltipHeight - margin));

        return { x, y };
    }

    endTutorial() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        document.querySelectorAll('.tutorial-tooltip').forEach(el => {
            el.remove();
        });
        this.currentTutorial = null;
        this.currentStep = 0;
    }
}

// Adicionar estilos CSS
const tutorialStyle = document.createElement('style');
tutorialStyle.textContent = `
    .tutorial-highlight {
        position: relative;
        z-index: 10000;
        box-shadow: 0 0 0 4px var(--accent-color) !important;
        border-radius: 8px !important;
        animation: tutorial-pulse 1s infinite;
    }

    @keyframes tutorial-pulse {
        0% { box-shadow: 0 0 0 4px var(--accent-color); }
        50% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0.3); }
        100% { box-shadow: 0 0 0 4px var(--accent-color); }
    }
`;
document.head.appendChild(tutorialStyle);

// Instância global
window.tutorial = new TutorialSystem();

