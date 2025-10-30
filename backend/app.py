from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import uuid
from flask_cors import CORS # 1. Importar la librería

# Inicializamos la aplicación Flask
app = Flask(__name__)

# 2. Configurar CORS
# Esto le dice a nuestra API que acepte peticiones de cualquier ruta que empiece con /api/
# y que provengan específicamente del origen donde correrá nuestra app de React.
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
db_uri = 'postgresql://quiz_user:123@localhost:5432/quiz_db'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializamos SQLAlchemy con nuestra aplicación Flask
db = SQLAlchemy(app)


# --- MODELOS DE LA BASE DE DATOS ---
# (El código de los modelos sigue siendo exactamente el mismo, no lo repito aquí por brevedad,
# pero en tu archivo debe estar presente)

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
# (Todas las rutas de la API siguen siendo las mismas)

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

@app.route('/api/quizzes/<string:share_code>', methods=['GET'])
def get_quiz_by_share_code(share_code):
    quiz = Quiz.query.filter_by(share_code=share_code).first_or_404()
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

@app.route('/api/quizzes/<string:share_code>/submit', methods=['POST'])
def submit_quiz(share_code):
    data = request.get_json()
    if not data or 'answers' not in data:
        return jsonify({"error": "Se requiere un objeto con 'answers'."}), 400
    
    quiz = Quiz.query.filter_by(share_code=share_code).first_or_404()
    
    correct_answers = {}
    for question in quiz.questions:
        for option in question.options:
            if option.is_correct:
                correct_answers[question.id] = option.id
                break

    score = 0
    results = []
    user_answers = data['answers']

    for answer in user_answers:
        question_id = answer.get('question_id')
        option_id = answer.get('option_id')
        
        is_user_correct = False
        if question_id in correct_answers and correct_answers[question_id] == option_id:
            score += 1
            is_user_correct = True
        
        results.append({
            "question_id": question_id,
            "correct_option_id": correct_answers.get(question_id),
            "user_option_id": option_id,
            "is_correct": is_user_correct
        })

    return jsonify({
        "score": score,
        "total_questions": len(quiz.questions),
        "results": results
    })


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, port=5000)