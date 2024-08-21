import datetime
import random
from pm4py.objects.log.obj import EventLog

class CurrentAttributeCondition:
    def __init__(self,   attribute_name, attribute_value, sign,probability):
        self.attribute_name = attribute_name
        self.attribute_value = attribute_value
        self.sign = sign
        self.probability = probability
        if type(self.attribute_value) == datetime.timedelta: 
            self.attribute_value = self.attribute_value.total_seconds()

    def is_satisfied(self,previousEvents,currentEvent,trace):
        for attribute in trace.attributes:
            if attribute == self.attribute_name:
                if  type(trace.attributes[attribute]) == str and trace.attributes[attribute]== "null":
                    continue
                if self.probability > random.random():
                    current_value = trace.attributes[attribute]
                    if isinstance(current_value, datetime.datetime):
                        current_value = current_value
                        
                        previous_value = previousEvents[0].get("time:timestamp")
                        if previous_value is None:
                            previous_value = datetime.datetime(1970, 1, 1)
                        if type(current_value) != datetime.datetime:
                            try:
                                current_value = datetime.datetime.strptime(str(current_value).split('.')[0], "%Y-%m-%dT%H:%M:%S")
                            except:
                                current_value = datetime.datetime.strptime(str(current_value).split('.')[0], "%Y-%m-%d %H:%M:%S")
                        if type(previous_value) != datetime.datetime:
                            try:
                                previous_value = datetime.datetime.strptime(str(previous_value).split('.')[0], "%Y-%m-%dT%H:%M:%S")
                            except:
                                previous_value = datetime.datetime.strptime(str(previous_value).split('.')[0], "%Y-%m-%d %H:%M:%S")
                        current_value = current_value - previous_value
                        current_value = current_value.total_seconds() 
                    elif type(current_value) == str and current_value.isnumeric() or type(current_value) == float: 
                        current_value = float(current_value)
                    else:
                        current_value = current_value
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
