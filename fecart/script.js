document.addEventListener('DOMContentLoaded', function() {
     const protectedPages = ['carbono.html', 'quiz.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        checkAuthentication();
    }
    // Header scroll behavior
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - hide header
            header.classList.add('hidden');
        } else {
            // Scrolling up - show header
            header.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
    
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            document.querySelector('nav').classList.toggle('active');
        });
    }
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            document.querySelector('nav').classList.remove('active');
        });
    });

    fetch('/api/me').then(r=>r.json()).then(me => {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const container = document.getElementById('nav-auth');
        if (!container) return; 
        container.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'nav-auth-wrap';
        span.style.display = 'flex';
        span.style.alignItems = 'center';
        span.style.gap = '10px';
        if (me && me.authenticated) {
            const greet = document.createElement('span');
            greet.textContent = `Olá, ${me.nome || me.username}`;
            const logout = document.createElement('a');
            logout.href = '/logout';
            logout.textContent = 'Sair';
            logout.className = 'btn-auth';
            span.appendChild(greet);
            span.appendChild(logout);
        } else {
            const login = document.createElement('a');
            login.href = '/login';
            login.textContent = 'Entrar';
            login.className = 'btn-auth';
            const register = document.createElement('a');
            register.href = '/register';
            register.textContent = 'Cadastrar';
            register.className = 'btn-auth';
            span.appendChild(login);
            span.appendChild(register);
        }
        container.appendChild(span);
    }).catch(()=>{});
    const carbonoForm = document.getElementById('carbono-form');
    if (carbonoForm) {
        carbonoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                transporte: parseFloat(document.getElementById('transporte').value),
                energia: parseFloat(document.getElementById('energia').value),
                alimentacao: parseInt(document.getElementById('alimentacao').value),
                lixo: parseInt(document.getElementById('lixo').value)
            };
            
            try {
                const response = await fetch('/api/calcular-pegada', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    const me = await fetch('/api/me').then(r=>r.json()).catch(()=>({}));
                    const nome = me && me.authenticated ? me.nome || me.username : '';
                    document.getElementById('resultado-valor').textContent = `${data.total} kg CO₂/ano`;
                    document.getElementById('resultado').style.display = 'block';
        
                    let mensagem = '';
                    if (data.total < 2000) {
                        mensagem = `Parabéns${nome ? ', ' + nome : ''}! Sua pegada de carbono está abaixo da média brasileira.`;
                    } else if (data.total < 4800) {
                        mensagem = `Sua pegada${nome ? ', ' + nome : ''} está próxima da média brasileira. Há espaço para melhorias!`;
                    } else {
                        mensagem = `Sua pegada de carbono está acima da média${nome ? ', ' + nome : ''}. Veja nossas dicas para reduzir.`;
                    }
                    document.getElementById('resultado-mensagem').textContent = mensagem;
                    
                    const dicasLista = document.getElementById('dicas-lista');
                    dicasLista.innerHTML = '';
                    
                    const dicas = [
                        'Use transporte público ou bicicleta sempre que possível',
                        'Substitua lâmpadas incandescentes por LED',
                        'Reduza o consumo de carne vermelha',
                        'Separe o lixo para reciclagem',
                        'Desligue aparelhos eletrônicos quando não estiver usando'
                    ];
                    
                    dicas.forEach(dica => {
                        const li = document.createElement('li');
                        li.textContent = dica;
                        dicasLista.appendChild(li);
                    });
                } else {
                    alert('Erro ao calcular pegada de carbono: ' + data.error);
                }
            } catch (error) {
                alert('Erro ao conectar com o servidor.');
                console.error(error);
            }
        });
    }
});
async function checkAuthentication() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();
        
        if (!data.authenticated) {
            // Redirecionar para cadastro se não estiver autenticado
            if (window.notifications) {
                window.notifications.info('Faça login para acessar esta página', 3000);
            }
            setTimeout(() => {
                window.location.href = '/cadastro';
            }, 2000);
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = '/cadastro';
    }
}
