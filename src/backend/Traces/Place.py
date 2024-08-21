from Traces.LogicGate import LogicGate
from datetime import datetime, timedelta
import random
from pm4py.objects.petri_net.obj import PetriNet
from collections import defaultdict
import numpy as np
 
class Place:
    def __init__(self, name:str, petriNet:PetriNet):
        self.name : str = name
        self.nextPlace : 'Place' = None
        self.logicGate : 'LogicGate' = None
        self.petriNet : PetriNet = petriNet
        self.selection_counts = self.init_selection_counts()
        self.attributes = {}
       
    def init_selection_counts(self):
        return defaultdict(self.default_dict_factory)
   
    def default_dict_factory(self):
        return defaultdict(int)
 
    def setLogicGate(self, logicGate: LogicGate):
        if self.nextPlace is not None:
            raise Exception("Both a following place and a logic gate are not possible")
        if self.logicGate is not None:
            self.logicGate.removePreviousPlace(self)
        self.logicGate = logicGate
        self.logicGate.addPreviousPlace(self)
 
    def addAttribute(self, attribute):
        self.attributes[attribute["name"]] = attribute
 
    def select_attribute_by_probability(self, attributes, transition_name):
        selected_attributes = []
        for attr_type in ['numerical', 'string']:
            filtered_attrs = [attr for attr in attributes if attr["type"] == attr_type]
            if not filtered_attrs:
                continue
 
            total_counts = sum(self.selection_counts[transition_name][attr["name"]] for attr in filtered_attrs)
            weighted_choices = []
            for attr in filtered_attrs:
                current_count = self.selection_counts[transition_name][attr["name"]]
                weight = attr["probability"] * (total_counts - current_count + 1)
                weighted_choices.append((attr, weight))
 
            total_weight = sum(weight for _, weight in weighted_choices)
            random_choice = random.uniform(0, total_weight)
            cumulative_weight = 0
            for attr, weight in weighted_choices:
                cumulative_weight += weight
                if random_choice <= cumulative_weight:
                    selected_attributes.append(attr)
                    self.selection_counts[transition_name][attr["name"]] += 1
                    break
        return selected_attributes
 
    def getAttributeByProbability(self, attributeName):
        previous_probability = 0
        if self.attributes[attributeName]["type"] == "temporal":
            for attr in self.attributes[attributeName]["values"]:
                
                if attr[1] + previous_probability >= random.random():
                    
                    if attr[0] == 'null' or attr[0] == '':
                        return 'null'
                    mean = attr[0].total_seconds()
                    value = np.random.normal(mean, mean / 10)
                    return timedelta(seconds=value)
                else:
                    previous_probability += attr[1]
        else:
            for attr in self.attributes[attributeName]["values"]:
                

                if attr[1] + previous_probability >= random.random():
                    if self.attributes[attributeName]["type"] == "numerical":
                        if attr[0] == 'null' or attr[0] == '':
                            return 'null'
                        return np.random.normal(float(attr[0]), float(attr[0]) / 10)
                    else:
                        if attr[0] == 'null' or attr[0] == '':
                            return 'null'
                        return attr[0]
                else:
                    previous_probability += attr[1]
 
    def create_transition_attributes(self, attributes, current_time: datetime):
        self.validate_total_probability(attributes)
        selected_attributes = self.select_attribute_by_probability(attributes)
 
        result = []
        transition_data = []
        for attr in selected_attributes:
            if attr["type"] == "temporal" and type(attr["value"])!= str:
                delta = attr["value"]
                if current_time:
                    current_time += delta
                    attr["value"] = current_time.isoformat()
            self.attributes.append(attr)