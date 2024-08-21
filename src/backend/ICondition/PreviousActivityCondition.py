import random
from pm4py.objects.log.obj import EventLog

class PreviousActivityCondition:
    def __init__(self,  activity_name,probability):
        self.activity_name = activity_name
        self.probability = probability

    def is_satisfied(self, previousEvents,currentEvent,trace):
        for idx, event in enumerate(previousEvents):
            if event['concept:name'] == self.activity_name:
                if self.probability > random.random():
                    return True
        return False
