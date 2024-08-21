
from copy import deepcopy
from datetime import timedelta,datetime
from  IDeviation.ideviation import IDeviation

from pm4py.util import xes_constants

from Traces.TraceManager import TraceManager

class SwapDeviation(IDeviation):
    def __init__(self,name, activities_to_swap: list, activities_to_swap_with: list, traceManager: TraceManager):
        super().__init__(name)
        self.activities_to_swap = activities_to_swap
        self.activities_to_swap_with = activities_to_swap_with
        self.traceManager:TraceManager = traceManager

    def is_applicable(self,previousEvents,currentEvent,trace,checkConditions = True) -> bool:
        if currentEvent[xes_constants.DEFAULT_NAME_KEY] != self.activities_to_swap[-1]:
            return False
        for i, activity in enumerate(reversed(self.activities_to_swap[:-1])):
            if previousEvents[len(previousEvents)-i-1][xes_constants.DEFAULT_NAME_KEY] != activity:
                return False

            
        if checkConditions:
            return super().is_applicable(previousEvents,currentEvent,trace)
        return True

    def execute(self, trace: list) -> list:
        swap_len = len(self.activities_to_swap)
        trace_len = len(trace)
        swapIndex= 0
        acts = []
        found = False
        activity0Time = deepcopy(trace[0]['time:timestamp'])
        # search swap index
        for i in range(trace_len - swap_len + 1):
            found_i = 0
            if not found:
                for event in trace[i:i+swap_len]:
                    for j,activity in enumerate(self.activities_to_swap):
                        if event[xes_constants.DEFAULT_NAME_KEY] == activity and not found:
                            swapIndex = i
                            found += 1
                            
                        if found == swap_len:
                            found = True
        # add swaps to array
        counter = 0 
        activitiesToSwap = []
        for i in range(swapIndex,swapIndex+swap_len):
            activitiesToSwap.append(trace[i])
        
        # search swap with index
        activitiesToSwapWith = []
        counter = 0
        swapWithIndex = 0
        timeDiffenceSwap = []
        timeDiffenceSwapWith = []

        for i, activity in enumerate(trace):
            if activity[xes_constants.DEFAULT_NAME_KEY] == self.activities_to_swap_with[counter]:
                counter += 1
                activitiesToSwapWith.append(activity)
                if counter == len(self.activities_to_swap_with):
                    swapWithIndex = i - len(self.activities_to_swap_with) + 1
                    break
            else:
                counter = 0
                activitiesToSwapWith = []
            
        for i in range(swapIndex,swapIndex+swap_len):
            if i == 0:
                timeDiffenceSwap.append(self.traceManager.places[trace[0][xes_constants.DEFAULT_NAME_KEY]].getAttributeByProbability("time:timestamp"))
            else:
                timeDiffenceSwap.append((self.getTimestamp(trace[i]["time:timestamp"])) - self.getTimestamp(trace[i-1]["time:timestamp"]))
        for i in range(swapWithIndex,swapWithIndex+len(self.activities_to_swap_with)):
            if i == 0:
                timeDiffenceSwapWith.append(self.traceManager.places[trace[0][xes_constants.DEFAULT_NAME_KEY]].getAttributeByProbability("time:timestamp"))
            else:
                timeDiffenceSwapWith.append(self.getTimestamp(trace[i]["time:timestamp"]) - self.getTimestamp(trace[i-1]["time:timestamp"]))
        if swapIndex < swapWithIndex:
            newtrace = deepcopy(trace[0:swapIndex]) + deepcopy(activitiesToSwapWith) + deepcopy(trace[swapIndex+len(self.activities_to_swap):swapWithIndex]) + deepcopy(activitiesToSwap) + deepcopy(trace[swapWithIndex+len(activitiesToSwapWith):len(trace)])
        else:
            newtrace = deepcopy(trace[0:swapWithIndex]) + deepcopy(activitiesToSwap) + deepcopy(trace[swapWithIndex+len(self.activities_to_swap_with):swapIndex]) + deepcopy(activitiesToSwapWith) + deepcopy(trace[swapIndex+len(activitiesToSwap):len(trace)])
        timeSwapWith = timedelta()
        timeSwap = timedelta()
        if swapIndex == 0 :
            timeSwap += timeDiffenceSwap[0]
            newtrace[0]['time:timestamp'] = activity0Time
        if swapWithIndex == 0:
            timeSwapWith += timeDiffenceSwapWith[0]
            newtrace[0]['time:timestamp'] = activity0Time
        swapIndexcount = 0
        swapWithIndexcount = 0
        for i,activity in enumerate(newtrace[1:],1):
            if i >=swapIndex and i <= swapIndex + len(self.activities_to_swap_with)-1:
                timeSwap += timeDiffenceSwapWith[swapWithIndexcount]
                newtrace[i]['time:timestamp'] = self.getTimestamp(newtrace[i-1]['time:timestamp'])+ timeDiffenceSwapWith[swapWithIndexcount]
                swapWithIndexcount += 1
            elif i >= swapWithIndex and i <= swapWithIndex + swap_len-1:
                timeSwapWith += timeDiffenceSwap[swapIndexcount]
                newtrace[i]['time:timestamp'] = self.getTimestamp(newtrace[i-1]['time:timestamp'])+ timeDiffenceSwap[swapIndexcount]
                swapIndexcount += 1
            elif swapWithIndex + swap_len-1< i < swapIndex-swap_len+len(self.activities_to_swap_with) :
                newtrace[i]['time:timestamp'] = self.getTimestamp(newtrace[i-1]['time:timestamp'])+ timeSwapWith
            elif swapIndex +len(self.activities_to_swap_with)-1< i < swapWithIndex +swap_len -len(self.activities_to_swap_with) :
                newtrace[i]['time:timestamp'] = self.getTimestamp(newtrace[i-1]['time:timestamp'])+ timeSwap
            
         
        return newtrace    
                
    def getTimestamp(self,time):
        if type(time) == datetime:
            return time
        return datetime.strptime(time.split('.')[0], "%Y-%m-%dT%H:%M:%S")

    
