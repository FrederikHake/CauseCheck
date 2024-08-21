from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_session import Session

from IDeviation import DeviationController
from Log import LogController
from Traces import TraceController   

from ProcessModel import process_model_controller
from Noise import NoiseController
from threading import Lock
# Initialize Flask app
app = Flask(__name__)
 
# Configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True if using https
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'
app.config['SESSION_COOKIE_DOMAIN'] = None  # None for local development
# CORS configuration
cors = CORS(app, origins=[ "http://localhost:5173"], supports_credentials=True, expose_headers=["Set-Cookie"])
 
Session(app)
app.register_blueprint(TraceController.trace)
app.register_blueprint(process_model_controller.model)
app.register_blueprint(NoiseController.noise)
app.register_blueprint(LogController.log)

app.register_blueprint(DeviationController.deviation)

    
    

if __name__ == '__main__':
    app.run(debug=True)