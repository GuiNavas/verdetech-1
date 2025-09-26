// Sistema de Gamificação
class GamificationSystem {
    constructor() {
        this.achievements = [
            {
                id: 'first_carbon',
                name: 'Primeira Pegada',
                description: 'Calcule sua primeira pegada de carbono',
                icon: 'fas fa-leaf',
                points: 10,
                unlocked: false
            },
            {
                id: 'carbon_warrior',
                name: 'Guerreiro Verde',
                description: 'Reduza sua pegada para menos de 10kg CO2',
                icon: 'fas fa-shield-alt',
                points: 25,
                unlocked: false
            },
            {
                id: 'quiz_master',
                name: 'Mestre do Quiz',
                description: 'Acerte 100% das perguntas do quiz',
                icon: 'fas fa-trophy',
                points: 30,
                unlocked: false
            },
            {
                id: 'eco_explorer',
                name: 'Explorador Ecológico',
                description: 'Visite todas as seções do site',
                icon: 'fas fa-compass',
                points: 15,
                unlocked: false
            },
            {
                id: 'carbon_zero',
                name: 'Carbono Zero',
                description: 'Alcance pegada de carbono zero',
                icon: 'fas fa-star',
                points: 50,
                unlocked: false
            }
        ];
        
        this.userStats = {
            carbonCalculations: 0,
            quizAttempts: 0,
            perfectQuizzes: 0,
            sectionsVisited: new Set(),
            totalPoints: 0
        };
        
        this.init();
    }

    init() {
        this.loadUserStats();
        this.checkAchievements();
        this.setupEventListeners();
    }

    loadUserStats() {
        const saved = localStorage.getItem('verdetech_gamification');
        if (saved) {
            this.userStats = { ...this.userStats, ...JSON.parse(saved) };
        }
    }

    saveUserStats() {
        localStorage.setItem('verdetech_gamification', JSON.stringify(this.userStats));
    }

    setupEventListeners() {
        // Detectar quando o usuário visita uma seção
        document.addEventListener('DOMContentLoaded', () => {
            const currentPath = window.location.pathname;
            this.visitSection(currentPath);
        });

        // Detectar quando o usuário calcula pegada de carbono
        document.addEventListener('carbonCalculated', (event) => {
            this.userStats.carbonCalculations++;
            this.checkAchievements();
            this.saveUserStats();
        });

        // Detectar quando o usuário completa um quiz
        document.addEventListener('quizCompleted', (event) => {
            this.userStats.quizAttempts++;
            if (event.detail.perfectScore) {
                this.userStats.perfectQuizzes++;
            }
            this.checkAchievements();
            this.saveUserStats();
        });
    }

    visitSection(path) {
        const sectionMap = {
            '/': 'home',
            '/curiosidades': 'curiosidades',
            '/carbono': 'carbono',
            '/quiz': 'quiz',
            '/minha-conta': 'conta'
        };

        const section = sectionMap[path];
        if (section) {
            this.userStats.sectionsVisited.add(section);
            this.checkAchievements();
            this.saveUserStats();
        }
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && this.isAchievementUnlocked(achievement)) {
                this.unlockAchievement(achievement);
            }
        });
    }

    isAchievementUnlocked(achievement) {
        switch (achievement.id) {
            case 'first_carbon':
                return this.userStats.carbonCalculations >= 1;
            case 'carbon_warrior':
                return this.userStats.carbonCalculations >= 1; // Será verificado com valor real
            case 'quiz_master':
                return this.userStats.perfectQuizzes >= 1;
            case 'eco_explorer':
                return this.userStats.sectionsVisited.size >= 4;
            case 'carbon_zero':
                return this.userStats.carbonCalculations >= 1; // Será verificado com valor real
            default:
                return false;
        }
    }

    unlockAchievement(achievement) {
        achievement.unlocked = true;
        this.userStats.totalPoints += achievement.points;
        
        // Mostrar notificação de conquista
        if (window.notifications) {
            window.notifications.success(
                `🏆 Conquista Desbloqueada: ${achievement.name}!<br>${achievement.description}<br>+${achievement.points} pontos`,
                8000
            );
        }

        // Salvar estatísticas
        this.saveUserStats();
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: achievement
        }));
    }

    getTotalPoints() {
        return this.userStats.totalPoints;
    }

    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }

    getProgress() {
        const unlocked = this.getUnlockedAchievements().length;
        return {
            unlocked,
            total: this.achievements.length,
            percentage: Math.round((unlocked / this.achievements.length) * 100)
        };
    }

    // Método para verificar conquistas baseadas em valores específicos
    checkCarbonAchievement(carbonValue) {
        if (carbonValue <= 10 && !this.achievements.find(a => a.id === 'carbon_warrior')?.unlocked) {
            this.achievements.find(a => a.id === 'carbon_warrior').unlocked = true;
            this.userStats.totalPoints += 25;
            this.saveUserStats();
        }
        
        if (carbonValue <= 0 && !this.achievements.find(a => a.id === 'carbon_zero')?.unlocked) {
            this.achievements.find(a => a.id === 'carbon_zero').unlocked = true;
            this.userStats.totalPoints += 50;
            this.saveUserStats();
        }
    }
}

// Instância global
window.gamification = new GamificationSystem();

