from abc import abstractmethod


class ICondition:
    def __init__(self):
        pass
        
    @abstractmethod
    def is_satisfied(self,previousEvents,currentEvent,trace) -> bool:
        pass

