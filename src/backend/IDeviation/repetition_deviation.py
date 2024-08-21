import numpy as np
from IDeviation.ideviation import IDeviation
from pm4py.util import xes_constants
from datetime import timedelta, datetime
import random
from copy import deepcopy
from pm4py.objects.log import obj as log_instance

from Traces.TraceManager import TraceManager

class RepetitionDeviation(IDeviation):
    def __init__(self,name, activities_to_repeat_after: list, repetitions: int = 1, place: list = None, trace_manager: TraceManager = None):
        super().__init__(name)
        self.activities_to_repeat_after = activities_to_repeat_after
        self.repetitions = repetitions
        self.place = place  # This should be a list of lists, where each sublist is a sequence to match
        self.conditions = []
        self.trace_manager = trace_manager


    def is_applicable(self,previousEvents,currentEvent,trace,checkConditions = True) -> bool:
        if len(previousEvents) + 1 < len(self.activities_to_repeat_after):
            return False
        if currentEvent["concept:name"] != self.activities_to_repeat_after[-1]:
            return False
        for i, activity in enumerate(reversed(self.activities_to_repeat_after[:-1])):
            if previousEvents[len(previousEvents) - i - 1]["concept:name"] != activity:
                return False
        found = False
        for i, activity in enumerate(reversed(previousEvents)):
            if activity["concept:name"] == self.place[-1]:
                for j, place_activity in enumerate(reversed(self.place)):
                    if previousEvents[len(previousEvents) - i -j - 1]["concept:name"] != place_activity:
                        break
                    elif j == len(self.place) - 1:
                        found = True
                        break
        if found == False:
            return False            
        if checkConditions:
            return super().is_applicable(previousEvents,currentEvent,trace)
        return True

    def execute(self, trace) -> list:
            insertion_indices = []
            mod_trace = deepcopy(trace)
            # Identify all occurrences of 'place' events
            for i in range(len(mod_trace)):
                if mod_trace[i]["concept:name"] == self.activities_to_repeat_after[0] and len(insertion_indices) == 0:
                    for j, activity_to_repeat in enumerate(self.activities_to_repeat_after):
                        if mod_trace[i + j]["concept:name"] != activity_to_repeat:
                            break
                        elif j == len(self.activities_to_repeat_after) - 1:
                            insertion_indices.append(i + len(self.activities_to_repeat_after) - 1)
                            break      
                    
            # No places found, return the mod_trace unchanged
            if not insertion_indices:
                return mod_trace._list
            first_instance_index = None 
            for i, event in enumerate(mod_trace):
                if event["concept:name"] == self.place[0] and first_instance_index is None:
                    for j, repetition in enumerate(self.place):
                        if mod_trace[i + j]["concept:name"] != repetition:
                            break
                        elif j == len(self.place) - 1:
                            first_instance_index = i
                            break
                    break
            if first_instance_index is None:
                return trace._list
            event_time_delta = []
            for i in range(first_instance_index, first_instance_index + len(self.activities_to_repeat_after)):
                if i == 0:
                    for j, curr_place in enumerate(self.place):
                         event_time_delta.append(self.trace_manager.places[mod_trace[i+j]["concept:name"]].getAttributeByProbability("time:timestamp"))
                else:
                    for j in range(len(self.place)):
                        event_time_delta.append(datetime.fromisoformat(mod_trace[i+j]["time:timestamp"]) - datetime.fromisoformat(mod_trace[i - 1]["time:timestamp"]))
                # Perform repetitions
            
            time_delta =  timedelta()
            insertion_point = []
            for _ in range(self.repetitions):
                # Random insertion point after the current index
                if insertion_indices[0] + 1 < len(mod_trace): 
                    new_insertion_point = random.randint(insertion_indices[0] + 1, len(mod_trace) - 1)
                    while new_insertion_point in insertion_point:
                        new_insertion_point +=1
                    insertion_point.append(new_insertion_point)
                else:
                    # If the event is at the end, append directly
                    insertion_point.append(len(mod_trace) - 1)
            insertion_point.sort()
            prevpoint = -1
            offset = 0
            for point in insertion_point:
                if prevpoint == point:
                    offset += len(activity_to_repeat)
                    point += len(activity_to_repeat)
                prevpoint = point
            for _ in range(self.repetitions):
                i = insertion_point[0]
                current_insertion_point = random.randint(insertion_point[0], len(mod_trace) )
                while i < len(mod_trace) or i <max(insertion_point):
                    if i == current_insertion_point:
                        for j, activity_to_repeat in enumerate(self.place):
                            
                            new_event = deepcopy(mod_trace[first_instance_index + j])
                            currenttime_delta = event_time_delta[j]
                            currentTimeStamp = datetime(1970,1,1)
                            if 0 == i:
                                currentTimeStamp = datetime.fromisoformat(mod_trace[0]["time:timestamp"]) - event_time_delta[j]
                            elif i < len(mod_trace):
                                currentTimeStamp = datetime.fromisoformat(mod_trace[i-1]["time:timestamp"])
                                
                                time_delta += event_time_delta[j]
                            else:
                                if i < len(mod_trace):
                                    currentTimeStamp = datetime.fromisoformat(mod_trace[i]["time:timestamp"])
                                else:
                                    currentTimeStamp = datetime.fromisoformat(mod_trace[-1]["time:timestamp"])
                                
                                time_delta += event_time_delta[j]
                            new_event["time:timestamp"] = (currentTimeStamp + currenttime_delta).isoformat()

                            mod_trace.insert(i , new_event)
                            i = i+1    
                    
                    if i < len(mod_trace):
                        mod_trace[i]["time:timestamp"] = datetime.fromtimestamp(datetime.timestamp(datetime.fromisoformat(mod_trace[i]["time:timestamp"]))+ time_delta.total_seconds()).isoformat()
                        i = i + 1        
                           

            return mod_trace._list