from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import uuid
from flask_cors import CORS
import datetime
import os
import json
from dotenv import load_dotenv
import openai
from flask_migrate import Migrate

# Inicialización y Configuración
app = Flask(__name__)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
CORS(app, resources={r"/api/*": {"origins": FRONTEND_URL}})
# Usamos la variable de entorno DATABASE_URL. Si no existe, usamos la de localhost.
db_uri = os.getenv('DATABASE_URL', 'postgresql://quiz_user:123@localhost:5432/quiz_db')
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- Configuración de OpenRouter ---
load_dotenv()
client = openai.OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
)

# --- Modelos de la Base de Datos ---

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    share_code = db.Column(db.String(6), unique=True, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade="all, delete-orphan")
    scores = db.relationship('Score', backref='quiz', lazy=True, cascade="all, delete-orphan")

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

class Score(db.Model):
    __tablename__ = 'scores'
    id = db.Column(db.Integer, primary_key=True)
    player_name = db.Column(db.String(50), nullable=False, default='Anónimo') 
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    submitted_at = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)

# --- Rutas de la API (Endpoints) ---

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

# Endpoint para obtener TODOS los quizzes (para el dashboard del profesor)
@app.route('/api/quizzes', methods=['GET'])
def get_all_quizzes():
    quizzes = Quiz.query.order_by(Quiz.id.desc()).all()
    quizzes_list = [
        {
            'id': quiz.id,
            'title': quiz.title,
            'share_code': quiz.share_code,
            'question_count': len(quiz.questions)
        }
        for quiz in quizzes
    ]
    return jsonify(quizzes_list)

# Endpoint para CREAR un nuevo quiz
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

# Endpoint para OBTENER un quiz específico para jugar
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
                    { "id": o.id, "option_text": o.option_text } for o in q.options
                ]
            } for q in quiz.questions
        ]
    }
    return jsonify(quiz_data)

# Endpoint para ENVIAR respuestas y calificar
@app.route('/api/quizzes/<string:share_code>/submit', methods=['POST'])
def submit_quiz(share_code):
    data = request.get_json()
    if not data or 'answers' not in data:
        return jsonify({"error": "Se requiere un objeto con 'answers'."}), 400
    
    quiz = Quiz.query.filter_by(share_code=share_code).first_or_404()
    
    correct_answers = {q.id: next(o.id for o in q.options if o.is_correct) for q in quiz.questions}
    
    score_count = 0
    user_answers = data['answers']
    for answer in user_answers:
        question_id = answer.get('question_id')
        option_id = answer.get('option_id')
        if question_id in correct_answers and correct_answers[question_id] == option_id:
            score_count += 1
    
    player_name = data.get('player_name', 'Anónimo').strip()
    if not player_name:
        player_name = 'Anónimo'
        
    new_score = Score(player_name=player_name, score=score_count, total_questions=len(quiz.questions), quiz_id=quiz.id)
    db.session.add(new_score)
    db.session.commit()

    results = [
        {
            "question_id": answer.get('question_id'),
            "correct_option_id": correct_answers.get(answer.get('question_id')),
            "user_option_id": answer.get('option_id'),
            "is_correct": correct_answers.get(answer.get('question_id')) == answer.get('option_id')
        } for answer in user_answers
    ]
    
    return jsonify({ "score": score_count, "total_questions": len(quiz.questions), "results": results })

# Endpoint para OBTENER el ranking de un quiz
@app.route('/api/quizzes/<string:share_code>/ranking', methods=['GET'])
def get_quiz_ranking(share_code):
    quiz = Quiz.query.filter_by(share_code=share_code).first_or_404()
    ranking_data = Score.query.filter_by(quiz_id=quiz.id)\
                              .order_by(Score.score.desc(), Score.submitted_at.asc())\
                              .all()
    ranking_list = [
        {
            'player_name': score.player_name,
            'score': score.score,
            'total_questions': score.total_questions,
            'submitted_at': score.submitted_at.strftime('%d-%m-%Y %H:%M')
        }
        for score in ranking_data
    ]
    return jsonify(ranking_list)

# --- RUTA PARA GENERAR QUIZ CON IA (Versión OpenRouter) ---
@app.route('/api/generate-quiz-ai', methods=['POST'])
def generate_quiz_ai():
    data = request.get_json()
    if not data or 'topic' not in data:
        return jsonify({"error": "Se requiere un 'topic'."}), 400

    topic = data.get('topic')
    num_questions = data.get('num_questions', 5)

    system_prompt = """
    Eres un asistente diseñado para crear quizzes en formato JSON.
    Tu respuesta DEBE ser únicamente un objeto JSON válido, sin ningún texto, explicación o markdown antes o después.
    La estructura JSON es:
    {
      "title": "Quiz sobre [tema]",
      "questions": [
        {
          "question_text": "Texto de la pregunta",
          "options": [
            {"option_text": "Texto de opción", "is_correct": boolean},
            ...
          ]
        }
      ]
    }
    Cada pregunta debe tener 4 opciones y solo una "is_correct" debe ser true.
    """
    user_prompt = f"Genera un quiz de {num_questions} preguntas sobre el tema: {topic}."

    try:
        print(f"DEBUG: Enviando prompt a OpenRouter para el tema: {topic}")
        completion = client.chat.completions.create(
            # El nombre del modelo incluye el proveedor. Usaremos Claude Haiku, que es rápido y potente.
            model="anthropic/claude-3-haiku", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        quiz_json_string = completion.choices[0].message.content
        print(f"DEBUG: Respuesta JSON recibida de OpenRouter:\n{quiz_json_string}")
        
        quiz_data = json.loads(quiz_json_string)
        return jsonify(quiz_data)

    except Exception as e:
        print("--- INICIO DE ERROR DETALLADO DE LA API (OpenRouter) ---")
        print(f"Tipo de error: {type(e).__name__}")
        print(f"Mensaje de error: {e}")
        print("--- FIN DE ERROR DETALLADO DE LA API (OpenRouter) ---")
        return jsonify({
            "error": "Error al comunicarse con la API de OpenRouter.",
            "details": f"{type(e).__name__}: {str(e)}"
        }), 500

@app.route('/api/quizzes/<string:share_code>', methods=['DELETE'])
def delete_quiz(share_code):
    quiz = Quiz.query.filter_by(share_code=share_code).first_or_404()
    try:
        db.session.delete(quiz)
        db.session.commit()
        return jsonify({"message": "Quiz eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "No se pudo eliminar el quiz", "details": str(e)}), 500
        
# Bloque de ejecución principal
if __name__ == '__main__':
    app.run(debug=True, port=5000)
