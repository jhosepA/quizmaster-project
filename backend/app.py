from flask import Flask, jsonify, request # Importamos 'request' para acceder a los datos de la petición
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

# NUEVA RUTA: Para crear un nuevo quiz
@app.route('/api/quizzes', methods=['POST'])
def create_quiz():
    # Obtenemos los datos JSON enviados en la petición
    data = request.get_json()

    # Validaciones básicas
    if not data or not 'title' in data or not 'questions' in data:
        return jsonify({"error": "Datos de entrada inválidos. Se requiere 'title' y 'questions'."}), 400

    try:
        # 1. Creamos el objeto Quiz principal
        new_quiz = Quiz(title=data['title'])
        db.session.add(new_quiz)

        # 2. Iteramos sobre las preguntas recibidas
        for q_data in data['questions']:
            new_question = Question(question_text=q_data['question_text'], quiz=new_quiz)
            db.session.add(new_question)

            # 3. Iteramos sobre las opciones de cada pregunta
            for o_data in q_data['options']:
                new_option = Option(
                    option_text=o_data['option_text'],
                    is_correct=o_data['is_correct'],
                    question=new_question
                )
                db.session.add(new_option)
        
        # 4. Confirmamos todos los cambios en la base de datos a la vez
        db.session.commit()

        # Devolvemos una respuesta exitosa con el código para compartir
        return jsonify({
            "message": "Quiz creado exitosamente!",
            "share_code": new_quiz.share_code,
            "quiz_id": new_quiz.id
        }), 201

    except Exception as e:
        # Si algo falla, revertimos todos los cambios para no dejar datos corruptos
        db.session.rollback()
        return jsonify({"error": "Falló la creación del quiz", "details": str(e)}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, port=5000)