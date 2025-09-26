# VERDETECH - Cidade Sustentável do Futuro

Um projeto inovador que une tecnologia, educação e sustentabilidade para criar cidades e cidadãos mais conscientes e responsáveis com o meio ambiente.

## 🚀 Funcionalidades

- **Calculadora de Pegada de Carbono**: Calcule sua pegada de carbono mensal
- **Quiz Interativo**: Teste seus conhecimentos sobre sustentabilidade
- **Sistema de Feedback**: Avalie sua experiência no site
- **Painel Administrativo**: Gerencie usuários e dados (acesso restrito)
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Banco de Dados**: SQLite
- **Deploy**: Render.com

## 📱 Responsividade

O projeto foi otimizado para funcionar perfeitamente em:
- **Desktop** (1200px+): Navegação em retângulos grandes
- **Tablet** (768px - 1199px): Navegação compacta
- **Mobile** (até 767px): Navegação otimizada para touch

## 🔧 Instalação Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Execute o servidor:
   ```bash
   python app.py
   ```
4. Acesse: `http://localhost:5000`

## 🌐 Deploy no Render

### Método 1: Deploy Automático (Recomendado)

1. **Conecte seu repositório GitHub ao Render:**
   - Acesse [render.com](https://render.com)
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Selecione o repositório `verdetech-2-main`

2. **Configurações automáticas:**
   - O Render detectará automaticamente o `render.yaml`
   - Todas as configurações serão aplicadas automaticamente
   - Deploy será feito automaticamente a cada push

### Método 2: Deploy Manual

1. **Configure o serviço:**
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --bind 0.0.0.0:$PORT app:app`
   - **Python Version:** 3.11.0

2. **Variáveis de ambiente:**
   - `SECRET_KEY`: Será gerada automaticamente
   - `DATABASE_URL`: `sqlite:///verdetch.db`
   - `PYTHON_VERSION`: `3.11.0`

3. **Health Check:**
   - **Health Check Path:** `/health`

### 🚀 Comandos para Deploy

```bash
# 1. Adicionar arquivos ao git
git add .

# 2. Fazer commit
git commit -m "Deploy configuration for Render"

# 3. Enviar para GitHub
git push origin main

# 4. O Render fará deploy automaticamente!
```

### 📋 Checklist de Deploy

- ✅ `render.yaml` configurado
- ✅ `requirements.txt` atualizado
- ✅ `Procfile` configurado
- ✅ `runtime.txt` com Python 3.11.0
- ✅ Health check endpoint `/health`
- ✅ Tratamento de erro nas rotas
- ✅ Menu hambúrguer funcionando
- ✅ Logo responsiva
- ✅ CSS otimizado para mobile

## 👤 Acesso Administrativo

- **Email**: guinavasconi@gmail.com
- **Acesso**: Clique no logo da VERDETECH quando logado

## 📊 Estrutura do Projeto

```
VERDETECH-main/
├── app.py                 # Aplicação Flask principal
├── requirements.txt       # Dependências Python
├── Procfile              # Configuração para Render
├── runtime.txt           # Versão do Python
└── fecart/               # Pasta de templates e estáticos
    ├── *.html           # Templates HTML
    ├── *.js             # Scripts JavaScript
    ├── style.css        # Estilos CSS
    ├── imagens/         # Imagens do projeto
    └── instance/        # Banco de dados SQLite
```

## 🎯 Objetivos de Desenvolvimento Sustentável (ODS)

O projeto está alinhado com os ODS da ONU:
- **ODS 4**: Educação de qualidade
- **ODS 11**: Cidades e comunidades sustentáveis
- **ODS 12**: Consumo e produção responsáveis
- **ODS 13**: Ação contra a mudança global do clima

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais e de conscientização ambiental.

