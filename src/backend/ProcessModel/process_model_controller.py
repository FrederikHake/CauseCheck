from flask import Blueprint, jsonify, request, session
import pm4py
import os

from Traces.TraceManager import TraceManager
from locking import get_session_lock

model = Blueprint('model', __name__)

@model.route('/pmnl', methods=['OPTIONS', 'POST'])
def post_petrinet():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    try:    
        session_id = session.sid
        session_lock = get_session_lock(session_id)

        with session_lock:
            if request.method == 'POST':
                file = request.files['petrinet']
                if not file:
                    return jsonify({"success": False, "error": "File was not send correctly"}), 400
                
                file.save(file.filename)
                session['file'] = file.filename
                net, im, fm = pm4py.read_pnml(file.filename)
                session['petrinet'] = net
                session['petrinet_initial_marking'] = im
                session['petrinet_final_marking'] = fm
                # Delete the BPM file after loading
                os.remove(file.filename)
                session.pop('trace_manager', None)
                session.pop('deviation_manager', None)
                session.pop('log_manager', None)
                return jsonify({"success": True, "message": "PNML file created"}), 201
            return jsonify({"success": False, "error": "Not a correct Petrinet"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@model.route('/bpmn', methods=['OPTIONS', 'POST'])
def post_bpmn():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    try:
        session_id = session.sid
        session_lock = get_session_lock(session_id)

        with session_lock:
            if request.method == 'POST':
                file = request.files['petrinet']
                if not file:
                    return jsonify({"success": False, "error": "File was not send correctly"}), 400
                file.save(file.filename)
                session['file'] = file.filename
                bpmn_graph = pm4py.read_bpmn(file.filename)
                net, im, fm = pm4py.convert_to_petri_net(bpmn_graph)
                session['petrinet'] = net
                session['petrinet_initial_marking'] = im
                session['petrinet_final_marking'] = fm
                trace_manager = TraceManager(net)
                trace_manager.identify_gateways_and_loops(net)
                session['trace_manager'] = trace_manager
                # Delete the BPM file after loading
                os.remove(file.filename)
                session.pop('deviation_manager', None)
                session.pop('log_manager', None)
                session.pop('visualization', None)
                return jsonify({"success": True, "message": "PNML file created"}), 201
            return jsonify({"success": False, "error": "Not a correct Petrinet"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
@model.before_request
def _build_cors_preflight_response():
    
    if request.method == 'OPTIONS':
        response = jsonify({"success": True})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT')
        return response
    
    session.clear()
