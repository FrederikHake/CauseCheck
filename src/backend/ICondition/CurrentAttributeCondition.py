import random
from pm4py.objects.log.obj import EventLog

class CurrentAttributeCondition:
    def __init__(self,   attribute_name, attribute_value, sign,probability):
        self.attribute_name = attribute_name
        self.attribute_value = attribute_value
        self.sign = sign
        self.probability = probability

    def is_satisfied(self,previousEvents,currentEvent,trace):
        if self.probability > random.random():
            current_value = currentEvent.get(self.attribute_name)
            if current_value is not None:
                if self.sign == '=' and current_value == self.attribute_value:
                    return True
                elif self.sign == '>' and current_value > self.attribute_value:
                    return True
                elif self.sign == '>=' and current_value >= self.attribute_value:
                    return True
                elif self.sign == '<' and current_value < self.attribute_value:
                    return True
                elif self.sign == '<=' and current_value <= self.attribute_value:
                    return True
                elif self.sign == '!=' and current_value != self.attribute_value: 
                    return True
        return False
