document.addEventListener('DOMContentLoaded', function() {
    // Verificar se é admin
    checkAdminAccess();
    
    // Carregar dados iniciais
    loadAdminData();
    
    // Event listeners
    document.getElementById('refresh-data').addEventListener('click', loadAdminData);
    document.getElementById('export-csv').addEventListener('click', exportToCSV);
});

async function checkAdminAccess() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (!data.authenticated || data.username !== 'guinavasconi@gmail.com') {
            alert('Acesso negado. Esta página é restrita a administradores.');
            window.location.href = '/';
            return;
        }
    } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        window.location.href = '/';
    }
}

async function loadAdminData() {
    try {
        // Carregar dados do relatório
        const response = await fetch('/admin/relatorio');
        const data = await response.json();
        
        // Atualizar estatísticas
        updateStats(data);
        
        // Atualizar tabela
        updateTable(data);
        
        // Atualizar gráfico
        updateChart(data);
        
        // Carregar feedbacks
        loadFeedbacks();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados administrativos');
    }
}

async function loadFeedbacks() {
    try {
        const response = await fetch('/admin/feedbacks');
        const feedbacks = await response.json();
        updateFeedbackTable(feedbacks);
    } catch (error) {
        console.error('Erro ao carregar feedbacks:', error);
    }
}

function updateFeedbackTable(feedbacks) {
    const tbody = document.getElementById('feedback-tbody');
    tbody.innerHTML = '';
    
    feedbacks.forEach(feedback => {
        const row = document.createElement('tr');
        
        // Criar emoji baseado na avaliação
        const emojiMap = {
            1: '😞',
            2: '😐', 
            3: '😑',
            4: '😊',
            5: '😄'
        };
        
        const emoji = emojiMap[feedback.rating] || '😐';
        const comment = feedback.text ? 
            (feedback.text.length > 50 ? feedback.text.substring(0, 50) + '...' : feedback.text) : 
            'Sem comentário';
        
        // Formatar horário do feedback
        const formatDateTime = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        row.innerHTML = `
            <td>${feedback.id}</td>
            <td>${feedback.usuario_nome || 'N/A'}</td>
            <td>${emoji} (${feedback.rating}/5)</td>
            <td title="${feedback.text || ''}">${comment}</td>
            <td>${feedback.quiz_score ? `${feedback.quiz_score}/${feedback.quiz_total}` : 'N/A'}</td>
            <td>${formatDateTime(feedback.data_feedback)}</td>
            <td>
                <button class="btn-delete-feedback" onclick="deleteFeedback(${feedback.id}, '${feedback.usuario_nome || 'N/A'}')" title="Excluir feedback">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats(data) {
    const totalUsers = data.length;
    const totalCarbon = data.filter(u => u.pegada_total_co2 !== null).length;
    const totalQuizzes = data.filter(u => u.quiz_pontuacao !== null).length;
    
    const avgCarbon = data
        .filter(u => u.pegada_total_co2 !== null)
        .reduce((sum, u) => sum + u.pegada_total_co2, 0) / totalCarbon || 0;
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-carbon').textContent = totalCarbon;
    document.getElementById('total-quizzes').textContent = totalQuizzes;
    document.getElementById('avg-carbon').textContent = avgCarbon.toFixed(2);
}

function updateTable(data) {
    const tbody = document.getElementById('participants-tbody');
    tbody.innerHTML = '';
    
    data.forEach(user => {
        const row = document.createElement('tr');
        
        // Formatar horários
        const formatDateTime = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${formatDateTime(user.data_cadastro)}</td>
            <td>${user.pegada_total_co2 ? user.pegada_total_co2 + ' kg' : 'N/A'}</td>
            <td>${user.quiz_pontuacao ? `${user.quiz_pontuacao}/${user.quiz_total_perguntas}` : 'N/A'}</td>
            <td>${formatDateTime(user.ultima_pegada)}</td>
            <td>${formatDateTime(user.ultimo_quiz)}</td>
            <td>${formatDateTime(user.ultimo_feedback)}</td>
            <td>
                <button class="btn-delete-activities" onclick="deleteUserActivities(${user.id}, '${user.nome}')" title="Excluir atividades">
                    <i class="fas fa-trash-alt"></i> Atividades
                </button>
                <button class="btn-delete-user" onclick="deleteUser(${user.id}, '${user.nome}')" title="Excluir usuário">
                    <i class="fas fa-user-times"></i> Usuário
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateChart(data) {
    const ctx = document.getElementById('carbon-chart').getContext('2d');
    
    // Categorizar pegadas de carbono
    const categories = {
        'Baixa (0-5 kg)': 0,
        'Média (5-15 kg)': 0,
        'Alta (15-30 kg)': 0,
        'Muito Alta (30+ kg)': 0
    };
    
    data.forEach(user => {
        if (user.pegada_total_co2 !== null) {
            const co2 = user.pegada_total_co2;
            if (co2 <= 5) categories['Baixa (0-5 kg)']++;
            else if (co2 <= 15) categories['Média (5-15 kg)']++;
            else if (co2 <= 30) categories['Alta (15-30 kg)']++;
            else categories['Muito Alta (30+ kg)']++;
        }
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#4CAF50',
                    '#FFC107',
                    '#FF9800',
                    '#F44336'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Distribuição das Pegadas de Carbono'
                }
            }
        }
    });
}

function exportToCSV() {
    window.open('/admin/relatorio.csv', '_blank');
}

// Funções de exclusão
async function deleteUserActivities(userId, userName) {
    if (!confirm(`Tem certeza que deseja excluir TODAS as atividades de ${userName}?\n\nIsso inclui:\n- Pegadas de carbono\n- Resultados de quiz\n- Feedbacks\n\nO usuário precisará fazer login novamente.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/delete-activities/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Atividades excluídas com sucesso!');
            loadData();
            loadFeedbacks();
        } else {
            const error = await response.json();
            alert('Erro ao excluir atividades: ' + error.error);
        }
    } catch (error) {
        alert('Erro ao excluir atividades: ' + error.message);
    }
}

async function deleteUser(userId, userName) {
    if (!confirm(`⚠️ ATENÇÃO: Tem certeza que deseja excluir COMPLETAMENTE o usuário ${userName}?\n\nIsso irá excluir:\n- Dados do usuário\n- Todas as atividades\n- Todos os feedbacks\n\nEsta ação é IRREVERSÍVEL!`)) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/delete-user/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Usuário excluído com sucesso!');
            loadData();
            loadFeedbacks();
        } else {
            const error = await response.json();
            alert('Erro ao excluir usuário: ' + error.error);
        }
    } catch (error) {
        alert('Erro ao excluir usuário: ' + error.message);
    }
}

async function deleteFeedback(feedbackId, userName) {
    if (!confirm(`Tem certeza que deseja excluir o feedback de ${userName}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/delete-feedback/${feedbackId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Feedback excluído com sucesso!');
            loadFeedbacks();
        } else {
            const error = await response.json();
            alert('Erro ao excluir feedback: ' + error.error);
        }
    } catch (error) {
        alert('Erro ao excluir feedback: ' + error.message);
    }
}
