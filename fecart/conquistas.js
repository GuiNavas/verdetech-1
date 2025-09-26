document.addEventListener('DOMContentLoaded', function() {
    loadAchievements();
    updateStats();
});

function loadAchievements() {
    if (!window.gamification) {
        console.error('Sistema de gamificação não carregado');
        return;
    }

    const achievements = window.gamification.achievements;
    const container = document.getElementById('achievements-container');
    
    container.innerHTML = '';

    achievements.forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        achievementCard.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
                ${achievement.unlocked ? '<div class="unlock-badge"><i class="fas fa-check"></i></div>' : ''}
            </div>
            <div class="achievement-content">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                <div class="achievement-points">
                    <i class="fas fa-star"></i>
                    <span>${achievement.points} pontos</span>
                </div>
            </div>
        `;

        container.appendChild(achievementCard);
    });
}

function updateStats() {
    if (!window.gamification) return;

    const stats = window.gamification.getProgress();
    const totalPoints = window.gamification.getTotalPoints();

    document.getElementById('total-points').textContent = totalPoints;
    document.getElementById('achievements-unlocked').textContent = stats.unlocked;
    document.getElementById('progress-percentage').textContent = stats.percentage + '%';
}

// Adicionar estilos CSS específicos para conquistas
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
    .achievements-header {
        text-align: center;
        margin-bottom: 2rem;
        padding: 2rem 0;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 15px;
        box-shadow: var(--shadow);
    }

    .achievements-header h2 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .achievements-header p {
        font-size: 1.2rem;
        opacity: 0.9;
    }

    .achievements-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .achievement-card {
        background: white;
        border-radius: 15px;
        padding: 1.5rem;
        box-shadow: var(--shadow);
        transition: var(--transition);
        position: relative;
        overflow: hidden;
    }

    .achievement-card.unlocked {
        border-left: 5px solid var(--accent-color);
        background: linear-gradient(135deg, #f8fff8, #ffffff);
    }

    .achievement-card.locked {
        opacity: 0.6;
        background: #f5f5f5;
    }

    .achievement-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }

    .achievement-icon {
        position: relative;
        text-align: center;
        margin-bottom: 1rem;
    }

    .achievement-icon i {
        font-size: 3rem;
        color: var(--accent-color);
    }

    .achievement-card.locked .achievement-icon i {
        color: #ccc;
    }

    .unlock-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: var(--accent-color);
        color: white;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }

    .achievement-content h4 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }

    .achievement-content p {
        color: #666;
        margin-bottom: 1rem;
        line-height: 1.4;
    }

    .achievement-points {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--accent-color);
        font-weight: 600;
    }

    .achievements-tips {
        background: white;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: var(--shadow);
        margin-bottom: 2rem;
    }

    .achievements-tips h3 {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .tips-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }

    .tip-card {
        background: var(--light-color);
        padding: 1.5rem;
        border-radius: 10px;
        text-align: center;
        transition: var(--transition);
    }

    .tip-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .tip-card i {
        font-size: 2rem;
        color: var(--accent-color);
        margin-bottom: 1rem;
    }

    .tip-card h4 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .tip-card p {
        color: #666;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    @media (max-width: 768px) {
        .achievements-header h2 {
            font-size: 2rem;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .achievements-stats {
            grid-template-columns: 1fr;
        }
        
        .achievements-grid {
            grid-template-columns: 1fr;
        }
        
        .tips-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(achievementStyles);

