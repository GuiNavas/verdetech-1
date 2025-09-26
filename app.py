from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import csv
import io
import os
import re
import logging
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='fecart', static_folder='fecart', static_url_path='')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Configuração do banco de dados para produção
if os.environ.get('RENDER'):
    # Em produção no Render
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///verdetch.db')
else:
    # Em desenvolvimento
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(os.path.dirname(__file__), "fecart", "instance", "verdetch.db")}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = SQLAlchemy(app)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Usuario {self.nome}>'

class Auth(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    usuario = db.relationship('Usuario', backref=db.backref('auth', uselist=False))

class PegadaCarbono(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    transporte = db.Column(db.Float, nullable=False)
    energia = db.Column(db.Float, nullable=False)
    alimentacao = db.Column(db.Integer, nullable=False)
    lixo = db.Column(db.Integer, nullable=False)
    total_co2 = db.Column(db.Float, nullable=False)
    data_calculo = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PegadaCarbono {self.total_co2} kg CO2>'

class ResultadoQuiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    pontuacao = db.Column(db.Integer, nullable=False)
    total_perguntas = db.Column(db.Integer, nullable=False)
    data_realizacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ResultadoQuiz {self.pontuacao}/{self.total_perguntas}>'

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    text = db.Column(db.Text)
    quiz_score = db.Column(db.Integer)
    quiz_total = db.Column(db.Integer)
    data_feedback = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Feedback {self.rating}/5 - {self.data_feedback}>'

# Lista de palavras proibidas (nomes preconceituosos e +18)
PROHIBITED_WORDS = [
    'admin', 'administrador', 'root', 'teste', 'test', 'user', 'usuario',
    'fuck', 'shit', 'bitch', 'asshole', 'idiot', 'stupid', 'dumb',
    'puta', 'puto', 'merda', 'caralho', 'porra', 'foda', 'foder',
    'idiota', 'burro', 'estupido', 'imbecil', 'retardado', 'mongol',
    'gay', 'lesbica', 'travesti', 'trans', 'viado', 'bicha',
    'preto', 'negro', 'branco', 'amarelo', 'indio', 'judeu', 'muculmana',
    'gordo', 'gorda', 'magro', 'magra', 'feio', 'feia', 'bonito', 'bonita',
    'sexo', 'porn', 'xxx', 'adulto', 'erotico', 'prostituta', 'puta',
    'drogas', 'maconha', 'cocaina', 'heroina', 'lsd', 'ecstasy'
]

def validate_name(name):
    """Valida se o nome não contém palavras proibidas"""
    name_lower = name.lower().strip()
    
    # Verificar palavras proibidas
    for word in PROHIBITED_WORDS:
        if word in name_lower:
            return False, f"Nome contém palavra inadequada: '{word}'"
    
    # Verificar se é muito curto
    if len(name.strip()) < 2:
        return False, "Nome deve ter pelo menos 2 caracteres"
    
    # Verificar se contém apenas letras e espaços
    if not re.match(r'^[a-zA-ZÀ-ÿ\s]+$', name):
        return False, "Nome deve conter apenas letras e espaços"
    
    return True, "Nome válido"

# Inicializar banco de dados com tratamento de erro
try:
    with app.app_context():
        db.create_all()
        logger.info("Banco de dados inicializado com sucesso")
except Exception as e:
    logger.error(f"Erro ao inicializar banco de dados: {e}")
    # Continuar mesmo com erro no banco

def login_required(fn):
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return redirect(url_for('login'))
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Erro ao renderizar index.html: {e}")
        return f"Erro ao carregar página: {str(e)}", 500

@app.route('/cadastro')
def cadastro():
    try:
        return render_template('cadastro.html')
    except Exception as e:
        logger.error(f"Erro ao renderizar cadastro.html: {e}")
        return f"Erro ao carregar página: {str(e)}", 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()
        auth = Auth.query.filter_by(username=username).first()
        if not auth:
            return render_template('login.html', error='Conta ainda não existe', email=username)
        if not check_password_hash(auth.password_hash, password):
            return render_template('login.html', error='Senha incorreta', email=username)
        session['user_id'] = auth.usuario_id
        session['username'] = auth.username
        session['nome'] = auth.usuario.nome
        return redirect(url_for('login_success'))
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nome = request.form.get('nome', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        
        if not (nome and email and password and confirm_password):
            return render_template('cadastro.html', error='Preencha todos os campos')
        
        # Validar nome
        is_valid_name, name_error = validate_name(nome)
        if not is_valid_name:
            return render_template('cadastro.html', error=name_error)
        
        if len(password) < 8:
            return render_template('cadastro.html', error='A senha deve ter ao menos 8 caracteres')
        if password.lower() == password or password.upper() == password:
            return render_template('cadastro.html', error='A senha deve conter letras maiúsculas e minúsculas')
        if password != confirm_password:
            return render_template('cadastro.html', error='As senhas não conferem')
        if Auth.query.filter_by(username=email).first():
            return render_template('cadastro.html', error='E-mail já está em uso')
        if Usuario.query.filter_by(email=email).first():
            return render_template('cadastro.html', error='E-mail já cadastrado')
        
        usuario = Usuario(nome=nome, email=email)
        db.session.add(usuario)
        db.session.flush()
        auth = Auth(usuario_id=usuario.id, username=email, password_hash=generate_password_hash(password))
        db.session.add(auth)
        db.session.commit()
        return redirect(url_for('register_success'))
    return redirect(url_for('cadastro'))

@app.route('/login-success')
def login_success():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    return render_template('login_success.html', nome=session.get('nome'), username=session.get('username'))

@app.route('/register-success')
def register_success():
    return render_template('register_success.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/minha-conta')
def minha_conta():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    usuario_id = session.get('user_id')
    usuario = Usuario.query.get(usuario_id)
    return render_template('minha_conta.html', usuario=usuario, email=session.get('username'))

@app.route('/api/me')
def api_me():
    if not session.get('user_id'):
        return jsonify({'authenticated': False})
    return jsonify({'authenticated': True, 'id': session['user_id'], 'username': session.get('username'), 'nome': session.get('nome')})

@app.route('/curiosidades')
def curiosidades():
    return render_template('curiosidades.html')

## Página maquete removida

@app.route('/carbono')
def carbono():
    return render_template('carbono.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/api/calcular-pegada', methods=['POST'])
def calcular_pegada():
    try:
        data = request.get_json()
        
        co2_transporte = data['transporte'] * 0.21
        co2_energia = data['energia'] * 0.5
        co2_alimentacao = data['alimentacao'] * 2.5
        co2_lixo = data['lixo'] * 10
        
        total_co2 = co2_transporte + co2_energia + co2_alimentacao + co2_lixo
        
        usuario_id = session.get('user_id')
        nova_pegada = PegadaCarbono(
            usuario_id=usuario_id,
            transporte=data['transporte'],
            energia=data['energia'],
            alimentacao=data['alimentacao'],
            lixo=data['lixo'],
            total_co2=total_co2
        )
        db.session.add(nova_pegada)
        db.session.commit()
        
        return jsonify({
            'transporte': round(co2_transporte, 2),
            'energia': round(co2_energia, 2),
            'alimentacao': round(co2_alimentacao, 2),
            'lixo': round(co2_lixo, 2),
            'total': round(total_co2, 2),
            'id': nova_pegada.id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/salvar-quiz', methods=['POST'])
def salvar_quiz():
    try:
        data = request.get_json()
        
        usuario_id = session.get('user_id')
        novo_resultado = ResultadoQuiz(
            usuario_id=usuario_id,
            pontuacao=data['pontuacao'],
            total_perguntas=data['total_perguntas']
        )
        db.session.add(novo_resultado)
        db.session.commit()
        
        return jsonify({
            'message': 'Resultado salvo com sucesso!',
            'id': novo_resultado.id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/admin/dados')
def admin_dados():
    pegadas = PegadaCarbono.query.all()
    resultados = ResultadoQuiz.query.all()
    
    dados = {
        'pegadas_carbono': [{
            'id': p.id,
            'transporte': p.transporte,
            'energia': p.energia,
            'alimentacao': p.alimentacao,
            'lixo': p.lixo,
            'total_co2': p.total_co2,
            'data_calculo': p.data_calculo.strftime('%Y-%m-%d %H:%M:%S')
        } for p in pegadas],
        'resultados_quiz': [{
            'id': r.id,
            'pontuacao': r.pontuacao,
            'total_perguntas': r.total_perguntas,
            'data_realizacao': r.data_realizacao.strftime('%Y-%m-%d %H:%M:%S')
        } for r in resultados]
    }
    
    return jsonify(dados)

@app.route('/admin/relatorio')
def admin_relatorio():
    relatorio = []
    usuarios = Usuario.db.session.query(Usuario).all() if hasattr(Usuario, 'db') else Usuario.query.all()
    for u in usuarios:
        pegada = (
            PegadaCarbono.query
            .filter_by(usuario_id=u.id)
            .order_by(PegadaCarbono.data_calculo.desc(), PegadaCarbono.id.desc())
            .first()
        )
        quiz = (
            ResultadoQuiz.query
            .filter_by(usuario_id=u.id)
            .order_by(ResultadoQuiz.data_realizacao.desc(), ResultadoQuiz.id.desc())
            .first()
        )
        feedback = (
            Feedback.query
            .filter_by(usuario_id=u.id)
            .order_by(Feedback.data_feedback.desc(), Feedback.id.desc())
            .first()
        )
        relatorio.append({
            'id': u.id,
            'nome': u.nome,
            'email': u.email,
            'data_cadastro': u.data_cadastro.strftime('%Y-%m-%d %H:%M:%S') if u.data_cadastro else None,
            'pegada_total_co2': round(pegada.total_co2, 2) if pegada else None,
            'quiz_pontuacao': quiz.pontuacao if quiz else None,
            'quiz_total_perguntas': quiz.total_perguntas if quiz else None,
            'ultima_pegada': pegada.data_calculo.strftime('%Y-%m-%d %H:%M:%S') if pegada else None,
            'ultimo_quiz': quiz.data_realizacao.strftime('%Y-%m-%d %H:%M:%S') if quiz else None,
            'ultimo_feedback': feedback.data_feedback.strftime('%Y-%m-%d %H:%M:%S') if feedback else None
        })
    return jsonify(relatorio)

@app.route('/admin/relatorio.csv')
def admin_relatorio_csv():
    rows = []
    usuarios = Usuario.query.all()
    for u in usuarios:
        pegada = (
            PegadaCarbono.query
            .filter_by(usuario_id=u.id)
            .order_by(PegadaCarbono.data_calculo.desc(), PegadaCarbono.id.desc())
            .first()
        )
        quiz = (
            ResultadoQuiz.query
            .filter_by(usuario_id=u.id)
            .order_by(ResultadoQuiz.data_realizacao.desc(), ResultadoQuiz.id.desc())
            .first()
        )
        rows.append({
            'id': u.id,
            'nome': u.nome,
            'email': u.email,
            'pegada_total_co2': round(pegada.total_co2, 2) if pegada else '',
            'quiz_pontuacao': quiz.pontuacao if quiz else '',
            'quiz_total_perguntas': quiz.total_perguntas if quiz else ''
        })

    output = io.StringIO()
    fieldnames = ['id', 'nome', 'email', 'pegada_total_co2', 'quiz_pontuacao', 'quiz_total_perguntas']
    writer = csv.DictWriter(output, fieldnames=fieldnames, delimiter=';')
    writer.writeheader()
    for r in rows:
        writer.writerow(r)

    csv_data = output.getvalue()
    output.close()

    from flask import Response
    return Response(
        csv_data,
        mimetype='text/csv; charset=utf-8',
        headers={
            'Content-Disposition': 'attachment; filename="relatorio_verdetech.csv"'
        }
    )

@app.route('/conquistas')
@login_required
def conquistas():
    return render_template('conquistas.html')

@app.route('/api/feedback', methods=['GET'])
@login_required
def buscar_feedback():
    try:
        usuario_id = session.get('user_id')
        if not usuario_id:
            return jsonify({'error': 'Usuário não autenticado'}), 401
        
        feedback = Feedback.query.filter_by(usuario_id=usuario_id).first()
        
        if feedback:
            return jsonify({
                'id': feedback.id,
                'rating': feedback.rating,
                'text': feedback.text,
                'quiz_score': feedback.quiz_score,
                'quiz_total': feedback.quiz_total,
                'data_feedback': feedback.data_feedback.strftime('%Y-%m-%d %H:%M:%S')
            })
        else:
            return jsonify(None)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/feedback', methods=['POST'])
def salvar_feedback():
    try:
        data = request.get_json()
        
        usuario_id = session.get('user_id')
        if not usuario_id:
            return jsonify({'error': 'Usuário não autenticado'}), 401
        
        # Verificar se já existe um feedback deste usuário
        feedback_existente = Feedback.query.filter_by(usuario_id=usuario_id).first()
        
        if feedback_existente:
            # Atualizar feedback existente
            feedback_existente.rating = data['rating']
            feedback_existente.text = data.get('text', '')
            feedback_existente.quiz_score = data.get('quiz_score')
            feedback_existente.quiz_total = data.get('quiz_total')
            feedback_existente.data_feedback = datetime.utcnow()
            
            db.session.commit()
            
            return jsonify({
                'message': 'Feedback atualizado com sucesso!',
                'id': feedback_existente.id,
                'updated': True
            })
        else:
            # Criar novo feedback
            novo_feedback = Feedback(
                usuario_id=usuario_id,
                rating=data['rating'],
                text=data.get('text', ''),
                quiz_score=data.get('quiz_score'),
                quiz_total=data.get('quiz_total')
            )
            db.session.add(novo_feedback)
            db.session.commit()
            
            return jsonify({
                'message': 'Feedback salvo com sucesso!',
                'id': novo_feedback.id,
                'updated': False
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/admin/feedbacks')
@login_required
def admin_feedbacks():
    # Verificar se é o admin autorizado
    if session.get('username') != 'guinavasconi@gmail.com':
        return jsonify({'error': 'Acesso negado'}), 403
    
    feedbacks = db.session.query(Feedback, Usuario).join(Usuario, Feedback.usuario_id == Usuario.id).all()
    
    dados = []
    for feedback, usuario in feedbacks:
        dados.append({
            'id': feedback.id,
            'usuario_nome': usuario.nome,
            'rating': feedback.rating,
            'text': feedback.text,
            'quiz_score': feedback.quiz_score,
            'quiz_total': feedback.quiz_total,
            'data_feedback': feedback.data_feedback.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify(dados)

@app.route('/admin/delete-activities/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user_activities(user_id):
    # Verificar se é o admin autorizado
    if session.get('username') != 'guinavasconi@gmail.com':
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        # Excluir pegadas de carbono
        PegadaCarbono.query.filter_by(usuario_id=user_id).delete()
        
        # Excluir resultados de quiz
        ResultadoQuiz.query.filter_by(usuario_id=user_id).delete()
        
        # Excluir feedbacks
        Feedback.query.filter_by(usuario_id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({'message': 'Atividades excluídas com sucesso'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/admin/delete-user/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    # Verificar se é o admin autorizado
    if session.get('username') != 'guinavasconi@gmail.com':
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        # Primeiro excluir todas as atividades (cascade)
        PegadaCarbono.query.filter_by(usuario_id=user_id).delete()
        ResultadoQuiz.query.filter_by(usuario_id=user_id).delete()
        Feedback.query.filter_by(usuario_id=user_id).delete()
        
        # Depois excluir o usuário
        Usuario.query.filter_by(id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({'message': 'Usuário excluído com sucesso'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/admin/delete-feedback/<int:feedback_id>', methods=['DELETE'])
@login_required
def delete_feedback(feedback_id):
    # Verificar se é o admin autorizado
    if session.get('username') != 'guinavasconi@gmail.com':
        return jsonify({'error': 'Acesso negado'}), 403
    
    try:
        Feedback.query.filter_by(id=feedback_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Feedback excluído com sucesso'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/admin')
@login_required
def admin():
    # Verificar se é o admin autorizado
    if session.get('username') != 'guinavasconi@gmail.com':
        return redirect(url_for('index'))
    return render_template('admin.html')

@app.route('/health')
def health_check():
    """Health check para o Render"""
    return jsonify({'status': 'ok', 'message': 'Aplicação funcionando'})

@app.route('/test')
def test():
    """Rota de teste simples"""
    return "Aplicação funcionando! Teste OK."

@app.route('/static/<path:filename>')
def static_files(filename):
    """Servir arquivos estáticos"""
    return app.send_static_file(filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)