from copy import deepcopy
from flask import Blueprint, jsonify, request, session

from IDeviation.DeviationManager import DeviationManager
from Noise.NoiseManager import NoiseManager
from locking import get_session_lock
noise = Blueprint('noise', __name__)

@noise.route('/noise', methods=['POST'])
def set_noise():
    session_id = session.sid
    session_lock = get_session_lock(session_id)

    with session_lock:
        noise_manager = NoiseManager()
        if 'deviation_manager' not in session:
            session['deviation_manager'] = DeviationManager()
        noise_manager.setDeviationManager(session['deviation_manager'])
        session['noise_is_done'] = False
        if "noise" in request.json and isinstance(request.json["noise"], dict):
            noise_manager.setGeneralNoise(request.json["noise"]["percentage"])
        if "skipNoise" in request.json and isinstance(request.json["skipNoise"], dict):
            noise_manager.setSkipNoise(request.json["skipNoise"]["percentage"])
        if "insertNoise" in request.json and isinstance(request.json["insertNoise"], dict):
            noise_manager.setInsertNoise(request.json["insertNoise"]["percentage"])
        if "swapNoise" in request.json and isinstance(request.json["swapNoise"], dict):
            noise_manager.setSwapNoise(request.json["swapNoise"]["percentage"])
        if "reworkNoise" in request.json and isinstance(request.json["reworkNoise"], dict):
            noise_manager.setReworkNoise(request.json["reworkNoise"]["percentage"])
        if "earlyNoise" in request.json and isinstance(request.json["earlyNoise"], dict):
            noise_manager.setEarlyNoise(request.json["earlyNoise"]["percentage"])
        if "lateNoise" in request.json and isinstance(request.json["lateNoise"], dict):
            noise_manager.setLateNoise(request.json["lateNoise"]["percentage"])
        if "deviationNoise" in request.json and isinstance(request.json["deviationNoise"], list):
            noise_manager.setDeviationNoise(request.json["deviationNoise"])
    
        session["noise_manager"] = noise_manager
    
    return "Noise added"

@noise.route('/add_noise_to_log', methods=['POST'])
def set_noise_log():   
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    

    with session_lock:     
        noise_manager = session["noise_manager"]
        if 'deviation_manager' not in session:
            session['deviation_manager'] = DeviationManager()
        noise_manager.setDeviationManager(session['deviation_manager'])
        noise_manager.trace_manager = session['trace_manager']
        noisy_log = noise_manager.addNoiseToLog(deepcopy(session['deviated_log']))
        session["noisy_log"] = noisy_log
        session['noise_is_done'] = True
    return "Noise added to log",201
        
  
@noise.route('/noise_is_done', methods=['Get'])
def noise_is_done():   

        session_id = session.sid
        session_lock = get_session_lock(session_id)
        with session_lock:     
            if 'noise_is_done' in session:
                return str(session['noise_is_done'])
            return str(False)
    


@noise.before_request
def check_Noise_manager():
	if request.method == 'OPTIONS':
		response = jsonify({"success": True})
		response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
		response.headers.add('Access-Control-Allow-Credentials', 'true')
		response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
		response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT') 
		return response
	if 'noise_manager' not in session:
		session_id = session.sid
		session_lock = get_session_lock(session_id)
		with session_lock:     
			noise_manager = NoiseManager()
			if 'deviation_manager' not in session:
				session['deviation_manager'] = DeviationManager()
			noise_manager.setDeviationManager(session['deviation_manager'])
			session["noise_manager"] = noise_manager
    