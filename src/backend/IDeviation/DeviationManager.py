import pm4py
class DeviationManager:
    def __init__(self):
        self.deviation = []
        
    def addDeviation(self, deviation):
        self.deviation.append(deviation)
    
    def applyDeviationsToEventLog(self, eventLog):
        newTraces = pm4py.objects.log.obj.EventLog()
        for i, trace in enumerate(eventLog):
            prev_events = []
            
            modified_trace = trace
            modified = False
            for event in trace._list:
                for deviation in self.deviation :
                    if not modified and deviation.is_applicable(prev_events, event,trace) :
                        atts = trace._attributes
                        modified_trace._attributes = atts
                        modified_trace._events = deviation.execute(modified_trace)
                        modified_trace._list = modified_trace._events 
                        modified_trace._attributes = atts
                        modified = True
                        break
                prev_events.append(event)
            newTraces.append(modified_trace)
        return newTraces
    