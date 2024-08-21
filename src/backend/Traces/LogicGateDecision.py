
from pm4py.objects.petri_net.obj import PetriNet


class LogicGateDecision:
    def __init__(self,probability:float,index: int,arc:PetriNet.Arc ):
        self.probability : float = probability
        self.index : int = index
        self.arc :PetriNet.Arc = arc 
    def setProbability(self,probability):
        self.probability = probability
    def getProbability(self):
        return self.probability