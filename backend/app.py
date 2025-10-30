from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import uuid # Importamos la librería para generar IDs únicos

# Inicializamos la aplicación Flask
app = Flask(__name__)

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
db_uri = 'postgresql://quiz_user:123@localhost:5432/quiz_db'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializamos SQLAlchemy con nuestra aplicación Flask
db = SQLAlchemy(app)


# --- MODELOS DE LA BASE DE DATOS ---

# Modelo para el Quiz
class Quiz(db.Model):
    __tablename__ = 'quizzes' # Nombre de la tabla
    id = db.Column(db.Integer, primary_key=True)
    # Usamos un código corto y único para compartir el quiz
    share_code = db.Column(db.String(6), unique=True, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    # La relación 'questions' nos permitirá acceder a las preguntas del quiz fácilmente
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade="all, delete-orphan")

    def __init__(self, title):
        self.title = title
        # Generamos un código único de 6 caracteres para compartir
        self.share_code = str(uuid.uuid4().hex)[:6]

# Modelo para las Preguntas
class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(255), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    # La relación 'options' nos permitirá acceder a las opciones de la pregunta
    options = db.relationship('Option', backref='question', lazy=True, cascade="all, delete-orphan")

# Modelo para las Opciones de respuesta
class Option(db.Model):
    __tablename__ = 'options'
    id = db.Column(db.Integer, primary_key=True)
    option_text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)


# --- RUTAS DE LA API ---

# Ruta de prueba original
@app.route('/api/ping', methods=['GET'])
def ping_pong():
    return jsonify({"message": "pong!"})

# Ruta para verificar la conexión con la base de datos
@app.route('/api/db-check', methods=['GET'])
def db_check():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({"message": "Database connection successful!"})
    except Exception as e:
        return jsonify({"message": "Database connection failed!", "error": str(e)}), 500

# Esta parte asegura que el servidor solo se ejecute cuando corremos el script directamente.
if __name__ == '__main__':
    # Creamos las tablas en la base de datos si no existen
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, port=5000)