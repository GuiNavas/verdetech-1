document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const carbonResult = document.getElementById('carbon-result');
    const resultMessage = document.getElementById('result-message');
    const tipsContainer = document.getElementById('tips-container');
    
    calculateBtn.addEventListener('click', async function() {

        const energy = parseFloat(document.getElementById('energy').value) || 0;
        const transport = parseFloat(document.getElementById('transport').value) || 0;
        const meat = parseFloat(document.getElementById('meat').value) || 0;
        const waste = parseFloat(document.getElementById('waste').value) || 0;
        const flights = parseFloat(document.getElementById('flights').value) || 0;
        
        const energyFootprint = energy * 0.5 * 12; 
        const transportFootprint = transport * 0.2 * 12; 
        const meatFootprint = meat * 15 * 52; 
        const wasteFootprint = waste * 2 * 52; 
        const flightsFootprint = flights * 1000;
        
        const totalFootprint = (energyFootprint + transportFootprint + meatFootprint + wasteFootprint + flightsFootprint) / 1000;
        
        carbonResult.textContent = totalFootprint.toFixed(2) + ' toneladas de CO₂/ano';
        
        let name = '';
        try {
            const me = await fetch('/api/me').then(r=>r.json());
            if (me && me.authenticated) name = me.nome || me.username || '';
        } catch(e) {}
        if (totalFootprint < 4) {
            resultMessage.textContent = `Parabéns${name ? ', ' + name : ''}! Sua pegada de carbono está abaixo da média.`;
            resultMessage.style.backgroundColor = '#4CAF50';
            resultMessage.style.color = 'white';
        } else if (totalFootprint < 8) {
            resultMessage.textContent = `Sua pegada${name ? ', ' + name : ''} está na média. Há espaço para melhorias!`;
            resultMessage.style.backgroundColor = '#FFC107';
            resultMessage.style.color = 'black';
        } else {
            resultMessage.textContent = `Sua pegada está acima da média${name ? ', ' + name : ''}. Considere mudar alguns hábitos.`;
            resultMessage.style.backgroundColor = '#F44336';
            resultMessage.style.color = 'white';
        }
        
        // Personalizar dicas com base nos hábitos informados e no resultado
        const tips = [];
        // Categoria geral
        if (totalFootprint < 4) {
            tips.push('Continue com seus bons hábitos e inspire outras pessoas ao seu redor.');
        } else if (totalFootprint < 8) {
            tips.push('Você está na média: escolha 1–2 áreas para melhorar nesta semana.');
        } else {
            tips.push('Foque em 2–3 mudanças de maior impacto primeiro (transporte e energia).');
        }

        // Energia
        if (energy > 180 || energyFootprint > 900) {
            tips.push('Troque lâmpadas por LED e desligue aparelhos em stand-by.');
            tips.push('Ajuste a geladeira para temperaturas econômicas e aproveite luz natural.');
        }
        // Transporte
        if (transport > 400 || transportFootprint > 800) {
            tips.push('Use transporte público, carona ou bicicleta em trajetos curtos.');
            tips.push('Planeje rotas para reduzir quilômetros mensais e combine tarefas em uma única saída.');
        }
        // Alimentação
        if (meat >= 7) {
            tips.push('Adote 2–3 refeições sem carne por semana e prefira proteínas vegetais.');
            tips.push('Compre alimentos locais e sazonais para reduzir emissões do transporte.');
        }
        // Lixo
        if (waste > 6) {
            tips.push('Separe recicláveis (papel, vidro, metal, plásticos) e reduza descartáveis.');
            tips.push('Composte resíduos orgânicos para diminuir o lixo enviado ao aterro.');
        }
        // Voos
        if (flights >= 1) {
            tips.push('Agrupe viagens e avalie compensação de carbono ao voar.');
        }

        // Renderizar dicas no container existente (sem alterar CSS)
        const tipsTitle = '<h4>Dicas para reduzir sua pegada:</h4>';
        const tipsList = '<ul>' + tips.map(t => '<li>' + t + '</li>').join('') + '</ul>';
        tipsContainer.innerHTML = tipsTitle + tipsList;

        resultContainer.style.display = 'block';
        tipsContainer.style.display = 'block';

        try {
            await fetch('/api/calcular-pegada', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transporte: transport, // km/mês
                    energia: energy, // kWh/mês
                    alimentacao: Math.round(meat), // refeições c/ carne por semana
                    lixo: Math.round(waste) // kg/semana
                })
            });
        } catch (e) {}
        
        // Disparar evento de gamificação
        document.dispatchEvent(new CustomEvent('carbonCalculated', {
            detail: { total: totalCO2 }
        }));
        
        // Verificar conquistas baseadas no valor de carbono
        if (window.gamification) {
            window.gamification.checkCarbonAchievement(totalCO2);
        }
        
        // Mostrar notificação de sucesso
        if (window.notifications) {
            window.notifications.success(
                `Pegada de carbono calculada: ${totalCO2.toFixed(2)} kg CO2/mês`,
                5000
            );
        }
    });
});