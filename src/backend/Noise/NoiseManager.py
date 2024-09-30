from copy import deepcopy
from IDeviation import ideviation
from IDeviation.DeviationManager import DeviationManager
from Noise import Noise
import random
from pm4py.objects.log.obj import EventLog
from datetime import datetime

from Traces.TraceManager import TraceManager
class NoiseManager:
    def __init__(self):
        self.noise = 0
        self.skipNoise = 0
        self.insertNoise = 0
        self.swapNoise = 0
        self.reworkNoise = 0
        self.earlyNoise = 0
        self.lateNoise = 0
        self.noisy_log = None
        self.deviationNoise  = []
        self.deviationManager : DeviationManager
        self.TraceManager : TraceManager
        self.noiseIsDone = False
        
    def setGeneralNoise(self,noise:float):
        self.noise = noise
    
    def setSkipNoise(self,noise:float):
        self.skipNoise = noise
    
    def setInsertNoise(self, noise:float):
        self.insertNoise = noise
        
    def setSwapNoise(self, noise:float):
        self.swapNoise = noise
        
    def setReworkNoise(self, noise:float):
        self.reworkNoise = noise
    
    def setEarlyNoise(self, noise:float):  
        self.earlyNoise = noise
        
    def setLateNoise(self, noise:float):  
        self.lateNoise = noise
        
    def setDeviationNoise(self,deviationNoise):
       self.deviationNoise = deviationNoise   
          
    def setNoiseIsDone(self, noiseIsDone:bool):
        self.noiseIsDone = noiseIsDone
    
    def getNoiseIsDone(self):
        return self.noiseIsDone
    
    def setDeviationManager(self,deviationManager:DeviationManager):
        self.deviationManager = deviationManager
    
    def addNoiseToLog(self,log:EventLog):
        length = len(log)
        general_noiselog = Noise.insert_noise(log, self.noise,traceManager = self.trace_manager)
        new_log = EventLog()
        classes = _get_event_classes(log)
        for trace in general_noiselog:
            new_trace = deepcopy(trace)
            if random.random() <= self.skipNoise:
                new_trace = Noise._skip_event( new_trace)
            if random.random() <= self.insertNoise:
                new_trace = Noise._insert_event(new_trace,classes,traceManager = self.trace_manager) 
            if random.random() <= self.swapNoise:
                new_trace = Noise._swap_events(new_trace)
            if random.random() <= self.reworkNoise:
                new_trace = Noise._rework_event(new_trace,traceManager=self.trace_manager)
            if random.random() <= self.earlyNoise:
                new_trace = Noise._early_event(new_trace)
            if random.random() <= self.lateNoise:
                new_trace = Noise._late_event(new_trace)
            for deviationNoise in self.deviationNoise:
                found = False
                for deviation in self.deviationManager.deviation:
                    if not found: 
                        if deviation.name == deviationNoise[0]:
                            prev_events = []
                            for event in new_trace:
                                if deviation.is_applicable(prev_events,event,new_trace,False):
                                    if random.random() <= deviationNoise[1]:
                                        new_trace._list = deviation.execute(new_trace)
                                        found = True
                                        break
                                else:
                                    prev_events.append(event)
            new_log.append(new_trace)
        for trace in new_log:
            for event in trace:
                    for attrName in event.keys():
                        print(event[attrName])
                        try:
                            timestamp = self.getTimestamp(event[attrName])
                            event[attrName] = timestamp.replace(tzinfo=None).strftime("%Y-%m-%dT%H:%M:%S")
                            print(event[attrName])
                        except:
                            pass  
        self.noisy_log = new_log
        self.noiseIsDone = True
        return new_log
    
    def getTimestamp(self,time):
        if type(time) == datetime:
            return time
        if type(time) == float:
            return datetime.fromtimestamp(int(time))
        try: 
            return datetime.strptime(time.split('.')[0], "%Y-%m-%dT%H:%M:%S")
        except:
            return datetime.strptime(time.split('.')[0], "%Y-%m-%d %H:%M:%S")
           

def _get_event_classes(log):
    classes = set()
    for trace in log:
        for event in trace:
            classes.add(event)
    return classes  
    