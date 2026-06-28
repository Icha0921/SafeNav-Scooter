from flask import Flask, jsonify, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

db = [{"tipo": "Hurto", "gravedad": "Alta", "lat": 4.6100, "lng": -74.0820}]

datos_calor = [[4.6120, -74.0840, 0.9], [4.6130, -74.0850, 0.7]]

@app.route('/api/zonas-riesgo')
def get_zonas(): return jsonify(db)


@app.route('/api/mapa-calor')
def get_calor(): return jsonify(datos_calor)

@app.route('/api/reportar', methods=['POST'])
def post():
    db.append(request.get_json())
    return jsonify({"mensaje": "OK"})

if __name__ == '__main__': app.run(port=5000)