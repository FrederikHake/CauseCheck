from Traces.LogicGate import LogicGate
from Traces.LogicGateDecision import LogicGateDecision
from Traces.Place import Place

from datetime import datetime
from pm4py.visualization.petri_net import visualizer as pn_vis
from pm4py.visualization.petri_net.common import visualize
from pm4py.objects.log.obj import EventLog, Trace, Event


from pm4py import PetriNet, Marking
from pm4py.visualization.petri_net import visualizer as pn_vis
from pm4py.visualization.petri_net.common import visualize
from pm4py.objects.petri_net.obj import PetriNet
from random import choice
from pm4py.objects import petri_net
from pm4py.util import xes_constants
from copy import copy

import random
from pm4py.objects.log import obj as log_instance
import datetime
from pm4py.util.dt_parsing.variants import strpfromiso
from datetime import datetime, timedelta


class TraceManager:
    def __init__(self,petrinet:PetriNet) -> None:
        self.count : int = 0
        self.logic_gates : dict[str, LogicGate] = {}
        self.places : dict[Place] = {}
        self.startTime :datetime = None
        self.trace_attributes : dict[str, list] = {}
        self.endTime  :datetime = None
        self.petriNet = petrinet
        self.playbackIsDone = False

    def getTransitioLabels(self) -> list: 
        if not self.places:
            for transition in self.petriNet.transitions:
                self.places[transition.label] = Place(transition.label, petriNet=self.petriNet)

        transitions = [transition.label for transition in self.petriNet.transitions if transition.label is not None]
        return list(transitions)

    def get_logic_gates(self):
        return self.logic_gates
    
    def set_transition_attributes(self, transition_name, attributes):
        validated_attributes = {}

        for attr in attributes:
            if self.validate_attribute(attr):
                validated_attributes["name"] = attr
            else:
                boolResponse, text = self.validate_attribute(attr)
                raise ValueError(f"Invalid attribute {text}.")    
            
        for attr in attributes:
            self.places[transition_name].addAttribute( attr)

    def getLogicGateByPattern(self, type_: str, last_activity: str, place: Place, count: int):
        label = f"{type_}_{last_activity}_{place.name}_{count}"
        return self.logic_gates.get(label, None)
        for logic_gate in self.logic_gates.values():
            if logic_gate.type == type_ and logic_gate.last_activity == last_activity and logic_gate.place == place and logic_gate.index == count:
                return logic_gate
        return None

    def validate_attribute(self, attr:dict):
        
        if attr['type'] =="numerical":
            if not sum(value[1] for value in attr["values"]) == 1:
                return False, f"Total probability for numerical attribute {attr['name']} must be 1."
            for value in attr["values"]:
                if not isinstance(value[0], (int, float)):
                    return False, "Invalid value type for numerical attribute."
                if not isinstance(value[1], (int, float)):
                    return False , "Invalid probability type for numerical attribute."
        elif attr['type'] == "string":
            for value in attr["values"]:
                if not isinstance(value[0], (str)):
                    return False , "Invalid value type for string attribute."
                if not isinstance(value[1], (int, float)):
                    return False , "Invalid probability type for string attribute."
        if attr['type'] == "temporal":
            if not isinstance(attr["values"], timedelta): 
                return False , "Invalid value type for temporal attribute."
            
        return True, None


    def setCount(self,count:int):
        self.count = count

    def getLogicGate(self, name:str):
        return self.logic_gates[name]
    

    def setLogicGateDecision(self,probability:float,index:int,name:str):
        self.logic_gates[name].setLogicGateDecisions(index, probability)

    
    def setTraceAttributes(self,attributes:dict):
        self.trace_attributes = attributes

    def identify_gateways_and_loops(self,net:PetriNet):
        """
        Identifies the gateways and loops in a Petri net modeled in PM4Py

        Parameters
        -------------
        net
            Petri net object

        Returns
        -------------
        analysis
            Dictionary containing lists of identified AND, XOR gateways, and loops
        """
        and_gateways = []
        xor_gateways = []

        def get_last_visited_activity(node):
                """
                Get the last visited transition (activity) of a given place or transition
                """
                for arc in node.in_arcs:
                    if isinstance(arc.source, PetriNet.Transition) and arc.source.label:
                        return arc.source.label
                return None
                
        counter = 1

        # Identify transitions with multiple input or output arcs
        for transition in net.transitions:
            in_arcs = len(transition.in_arcs)
            out_arcs = len(transition.out_arcs)
            if in_arcs > 1 and out_arcs > 1:
                # OR Gateway candidate, not commonly identified directly
                pass
            elif out_arcs > 1:
                and_gateways.append(('AND',  transition, get_last_visited_activity(transition), counter))
                counter += 1


        # Identify places with multiple input or output arcs
        counter = 1
        for place in sorted([x for x in list(net.places)], key=lambda x: x.name):
            in_arcs = len(place.in_arcs)
            out_arcs = len(place.out_arcs)

            if in_arcs > 1 and out_arcs > 1:
                # OR Gateway candidate, not commonly identified directly
                pass
            elif in_arcs == 1 and out_arcs > 1:
                xor_gateways.append(('XOR',  place, get_last_visited_activity(place), counter))
                counter += 1

        andlogicgate = []
        for and_gateway in and_gateways:
            type_,  node, last_activity ,count = and_gateway
            logic_gate = LogicGate(type_, node,None,  index= count)
            for i, arc in enumerate(list(node.out_arcs)):
                logic_gate.addLogicGateDecision(LogicGateDecision(1,i,arc))
            self.logic_gates[logic_gate.getLabel()] = logic_gate
            andlogicgate.append(logic_gate) 
            
        xorLogicGate = []
        for xor_gateway in xor_gateways:
            type_, place, last_activity, count = xor_gateway
            logic_gate = LogicGate(type_, last_activity, place, count)
            for i, arc in enumerate(list(place.out_arcs)):
                logic_gate.addLogicGateDecision(LogicGateDecision(0, i, arc))
            self.logic_gates[logic_gate.getLabel()] = logic_gate
            xorLogicGate.append(logic_gate)
        
        
        return {
            'AND': andlogicgate,
            'XOR': xorLogicGate
        }

    
    def visualize_petri_net_with_annotations(self,net, im, fm):
        """
        Visualizes the Petri net with annotated gateways and loops

        Parameters
        -------------
        net
            Petri net object
        im
            Initial marking
        fm
            Final marking
        analysis
            Dictionary containing lists of identified AND and XOR gateways
        """
        decorations = {}
        
        for gateway in self.logic_gates.values():
            if gateway.type == 'AND':
                decorations[gateway.transition] = {"label": gateway.getLabel(), "color": "green"}
            elif gateway.type == 'XOR':
                decorations[gateway.place] = {"label": gateway.getLabel(), "color": "red"}
                for i, LogicGateDecision in enumerate(gateway.logicGateDecisions.values()):
                    decorations[LogicGateDecision.arc] = {"label": LogicGateDecision.index, "color": "blue"}
                



        # Visualize the annotated Petri net
        parameters = {
            pn_vis.Variants.WO_DECORATION.value.Parameters.DEBUG: False,
            pn_vis.Variants.WO_DECORATION.value.Parameters.FORMAT: "svg"
        }


        # Visualize the Petri net

        gviz = visualize.apply(net, im, fm,decorations=decorations, parameters=parameters)

        return gviz
    
    def getLogicGateByName(self,name:str):
        for logic_gate in self.logic_gates.values():
            if logic_gate.place is None  :
                if name is None:
                    return logic_gate
            else:
                if logic_gate.place.name == name:
                    return logic_gate
        return None

    def createTraceVariants(self,petrinet: PetriNet, initial_marking, final_marking,amount):
        if initial_marking == final_marking:
            return []
        if  isinstance(initial_marking,Marking):
           initial = [x for x in list(petrinet.places) if x in initial_marking][0].__deepcopy__()
        else:
            initial = initial_marking.__deepcopy__()
        if len(initial.out_arcs) == 1:
            transition = list(initial.out_arcs)[0].target
            if len(transition.out_arcs) == 1:
                return [transition].append(self.createTraceVariants(petrinet, list(transition.out_arcs)[0].target, final_marking,amount))
            if len(transition.out_arcs) > 1:
                return [transition].append(self._createANDVariant(petrinet, transition, final_marking,amount))
        if len(initial.out_arcs) > 1:
            return self._createXORVariant(petrinet, initial_marking, final_marking,amount)
        
    def _createXORVariant(self, petrinet: PetriNet, initial_marking, final_marking,amount):
        logic_gate = self.getLogicGateByName(initial_marking.name)
        # rest of the code
        response = []
        for decision in logic_gate.logicGateDecisions:
            for variant in self.createTraceVariants(petrinet, decision.arc.target, final_marking,amount):
                response.append(zip([decision.transition].append(variant[0]),variant[1]))
        return response
    def _createANDVariant(self, petrinet: PetriNet, initial_marking, final_marking,amount):
        closingANDGate = self._findClosingANDGate(petrinet, 0, initial_marking, final_marking)
        arcs = []
        for arc in initial_marking.out_arcs:
            arcs.append(self._getAndArcs(petrinet, arc.target, closingANDGate,amount))
        arcs = self.interleave_multiple(arcs)
        arcs = self.distribute_occurrences(arcs, amount)
        response = []
        for arc in arcs:
             for variant in self.createTraceVariants(petrinet, closingANDGate, final_marking,arc[1]):
                response.append(zip([arc[0]].append(variant[0]),variant[1]))
                
        return response
            
        
    def _getAndArcs(self, petrinet: PetriNet, initial_marking, final_marking,amount):
        if initial_marking == final_marking:
            return [initial_marking.name]
        if len(initial_marking.out_arcs) > 1:  
            traceVariants = self._createXORVariant(petrinet, initial_marking, final_marking,amount)
            andVariants = []
            return andVariants
        else:
            if len(list(initial_marking.out_arcs)[0].target.out_arcs) > 1:
                traceVariants = self._createANDVariant(petrinet, list(initial_marking.out_arcs)[0].target, final_marking,amount)

                return traceVariants
            else:
                return [initial_marking.name].append(self.createTraceVariants(petrinet,list(initial_marking.out_arcs)[0].target,final_marking,amount)   )
    def _findClosingANDGate(self, petrinet: PetriNet, counter:int, initial_marking, final_marking):
        """
        Finds the closing AND gate in a Petri net.

        Args:
            petrinet (PetriNet): The Petri net to search in.
            counter (int): The counter used for recursive calls.
            initial_marking: The initial marking of the Petri net.
            final_marking: The final marking of the Petri net.

        Returns:
            The closing AND gate in the Petri net.

        """
        if len(list(list(initial_marking.out_arcs)[0].target.out_arcs)[0].target.out_arcs) > 1:
            return self._findClosingANDGate(petrinet, counter+1, initial_marking.out_arcs[0].target.out_arcs[0], final_marking)
        if len(list(list(initial_marking.out_arcs)[0].target.out_arcs)[0].target.in_arcs) > 1:
            if counter == 0:
                return list(list(initial_marking.out_arcs)[0].target.out_arcs)[0].target
            else:
                return self._findClosingANDGate(petrinet, counter-1, list(list(initial_marking.out_arcs)[0].target.out_arcs)[0].target, final_marking)
        return list(list(initial_marking.out_arcs)[0].target.out_arcs)[0].target
    def interleave_multiple(self,arrays):
        """
        Generate all possible interleavings of multiple arrays while preserving the order within each array.
        """
        if not any(arrays):
            return [[]]
        
        result = []

        for i, array in enumerate(arrays):
            if array:
                rest_interleavings = self.interleave_multiple(arrays[:i] + [array[1:]] + arrays[i+1:])
                for inter in rest_interleavings:
                    result.append([array[0]] + inter)

        return result
    

    def interleave_multiple(self,arrays):
        """
        Generate all possible interleavings of multiple arrays while preserving the order within each array.
        """
        if not any(arrays):
            return [[]]
        
        result = []

        for i, array in enumerate(arrays):
            if array:
                rest_interleavings = self.interleave_multiple(arrays[:i] + [array[1:]] + arrays[i+1:])
                for inter in rest_interleavings:
                    result.append([array[0]] + inter)

        return result

    def distribute_occurrences(self,interleaved_arrays, total_occurrences):
        """
        Distribute the total occurrences over the interleaved arrays.
        Remove arrays with zero occurrences.
        """
        if total_occurrences <= 0:
            return [], []
        
        # Shuffle the interleaved arrays to randomize the distribution
        random.shuffle(interleaved_arrays)

        # Initialize occurrences with zeros
        occurrences = [0] * len(interleaved_arrays)

        # Distribute the total occurrences as evenly as possible
        for i in range(total_occurrences):
            occurrences[i % len(interleaved_arrays)] += 1

        # Filter out arrays with zero occurrences
        filtered_arrays = [array for array, count in zip(interleaved_arrays, occurrences) if count > 0]
        filtered_occurrences = [count for count in occurrences if count > 0]

        return filtered_arrays, filtered_occurrences


    def generate_event_log(self, petrinet: PetriNet, initial_marking, final_marking, amount, start_time, end_time, attributes):
        trace_variants = self.createTraceVariants(petrinet, initial_marking, final_marking, amount)
        event_log = EventLog()
        
        for variant in trace_variants:
            for _ in range(amount):
                trace = Trace()
                current_time = datetime.fromisoformat(start_time)
                for transition in variant:
                    event = Event()
                    event["concept:name"] = transition.label  # Set the activity name

                    # Get the attributes for the transition using set_transition_attributes
                    transition_attributes, current_time = self.set_transition_attributes(transition.label, attributes, start_time=current_time.isoformat(), end_time=end_time)

                    # Add the attributes to the event
                    for attr in transition_attributes:
                        if attr["type"] == "temporal":
                            current_time += attr["value"]
                            event["time:timestamp"] = current_time.isoformat()
                        else:
                            event[attr["name"]] = attr["value"]

                    trace.append(event)
                event_log.append(trace)
        
        return event_log

    def apply_playout(self,net, initial_marking, max_trace_length=100,
                    initial_timestamp=10000000, initial_case_id=0,
                    case_id_key=xes_constants.DEFAULT_NAME_KEY,
                    activity_key=xes_constants.DEFAULT_TRACEID_KEY, timestamp_key=xes_constants.DEFAULT_TIMESTAMP_KEY,
                    final_marking=None, return_visited_elements=False, semantics=petri_net.semantics.ClassicSemantics(),
                    add_only_if_fm_is_reached=True, fm_leq_accepted=False):
        """
        Do the playout of a Petrinet generating a log

        Parameters
        ----------
        net
            Petri net to play-out
        initial_marking
            Initial marking of the Petri net
        no_traces
            Number of traces to generate
        max_trace_length
            Maximum number of events per trace (do break)
        initial_timestamp
            Increased timestamp from 1970 for the first event
        initial_case_id
            Case id of the first event
        case_id_key
            Trace attribute that is the case ID
        activity_key
            Event attribute that corresponds to the activity
        timestamp_key
            Event attribute that corresponds to the timestamp
        final_marking
            If provided, the final marking of the Petri net
        semantics
            Semantics of the Petri net to be used (default: petri_net.semantics.ClassicSemantics())
        add_only_if_fm_is_reached
            Adds the case only if the final marking is reached
        fm_leq_accepted
            Accepts traces ending in a marking that is a superset of the final marking
        """
        # assigns to each event an increased timestamp from 1970
        curr_timestamp = self.startTime
        all_visited_elements = []
        
        no_traces = self.count
        i = 0
        for logic_gate in self.logic_gates.values():
            if logic_gate.type == "XOR":
                prop = 0
                for decision in logic_gate.logicGateDecisions.values():
                    prop += decision.probability
                if prop != 1:
                    raise ValueError(f"Sum of probabilities for XOR gateway {logic_gate.getLabel()} is not equal to 1.")

        while True:
            if len(all_visited_elements) >= no_traces:
                break

            if i >= no_traces:
                if not add_only_if_fm_is_reached:
                    break

                if len(all_visited_elements) == 0:
                    # likely, the final marking is not reachable, therefore terminate here the playout
                    break
            
            
            visited_elements = []
            visible_transitions_visited = []
            for logic_gate in self.logic_gates.values():
                current_propbability = 0
                for decision in list(logic_gate.logicGateDecisions.values()):
                    decision.arc.weight = 100
                
                for j, decision in enumerate(list(logic_gate.logicGateDecisions.values())):
                    if logic_gate.type == "AND":
                        decision.arc.weight = 1
                    else:
                        prop = decision.probability / (1 - current_propbability)
                        if prop >= random.random():
                            decision.arc.weight = 1
                            current_propbability = -100
                        current_propbability += decision.probability       
            marking = copy(initial_marking)
            while len(visible_transitions_visited) < max_trace_length:
                visited_elements.append(marking)

                if not semantics.enabled_transitions(net, marking):  # supports nets with possible deadlocks
                    break
                all_enabled_trans = semantics.enabled_transitions(net, marking)
                if final_marking is not None and final_marking <= marking and (final_marking == marking or fm_leq_accepted):
                    trans = choice(list(all_enabled_trans.union({None})))
                else:
                    trans = choice(list(all_enabled_trans))
                    
                if trans is None:
                    break

                visited_elements.append(trans)
                if trans.label is not None:
                    visible_transitions_visited.append(trans)

                marking = semantics.execute(trans, net, marking)
            if not add_only_if_fm_is_reached:
                all_visited_elements.append(tuple(visited_elements))
            elif final_marking == marking:
                all_visited_elements.append(tuple(visited_elements))
            elif final_marking <= marking and fm_leq_accepted:
                all_visited_elements.append(tuple(visited_elements))
            i = i + 1
        log:EventLog = log_instance.EventLog()
        curr_timestamp = traceStartTime = self.startTime
        traceDelta = (self.endTime - self.startTime).total_seconds() / len(all_visited_elements)

        for index, visited_elements in enumerate(all_visited_elements):
            trace = log_instance.Trace()
            trace.attributes[case_id_key] = str(index+initial_case_id)
            traceStartTime += timedelta(seconds=traceDelta)
            curr_timestamp = traceStartTime 
            for traceAttributeKey in self.trace_attributes.keys():
                current_propbability = 0
                for attr in self.trace_attributes[traceAttributeKey]:
                        prop = attr['percentage']/(1 - current_propbability)  
                        if prop >= random.random():
                            try:
                                trace.attributes[traceAttributeKey] = curr_timestamp.isoformat()
                                delta = datetime.strptime(attr['value'].split(".")[0], "%Y-%m-%dT%H:%M:%S") - datetime(year= 1970, month = 1, day = 1)
                                trace.attributes[traceAttributeKey] = curr_timestamp + delta
                            
                            except ValueError:
                                trace.attributes[traceAttributeKey] = attr['value']
                            break
                        current_propbability += attr['percentage']
            if self.places:       
                for element in visited_elements:
                    if type(element) is PetriNet.Transition and element.label is not None:
                        event = log_instance.Event()
                        event[activity_key] = element.label
                        trace.append(event)
                        event[timestamp_key] = curr_timestamp.isoformat()
                        curr_timestamp += self.places[element.label].getAttributeByProbability(timestamp_key)
                        for attrName in self.places[element.label].attributes.keys():
                            if not self.places[element.label].attributes[attrName]["type"] == "temporal":
                                event[attrName] = self.places[element.label].getAttributeByProbability(attrName)
                            else:
                                if attrName != "time:timestamp":
                                    value = self.places[element.label].getAttributeByProbability(attrName)
                                    if value == 'null':
                                        event[attrName] = value
                                    else:
                                        event[attrName] = datetime.strptime(event[timestamp_key].split(".")[0], "%Y-%m-%dT%H:%M:%S")+ value
                        
            log.append(trace)
            
        return log    
    def setStartTime(self,starttime:datetime):
        self.startTime = starttime
    
    def setEndTime(self,endtime:datetime):
        self.endTime = endtime
            


