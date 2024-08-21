from copy import deepcopy
from datetime import datetime
from threading import Lock
from flask import Blueprint, Response, jsonify, request, session
from graphviz import Digraph
from ICondition import CurrentAttributeCondition, ITraceAttributeCondition
from ICondition.PreviousActivityCondition import PreviousActivityCondition
from ICondition.PreviousAttributeCondition import PreviousAttributeCondition
from IDeviation.insert_deviation import InsertDeviation
from IDeviation.repetition_deviation import RepetitionDeviation
from IDeviation.replacement_deviation import ReplacementDeviation
from IDeviation.skip_deviation import SkipDeviation
from IDeviation.swap_deviation import SwapDeviation
from Traces.TraceManager import TraceManager
from IDeviation import DeviationManager
from pm4py.objects.petri_net import importer as pnml_importer
from pm4py.visualization.petri_net import visualizer as pn_visualizer
from pm4py.objects.petri_net import semantics
from pm4py.objects.petri_net import utils
from pm4py import convert
from datetime import timedelta
import pm4py

from locking import get_session_lock

deviation = Blueprint('deviation', __name__)


@deviation.route('/deviations', methods=['POST'])
def convert_to_deviations():
	data = request.json
	deviations = {}


	session_id = session.sid
	session_lock = get_session_lock(session_id)
	with session_lock:
		session['noise_is_done'] = False
		session["deviation_manager"] = DeviationManager.DeviationManager()

		deviation_manager = DeviationManager.DeviationManager()
		trace_manager = session['trace_manager']
		pm4py.write_xes(session['log'],'log.xes')
		for item in data:

			deviation = []
			if item['deviationType'] == 'skip':
				deviation = SkipDeviation(item['name'], item['activity'])

			if item['deviationType'] == 'insert':
				deviation = InsertDeviation(item['name'], item['activity'],item['repeatCount'][0],trace_manager) 

			if item['deviationType'] == 'repetition':
				deviation = RepetitionDeviation(name= item['name'],activities_to_repeat_after=item['repeatAfter'],place= item['activity'],repetitions = item['repeatCount'][0],trace_manager=trace_manager) 

			if item['deviationType'] == 'replacement':
				deviation = ReplacementDeviation(item['name'], item['activity'],item['replaceWith'],trace_manager)

			if item['deviationType'] == 'swap':
				deviation = SwapDeviation(item['name'], item['valueA'],item['valueB'],trace_manager)
			deviations[item['name']] = deviation
		for deviation in deviations.values():
			deviation_manager.addDeviation(deviation)
		for item in data:
			value = 0
			deviation = deviations[item['name']]
			if 'targetYears' in item:
				
				value = ((datetime(year=item['targetYears']+1970, month=item['targetMonths']+1, day=item['targetDays']+1, hour=item['targetHours'], minute=item['targetMinutes'], second=item['targetSeconds'])- datetime(year= 1970, month = 1, day = 1)))
			elif 'targetAttribute'in item and item["targetAttribute"] == "Previous events":
				pass
			elif item['targetValue'].isnumeric():
				value = float(item['targetValue'])
			else:
				value = item['targetValue']
			if item['targetAttribute'] == 'Trace':
				condition = ITraceAttributeCondition.CurrentAttributeCondition(attribute_name=item['targetName'], attribute_value=value, sign=item['targetRelation'], probability=float(item['targetProbability']) / 100)
				deviation.addConition(condition)
			elif item['targetAttribute'] == 'Previous events':
				condition = PreviousActivityCondition(activity_name= item['selectedEvent'][0], probability=float(item['targetProbability']) / 100)
				deviation.addConition(condition)
			#elif 'activity' in item and len(item['activity']) == 1 and item['selectedEvent'][0] == item['activity'][0]:
			#	condition = CurrentAttributeCondition(attribute_name= item['targetName'],activity_name= item['selectedEvent'][0], attribute_value=value, sign=item['targetRelation'], probability=float(item['targetProbability']) / 100)
			#	deviation.addConition(condition)
			else:
				condition = PreviousAttributeCondition(attribute_name= item['targetName'],activity_name= item['selectedEvent'][0], attribute_value=value, sign=item['targetRelation'], probability=float(item['targetProbability']) / 100) 
				deviation.addConition(condition)
		session['deviation_manager'] = deviation_manager
	return jsonify({'message': 'Deviations added','success': True})

@deviation.route('/add_deviations_to_log', methods=['POST'])
def add_deviations_to_log():
    session_id = session.sid
    session_lock = get_session_lock(session_id)
    with session_lock: 
        session['noise_is_done'] = False
        deviation_manager = session['deviation_manager']
        deviation_manager.log = deepcopy(session['log'])
        log = deviation_manager.log
        session['deviated_log'] = deviation_manager.applyDeviationsToEventLog(log)
    return jsonify({'message': 'Deviations added to log','success': True}),201


@deviation.before_request
def check_Trace_manager():

	if request.method == 'OPTIONS':
		response = jsonify({"success": True})
		response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
		response.headers.add('Access-Control-Allow-Credentials', 'true')
		response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
		response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT')
		return response




