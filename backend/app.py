from flask import Flask, jsonify

# Inicializamos la aplicación Flask
app = Flask(__name__)

# Esta es nuestra primera "ruta" o "endpoint" de la API.
# Cuando alguien visite http://127.0.0.1:5000/api/ping, se ejecutará esta función.
@app.route('/api/ping', methods=['GET'])
def ping_pong():
    # Devolvemos una respuesta en formato JSON.
    # Las APIs modernas se comunican con JSON.
    return jsonify({"message": "pong!"})

# Esta parte asegura que el servidor solo se ejecute cuando corremos el script directamente.
if __name__ == '__main__':
    # app.run() inicia el servidor.
    # debug=True hace que el servidor se reinicie automáticamente cuando guardas cambios.
    # port=5000 define el puerto en el que escuchará.
    app.run(debug=True, port=5000)