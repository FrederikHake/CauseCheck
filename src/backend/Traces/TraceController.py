from threading import Lock
from flask import Blueprint, Response, jsonify, request, session
from graphviz import Digraph
from Traces.TraceManager import TraceManager
from pm4py.objects.petri_net import importer as pnml_importer
from pm4py.visualization.petri_net import visualizer as pn_visualizer
from pm4py.objects.petri_net import semantics
from pm4py.objects.petri_net import utils
from pm4py.objects.log.obj import EventLog
from pm4py import convert
import pm4py
from datetime import datetime, timedelta

from locking import get_session_lock

trace = Blueprint('trace', __name__)


@trace.route('/logic_gate', methods=['GET'])
def get_logic_gates():
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    response = {}
    with session_lock:
        # Load the Petri net from session
        net = session['petrinet'] 
        im = session['petrinet_initial_marking'] 
        fm = session['petrinet_final_marking'] 
        trace_manager:TraceManager = session["trace_manager"]
        logic_gates = trace_manager.get_logic_gates()
        for gateway in logic_gates.values():
            if gateway.type == "XOR":
                out_arcs = len(gateway.logicGateDecisions)
                response[gateway.getLabel()] = [i for i in range(out_arcs)]
            
        session["trace_manager"] = trace_manager 
    return jsonify(response)

@trace.route('/visualization', methods=['GET'])

def get_visualization():
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    response = {} 
    with session_lock:
        # Load the Petri net from session
        if 'visualization' not in session:
            net = session['petrinet']
            im = session['petrinet_initial_marking']
            fm = session['petrinet_final_marking']
            trace_manager = session["trace_manager"]
            session['visualization'] = trace_manager.visualize_petri_net_with_annotations(net, im, fm)
        response : Digraph =   session['visualization']
    return Response(response.pipe(), mimetype='image/svg+xml')

@trace.route('/set_logic_gate_decision', methods=['POST']) 
def add_trace():
    
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        data = request.get_json()
        trace_manager = session["trace_manager"]
        for logic_gate in data['logic_gates']:
            trace_manager.getLogicGate(logic_gate['name'])
            for decision in logic_gate['decisions']:
                trace_manager.setLogicGateDecision(decision["probability"], decision["index"],logic_gate['name'])
        session["trace_manager"] = trace_manager 
    return "Logic Gate Decisions set successfully"


@trace.route('/set_start_end_time', methods=['POST'])
def set_start_end_time():
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        data = request.get_json()
        trace_manager = session["trace_manager"]
        count = data['count']
        trace_manager.setCount(count)
        start_time = data['start_time']
        end_time = data['end_time']
        start_time = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S.%fZ") 
        end_time = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%S.%fZ")
        if not isinstance(start_time, datetime):
            print("Error: Start time is not a datetime object")
        trace_manager.setStartTime(start_time) 
        trace_manager.setEndTime(end_time)
        session["trace_manager"] = trace_manager 
    return "Start and end time saved successfully"


@trace.route('/set_trace_attributes', methods=['POST'])  
def set_trace_attributes():
    
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        data = request.get_json()
        trace_manager = session["trace_manager"]
        if 'attributes'  in data:
            attributes = data['attributes']
            if attributes:
                trace_manager.setTraceAttributes(attributes)  
        session["trace_manager"] = trace_manager 
    return "Trace attributes set successfully",201

@trace.route('/get_trace_varient', methods=['GET'])
def get_trace_varient():
    directly_following_transitions = {}
    net = session['petrinet']
    fm = session['petrinet_final_marking']
    response = []
    # Iterate over all transitions
    for transition in net.transitions:
        directly_following_transitions[transition.label] = find_next_transition_names(transition)       
        # Output the directly-following transitions
    for trans, following_trans in directly_following_transitions.items():
        for following_transition in following_trans:
            response.append([trans,following_transition])
    return response
def find_next_transition_names(transition, visited_places=None, visited_transitions=None):
    if visited_places is None:
        visited_places = []
    if visited_transitions is None:
        visited_transitions = []

    result = []

    # Iterate over outgoing arcs of the current transition
    for arc in transition.out_arcs:
        place = arc.target
        if place in visited_places:
            continue
        visited_places.append(place)

        # Iterate over outgoing arcs of the place
        for plac_arc in place.out_arcs:
            following_transition = plac_arc.target
            if following_transition not in visited_transitions:
                visited_transitions.append(following_transition)
                if following_transition.label is not None:
                    result.append(following_transition.label)
                else:
                    result.extend(find_none_names(following_transition, visited_places.copy(), visited_transitions.copy()))
    return result

def find_none_names(transition, visited_places=None, visited_transitions=None):
    if visited_places is None:
        visited_places = []
    if visited_transitions is None:
        visited_transitions = []

    result = []

    # Iterate over outgoing arcs of the current transition
    for arc in transition.out_arcs:
        place = arc.target
        if place in visited_places:
            continue
        visited_places.append(place)

        # Iterate over outgoing arcs of the place
        for plac_arc in place.out_arcs:
            following_transition = plac_arc.target
            if following_transition.label is None:
                if following_transition not in visited_transitions:
                    visited_transitions.append(following_transition)
                    result.extend(find_none_names(following_transition, visited_places.copy(), visited_transitions.copy()))
            else:
                result.append(following_transition.label)
    return result    

@trace.route('/do_playout', methods=['Post'])
def do_playout():
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        # Load the Petri net from session
        net = session['petrinet']
        im  = session['petrinet_initial_marking']
        fm = session['petrinet_final_marking']
        trace_manager = session["trace_manager"]
        session['log'] = trace_manager.apply_playout(net, im, final_marking=fm) 
        trace_manager.playbackIsDone = True
        session["trace_manager"] = trace_manager
    return "Playout done successfully",201  
    
@trace.route('/get_playback_status', methods=['GET'])
def get_playback_status():
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        trace_manager = session["trace_manager"]
        return str(trace_manager.playbackIsDone)
    
@trace.route('/get_transitions', methods=['GET'])
def get_transitions():
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        trace_manager = session["trace_manager"]
        transitions = trace_manager.getTransitioLabels()
    return list(transitions)
    

@trace.route('/set_transition_attributes', methods=['POST'])
def set_transition_attributes():
    
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        data = request.get_json()
        trace_manager = session["trace_manager"]

        for item in data['transitions']:
            transition_name = item['transition_name']
            attributes = item['attributes']
            for attr in attributes:
                if attr['type'] == 'temporal':
                    for value in attr['values']:
                        value[0] = datetime.strptime(value[0], "%Y-%m-%dT%H:%M:%S.%fZ")
                        if value[0] == datetime(1970, 1, 1):
                            value[0] = "null"
                        else:
                            value[0] = value[0] - datetime(1970, 1, 1)
            result = trace_manager.set_transition_attributes(transition_name, attributes)
        session["trace_manager"] = trace_manager 
    return 'Attributes set sucesfully',201
    

@trace.before_request
def check_Trace_manager():
    
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock:
        if request.method == 'OPTIONS':
            response = jsonify({"success": True})
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
            response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT')
            return response
        if "trace_manager" not in session:
            petrinet = session["petrinet"]
            session["trace_manager"] = TraceManager(petrinet)
    
    
    

