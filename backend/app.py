from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import uuid

# Inicializamos la aplicación Flask
app = Flask(__name__)

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
db_uri = 'postgresql://quiz_user:123@localhost:5432/quiz_db'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializamos SQLAlchemy con nuestra aplicación Flask
db = SQLAlchemy(app)


# --- MODELOS DE LA BASE DE DATOS ---

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    share_code = db.Column(db.String(6), unique=True, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade="all, delete-orphan")

    def __init__(self, title):
        self.title = title
        self.share_code = str(uuid.uuid4().hex)[:6]

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(255), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    options = db.relationship('Option', backref='question', lazy=True, cascade="all, delete-orphan")

class Option(db.Model):
    __tablename__ = 'options'
    id = db.Column(db.Integer, primary_key=True)
    option_text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)


# --- RUTAS DE LA API ---

@app.route('/api/ping', methods=['GET'])
def ping_pong():
    return jsonify({"message": "pong!"})

@app.route('/api/db-check', methods=['GET'])
def db_check():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({"message": "Database connection successful!"})
    except Exception as e:
        return jsonify({"message": "Database connection failed!", "error": str(e)}), 500

@app.route('/api/quizzes', methods=['POST'])
def create_quiz():
    data = request.get_json()
    if not data or not 'title' in data or not 'questions' in data:
        return jsonify({"error": "Datos de entrada inválidos. Se requiere 'title' y 'questions'."}), 400
    try:
        new_quiz = Quiz(title=data['title'])
        db.session.add(new_quiz)
        for q_data in data['questions']:
            new_question = Question(question_text=q_data['question_text'], quiz=new_quiz)
            db.session.add(new_question)
            for o_data in q_data['options']:
                new_option = Option(
                    option_text=o_data['option_text'],
                    is_correct=o_data['is_correct'],
                    question=new_question
                )
                db.session.add(new_option)
        db.session.commit()
        return jsonify({
            "message": "Quiz creado exitosamente!",
            "share_code": new_quiz.share_code,
            "quiz_id": new_quiz.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Falló la creación del quiz", "details": str(e)}), 500

# NUEVA RUTA: Para obtener un quiz por su código para compartir
@app.route('/api/quizzes/<string:share_code>', methods=['GET'])
def get_quiz_by_share_code(share_code):
    # 1. Buscamos el quiz en la base de datos usando el share_code.
    # .first_or_404() es muy útil: si no encuentra nada, automáticamente devuelve un error 404 (No Encontrado).
    quiz = Quiz.query.filter_by(share_code=share_code).first_or_404()

    # 2. Convertimos los datos del quiz y sus relaciones a un formato de diccionario (JSON).
    # IMPORTANTE: No enviamos la respuesta correcta (is_correct) al estudiante.
    # La lógica de calificación se debe hacer siempre en el backend.
    quiz_data = {
        "title": quiz.title,
        "share_code": quiz.share_code,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "options": [
                    {
                        "id": o.id,
                        "option_text": o.option_text
                    } for o in q.options
                ]
            } for q in quiz.questions
        ]
    }
    
    return jsonify(quiz_data)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, port=5000)