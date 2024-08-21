import datetime
from IDeviation.ideviation import IDeviation
from pm4py.util import xes_constants
from datetime import timedelta, datetime

class SkipDeviation(IDeviation):
    def __init__(self,name, activities_to_skip: list):
        super().__init__(name)
        self.activities_to_skip = activities_to_skip


    def is_applicable(self, previousEvents, currentEvent,trace,checkConditions = True) -> bool:
        if currentEvent["concept:name"] != self.activities_to_skip[-1]:


            return False
        for i, activity in enumerate(reversed(self.activities_to_skip[:-1])):
            if previousEvents[len(previousEvents)-i-1][xes_constants.DEFAULT_NAME_KEY] != activity:
                return False

        if checkConditions:
            return super().is_applicable(previousEvents,currentEvent,trace)
        return True

    def execute(self, trace):
        new_events = []
        skip_len = len(self.activities_to_skip)
        trace_len = len(trace)
        i = 0
        timeDelta = 0 

        while i < trace_len:
            # Check for the skip sequence
            if i <= trace_len - skip_len and all(trace[i + j]["concept:name"] == self.activities_to_skip[j] for j in range(skip_len)):
                i += skip_len  # Skip this sequence
                if i >= skip_len:
                    first_time = datetime.strptime(trace[i-skip_len-1]["time:timestamp"].split(".")[0], "%Y-%m-%dT%H:%M:%S")
                    second_time = datetime.strptime(trace[i-1]["time:timestamp"].split(".")[0], "%Y-%m-%dT%H:%M:%S")
                    timeDelta +=  datetime.timestamp(first_time) -  datetime.timestamp(second_time)  
            else:
                time = datetime.strptime(trace[i]["time:timestamp"].split(".")[0], "%Y-%m-%dT%H:%M:%S")
                trace[i]["time:timestamp"] = datetime.fromtimestamp(datetime.timestamp(time) + timeDelta).isoformat()
                new_events.append(trace[i])
                
                i += 1

        return new_events
    # 0 , 1 ,2 ,3 ,4 
    # 1 , 2 ,3 ,4 ,5
    