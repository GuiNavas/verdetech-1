// Sistema de Acesso Secreto para Admin
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar evento de clique no botão secreto
    const secretBtn = document.querySelector('.admin-secret-btn');
    if (secretBtn) {
        // Tornar o botão visível e clicável
        secretBtn.style.display = 'block';
        secretBtn.style.position = 'absolute';
        secretBtn.style.top = '0';
        secretBtn.style.left = '0';
        secretBtn.style.width = '100%';
        secretBtn.style.height = '100%';
        secretBtn.style.background = 'transparent';
        secretBtn.style.border = 'none';
        secretBtn.style.cursor = 'pointer';
        secretBtn.style.zIndex = '10';
        
        secretBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSecretAdminAccess();
        });
    }
});

async function checkAdminAccess() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        const secretBtn = document.querySelector('.admin-secret-btn');
        if (!secretBtn) return;
        
        if (data.authenticated && data.username === 'guinavasconi@gmail.com') {
            // Usuário é admin - mostrar botão secreto
            secretBtn.style.display = 'block';
            secretBtn.style.opacity = '0';
            addAdminVisualIndicator();
        } else {
            // Usuário não é admin - esconder botão
            secretBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao verificar acesso admin:', error);
        // Em caso de erro, esconder o botão
        const secretBtn = document.querySelector('.admin-secret-btn');
        if (secretBtn) {
            secretBtn.style.display = 'none';
        }
    }
}

function addAdminVisualIndicator() {
    // Adicionar indicador visual sutil para admin
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.style.position = 'relative';
        
        // Adicionar um pequeno indicador visual
        const indicator = document.createElement('div');
        indicator.className = 'admin-indicator';
        indicator.innerHTML = '🔐';
        indicator.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 5;
        `;
        
        logoContainer.appendChild(indicator);
        
        // Mostrar indicador no hover
        logoContainer.addEventListener('mouseenter', function() {
            indicator.style.opacity = '0.7';
        });
        
        logoContainer.addEventListener('mouseleave', function() {
            indicator.style.opacity = '0';
        });
    }
}

async function handleSecretAdminAccess() {
    try {
        // Verificar se é admin pelo email
        const email = prompt('Digite seu email para acessar a área administrativa:');
        
        if (email && email.toLowerCase() === 'guinavasconi@gmail.com') {
            // Redirecionar para admin
            window.location.href = '/admin';
        } else if (email) {
            // Mostrar mensagem de acesso negado
            alert('Acesso negado. Esta funcionalidade é restrita a administradores.');
        }
    } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        alert('Erro ao verificar permissões de acesso.');
    }
}

