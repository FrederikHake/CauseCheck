from datetime import datetime
from  IDeviation.ideviation import IDeviation

from pm4py.objects.petri_net.obj import PetriNet
from pm4py.util import xes_constants
from datetime import timedelta
from pm4py.objects.log import obj as log_instance

class ReplacementDeviation(IDeviation):
    def __init__(self,name, activities_to_replace: list, replacement_activities: list,traceManager):
        super().__init__(name)
        self.activities_to_replace = activities_to_replace
        self.replacement_activities = replacement_activities
        self.traceManager = traceManager

    def is_applicable(self,previousEvents,currentEvent,trace,checkConditions = True)-> bool:
        if currentEvent[xes_constants.DEFAULT_NAME_KEY] != self.activities_to_replace[-1]:
            return False
        for i, activity in enumerate(reversed(self.activities_to_replace[:-1])):
            if previousEvents[len(previousEvents)-i-1][xes_constants.DEFAULT_NAME_KEY] != activity:
                return False
        if checkConditions:
            return super().is_applicable(previousEvents,currentEvent,trace)
        return True

    def execute(self, trace) -> list:
        for i, event in enumerate(trace):
                fits = True
                if len(self.activities_to_replace) > 1:
                    for subevent in trace[i+1:i+len(self.activities_to_replace)]:
                        if subevent[xes_constants.DEFAULT_NAME_KEY] != event[xes_constants.DEFAULT_NAME_KEY]:
                            fits = False
                            break
                else:
                    if event[xes_constants.DEFAULT_NAME_KEY] != self.activities_to_replace[0]:
                        fits = False
                if fits:
                    newActivities = []
                    try:
                        current_time = datetime.strptime(trace[i-1]["time:timestamp"].split('.')[0], "%Y-%m-%dT%H:%M:%S")
                    except:
                        current_time = datetime.strptime(trace[i-1]["time:timestamp"].split('.')[0], "%Y-%m-%d %H:%M:%S")
                    timeadded = timedelta()
                    for j,element in enumerate(self.replacement_activities):
                        event = log_instance.Event()
                        event[xes_constants.DEFAULT_NAME_KEY] = element
                        
                        delta = self.traceManager.places[event[xes_constants.DEFAULT_NAME_KEY]].getAttributeByProbability("time:timestamp")
                        current_time += delta
                        timeadded += delta
                        event["time:timestamp"] = str(current_time)
                        delta = 0
                        for attrName in self.traceManager.places[event[xes_constants.DEFAULT_NAME_KEY]].attributes.keys():
                            if not self.traceManager.places[event[xes_constants.DEFAULT_NAME_KEY]].attributes[attrName]["type"] == "temporal":
                                event[attrName] = self.traceManager.places[event[xes_constants.DEFAULT_NAME_KEY]].getAttributeByProbability(attrName)
                            else:
                                if attrName != "time:timestamp":
                                    delta = self.traceManager.places[event[xes_constants.DEFAULT_NAME_KEY]].getAttributeByProbability(attrName)
                                    if delta == 'null' or delta == '':
                                        event[attrName] = 'null'
                                    else:
                                        event[attrName] = str(current_time+delta)
                        newActivities.append(event)
                    for event in trace[i+len(self.activities_to_replace):]:
                        try:
                             event["time:timestamp"] = datetime.strptime(event["time:timestamp"].split('.')[0], "%Y-%m-%dT%H:%M:%S")+ timeadded
                        except:
                            event["time:timestamp"] = event["time:timestamp"]+ timeadded
                    trace = trace[:i] + newActivities + trace[i+len(self.activities_to_replace):]
        return trace

