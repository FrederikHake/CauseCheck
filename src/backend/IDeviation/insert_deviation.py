from datetime import timedelta, datetime
import random
from IDeviation.ideviation import IDeviation
from pm4py.objects.petri_net.obj import PetriNet
from pm4py.util import xes_constants
from pm4py.objects.log import obj as log_instance

class InsertDeviation(IDeviation):
    def __init__(self,name , activities_to_insert, repetitions, traceManager):
        super().__init__(name)
        self.activities_to_insert = activities_to_insert
        self.repetitions = repetitions
        self.traceManager = traceManager

    def is_applicable(self, previousEvents, currentEvent,trace,checkConditions = True):
        if checkConditions:
            return super().is_applicable(previousEvents, currentEvent,trace,checkConditions)
        return True

    def parse_timestamp(self, timestamp_str):
        for fmt in ("%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(timestamp_str, fmt)
            except ValueError:
                continue
        raise ValueError(f"time data '{timestamp_str}' does not match any known format")

    def execute(self, trace):
        # Ensure the position is within the valid range
        position = len(trace) -1
        fits = False
        for i, event in enumerate(trace):
            if event["concept:name"] == self.activities_to_insert[0] and not fits:
                for j, subevent in enumerate(trace[i:i+len(self.activities_to_insert)], i):
                    if subevent[xes_constants.DEFAULT_NAME_KEY] != trace[j][xes_constants.DEFAULT_NAME_KEY]:
                        break
                    if j - i == len(self.activities_to_insert) - 1:
                        fits = True
                        position = random.randint(i+len(self.activities_to_insert), len(trace))
        newActivities = []
        if position == 0:
            current_time = self.parse_timestamp(trace[0]["time:timestamp"])
        else:
            current_time = self.parse_timestamp(trace[position - 1]["time:timestamp"])
        timeadded = timedelta()
        for _ in range(self.repetitions):
            for i,element in enumerate(self.activities_to_insert):
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


        trace._list = trace._list[:position] + newActivities + trace._list[position:]
        # Adjust timestamps of subsequent events if not inserting at the end
        if position < len(trace._list):
            for event in trace._list[position+len(self.activities_to_insert):]:
                try:
                    try: 
                        event["time:timestamp"] = datetime.strptime(event["time:timestamp"].split('.')[0], "%Y-%m-%dT%H:%M:%S")+ timeadded
                    except:
                        event["time:timestamp"] = datetime.strptime(event["time:timestamp"].split('.')[0], "%Y-%m-%d %H:%M:%S")+ timeadded
                except:
                    event["time:timestamp"] = event["time:timestamp"]+ timeadded
        return trace._list