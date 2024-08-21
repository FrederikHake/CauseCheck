from abc import ABC, abstractmethod

from ICondition.ICondition import ICondition

class IDeviation(ABC):
    def __init__(self,name):
        self.condition : list[ICondition] = []
        self.name = name
        pass

    
    def is_applicable(self,previousEvents,currentEvent,trace,checkConditions = True) -> bool:
        for condition in self.condition:
            if  condition.is_satisfied(previousEvents,currentEvent,trace):
                return True      
        return False

    @abstractmethod
    def execute(self, trace: list) -> list:
        pass
    
    def addConition(self,condition):
        self.condition.append(condition)
        


