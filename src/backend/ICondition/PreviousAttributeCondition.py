import random
from pm4py.objects.log.obj import EventLog
import datetime 

class PreviousAttributeCondition:
    def __init__(self,  activity_name, attribute_name, attribute_value, sign,probability):
        self.activity_name = activity_name
        self.attribute_name = attribute_name
        self.attribute_value = attribute_value
        self.sign = sign
        self.probability = probability
        if type(self.attribute_value) == datetime.timedelta: 
            self.attribute_value = self.attribute_value.total_seconds()
        if type(self.attribute_value) == datetime.datetime: 
            self.attribute_value = self.attribute_value- datetime.datetime(1970, 1, 1)


    def is_satisfied(self, previousEvents,currentEvent,trace):
        if self.probability > random.random():
            for i, event in enumerate(previousEvents):
                if self.check_attribute(event,previousEvents,i):
                    return True
            if currentEvent["concept:name"] == self.activity_name and self.check_attribute(currentEvent,previousEvents,len(previousEvents)):
                return True    

        return False
    def check_attribute(self,event,previousEvents,i):
        current_value = event.get(self.attribute_name)
        
        if  type(current_value) == str and current_value == "null":
            return False
        try: 
            current_value = datetime.datetime.strptime(current_value.split(".")[0], "%Y-%m-%dT%H:%M:%S")
        except:
            if type(event.get(self.attribute_name)) == str and event.get(self.attribute_name).isnumeric() or type(event.get(self.attribute_name)) == float: 
                current_value = float(event.get(self.attribute_name))
            else:
                current_value = event.get(self.attribute_name) 
        if type(current_value) == datetime.datetime: 
            if i == 0 and self.attribute_name == "time:timestamp": 
                current_value = 0
            else: 
                previous_value = datetime.datetime(1970, 1, 1)
                if self.attribute_name == "time:timestamp":
                    previous_value = previousEvents[i-1].get(self.attribute_name)
                else:
                    previous_value = previousEvents[i].get("time:timestamp")
                
        current_value = current_value
        previous_value = datetime.datetime.strptime(previous_value.split(".")[0], "%Y-%m-%dT%H:%M:%S")
        current_value = current_value - previous_value
        current_value = current_value.total_seconds() 
        
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

