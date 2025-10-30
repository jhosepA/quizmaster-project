from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

# Inicializamos la aplicación Flask
app = Flask(__name__)

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
# Esta es la "Cadena de Conexión". Le dice a SQLAlchemy dónde está nuestra base de datos.
# Formato: postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_db]
db_uri = 'postgresql://quiz_user:123@localhost:5432/quiz_db'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Recomendado para desactivar una función que no usaremos

# Inicializamos SQLAlchemy con nuestra aplicación Flask
db = SQLAlchemy(app)

# --- RUTAS DE LA API ---

# Ruta de prueba original
@app.route('/api/ping', methods=['GET'])
def ping_pong():
    return jsonify({"message": "pong!"})

# NUEVA RUTA: Para verificar la conexión con la base de datos
@app.route('/api/db-check', methods=['GET'])
def db_check():
    try:
        # Intenta ejecutar una consulta simple: "SELECT 1"
        # db.session.execute(...) nos permite hablar con la base de datos.
        db.session.execute(text('SELECT 1'))
        # Si la consulta funciona, devolvemos un mensaje de éxito.
        return jsonify({"message": "Database connection successful!"})
    except Exception as e:
        # Si hay algún error al conectar o ejecutar la consulta,
        # devolvemos un mensaje de error.
        return jsonify({"message": "Database connection failed!", "error": str(e)}), 500

# Esta parte asegura que el servidor solo se ejecute cuando corremos el script directamente.
if __name__ == '__main__':
    app.run(debug=True, port=5000)
